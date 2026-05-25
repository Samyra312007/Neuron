from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.router import router as api_router
from app.database.session import engine, Base, async_session
from app.database.models import Organization
from app.seed.seed_data import seed_database
from app.config import settings

app = FastAPI(
    title="NEURON API",
    description="Organizational Nervous System",
    version="0.1.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        result = await session.execute(select(Organization).limit(1))
        org = result.scalar_one_or_none()
        if not org:
            org_id = await seed_database(session)
            print(f"Database seeded with organization ID: {org_id}")
        else:
            print(f"Database already seeded. Organization: {org.name} ({org.id})")
