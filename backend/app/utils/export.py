import csv
import io
from typing import Any

from fpdf import FPDF
from fastapi.responses import StreamingResponse


def csv_response(rows: list[dict[str, Any]], filename: str) -> StreamingResponse:
    output = io.StringIO()
    if not rows:
        writer = csv.writer(output)
        writer.writerow(["No data"])
    else:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


def build_pdf_base(f):
    class ReportPDF(FPDF):
        def header(self):
            self.set_font("Helvetica", "B", 10)
            self.cell(0, 6, "NEURON - Organizational Intelligence Platform", align="C")
            self.ln(8)

        def footer(self):
            self.set_y(-12)
            self.set_font("Helvetica", "I", 7)
            self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")

    pdf = ReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_font("Helvetica", "", 9)
    f(pdf)
    buf = pdf.output(dest="S")
    if isinstance(buf, str):
        buf = buf.encode("latin-1", errors="replace")
    return buf


def pdf_response(title: str, sections: list[tuple[str, list[tuple[str, str]]]]) -> bytes:
    return build_pdf_base(
        lambda pdf: _build_pdf(pdf, title, sections)
    )


def _build_pdf(
    pdf: FPDF, title: str, sections: list[tuple[str, list[tuple[str, str]]]]
) -> None:
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    for section_title, items in sections:
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(30, 144, 255)
        pdf.cell(0, 7, section_title, new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)

        pdf.set_font("Helvetica", "", 9)
        for label, value in items:
            pdf.cell(60, 5, label)
            pdf.cell(0, 5, value, new_x="LMARGIN", new_y="NEXT")
        pdf.ln(3)
