import httpx
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.database.models import RawEvent

router = APIRouter()


class GitHubConfig(BaseModel):
    token: str
    repo: str
    owner: str


@router.post("/github/ingest")
async def ingest_github(body: GitHubConfig, org_id: str, db: AsyncSession = Depends(get_db)):
    headers = {
        "Authorization": f"Bearer {body.token}",
        "Accept": "application/vnd.github.v3+json",
    }

    async with httpx.AsyncClient(timeout=30, headers=headers) as client:
        commits_resp = await client.get(
            f"https://api.github.com/repos/{body.owner}/{body.repo}/commits?per_page=50"
        )
        if commits_resp.status_code != 200:
            raise HTTPException(status_code=400, detail=f"GitHub API error: {commits_resp.text}")
        commits = commits_resp.json()

        pulls_resp = await client.get(
            f"https://api.github.com/repos/{body.owner}/{body.repo}/pulls?state=all&per_page=50"
        )
        pulls = pulls_resp.json() if pulls_resp.status_code == 200 else []

    count = 0
    for c in commits:
        sha = c.get("sha", "")
        author = c.get("commit", {}).get("author", {})
        date_str = author.get("date")
        occurred_at = datetime.fromisoformat(date_str.replace("Z", "+00:00")) if date_str else datetime.now(timezone.utc)

        event = RawEvent(
            organization_id=org_id,
            source="github",
            event_type="commit",
            subject=c.get("commit", {}).get("message", "").split("\n")[0][:200],
            body=c.get("commit", {}).get("message", ""),
            extra_data={
                "sha": sha,
                "author": author.get("name", "unknown"),
                "repo": body.repo,
                "url": c.get("html_url", ""),
            },
            occurred_at=occurred_at,
        )
        db.add(event)
        count += 1

    for pr in pulls:
        title = pr.get("title", "")
        date_str = pr.get("created_at", "")
        occurred_at = datetime.fromisoformat(date_str.replace("Z", "+00:00")) if date_str else datetime.now(timezone.utc)

        event = RawEvent(
            organization_id=org_id,
            source="github",
            event_type="pull_request",
            subject=title,
            body=pr.get("body", ""),
            extra_data={
                "pr_number": pr.get("number"),
                "state": pr.get("state", "open"),
                "author": pr.get("user", {}).get("login", "unknown"),
                "url": pr.get("html_url", ""),
                "repo": body.repo,
            },
            occurred_at=occurred_at,
        )
        db.add(event)
        count += 1

    await db.commit()
    return {"ingested": count, "source": "github", "repo": f"{body.owner}/{body.repo}"}
