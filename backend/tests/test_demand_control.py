from datetime import date
from io import BytesIO
import unittest
from uuid import uuid4
import zipfile

from pydantic import ValidationError

from app.demand_domain import calculate_deadline, deadline_status, normalize_legacy_status, normalize_text
from app.demand_schemas import DemandInput, PaymentInput
from app.demand_importer import analyze_legacy_workbook, parse_excel_date, parse_money


class DemandDomainTests(unittest.TestCase):
    def test_default_deadline_uses_calendar_days(self):
        self.assertEqual(calculate_deadline(date(2026, 7, 3), 7), date(2026, 7, 10))

    def test_reaching_limit_is_outside_deadline(self):
        self.assertEqual(
            deadline_status(date(2026, 7, 1), 7, today=date(2026, 7, 7)),
            "Dentro do prazo",
        )
        self.assertEqual(
            deadline_status(date(2026, 7, 1), 7, today=date(2026, 7, 8)),
            "Fora do prazo",
        )

    def test_partner_name_normalization_ignores_accents_case_and_spaces(self):
        self.assertEqual(normalize_text("  João   da Silva "), "JOAO DA SILVA")

    def test_legacy_status_normalization(self):
        self.assertEqual(normalize_legacy_status("PAGAMENTO NAO REALIZADO"), "Não realizado")
        self.assertEqual(normalize_legacy_status("Concluida"), "Concluída")

    def test_finished_date_cannot_precede_arrival(self):
        with self.assertRaises(ValidationError):
            DemandInput(
                client_bank_id=uuid4(),
                os_number="OS-1",
                arrival_date=date(2026, 7, 3),
                city="Salvador",
                state_code="BA",
                system_finished_at=date(2026, 7, 2),
            )

    def test_paid_payment_requires_date(self):
        with self.assertRaises(ValidationError):
            PaymentInput(
                demand_id=uuid4(),
                amount_due=100,
                payment_status="Pagamento realizado",
            )

    def test_excel_dates_and_brazilian_money(self):
        self.assertEqual(parse_excel_date("44805"), date(2022, 9, 1))
        self.assertEqual(str(parse_money("R$ 1.234,56")), "1234.56")

    def test_legacy_import_ignores_ref_and_maps_banks(self):
        workbook = _minimal_legacy_workbook()
        analysis = analyze_legacy_workbook(workbook)
        self.assertEqual(analysis["report"]["valid_demands"], 2)
        self.assertEqual({item["bank_acronym"] for item in analysis["demands"]}, {"BB", "CAIXA"})
        bb = next(item for item in analysis["demands"] if item["bank_acronym"] == "BB")
        self.assertIsNone(bb["partner_profile"]["state_code"])
        self.assertEqual(bb["partner_profile"]["phone"], "71999990000")


def _inline_cell(reference, value):
    if value is None:
        return ""
    safe = str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return f'<c r="{reference}" t="inlineStr"><is><t>{safe}</t></is></c>'


def _sheet_xml(rows):
    body = []
    for index, values in enumerate(rows, start=1):
        cells = "".join(_inline_cell(f"{chr(65 + column)}{index}", value) for column, value in enumerate(values))
        body.append(f'<row r="{index}">{cells}</row>')
    return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + "".join(body) + "</sheetData></worksheet>"


def _minimal_legacy_workbook():
    sheets = {
        "BANCO BRASIL": [
            ["Data chegada", "Prazo", "Numero OS", "Valor", "Engenheiro", "Art", "Parceiro", "Valor Honorario Parceiro", "Cidade", "Estado", "Situação"],
            ["44805", "44812", "BB-1", "380", "ANA", "ART PAGA", "JOAO", "100", "SALVADOR", "BA", "Entregue"],
        ],
        "CAIXA ECOMICA": [
            ["Data", "Prazo", "Numero OS", "Numero final os", "Valor", "Engenheiro", "Art", "Parceiro", "Honorario", "Cidade", "Estado", "Entregue", "Finalizada", "Dias", "Prazo", "Parceiro", "Siopi", "Obs", "Pagamento"],
            ["44805", "44812", "CX-1", "1", "515,28", "PABLO", "ART PAGA", "MARIA", "120", "LAURO DE FREITAS", "BA", None, None, None, None, "Entregue", "Concluida", None, "PAGAMENTO REALIZADO"],
        ],
        "CONTATO PARCEIROS": [
            ["PARCEIRO", "ESTADO", "CIDADE", "PIX", "TELEFONE"],
            ["JOAO", "#REF!", "#REF!", None, "71999990000"],
        ],
    }
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        workbook_sheets = []
        relationships = []
        for index, (name, rows) in enumerate(sheets.items(), start=1):
            workbook_sheets.append(f'<sheet name="{name}" sheetId="{index}" r:id="rId{index}"/>')
            relationships.append(f'<Relationship Id="rId{index}" Type="worksheet" Target="worksheets/sheet{index}.xml"/>')
            archive.writestr(f"xl/worksheets/sheet{index}.xml", _sheet_xml(rows))
        archive.writestr("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + "".join(workbook_sheets) + "</sheets></workbook>")
        archive.writestr("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + "".join(relationships) + "</Relationships>")
    return buffer.getvalue()


if __name__ == "__main__":
    unittest.main()
