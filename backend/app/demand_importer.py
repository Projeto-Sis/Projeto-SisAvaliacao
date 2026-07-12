from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from io import BytesIO
import re
import unicodedata
import zipfile
from xml.etree import ElementTree as ET

from .demand_domain import normalize_legacy_status, normalize_text


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"m": MAIN_NS, "r": REL_NS, "p": PKG_REL_NS}
EXCEL_EPOCH = datetime(1899, 12, 30)


class LegacyWorkbookError(ValueError):
    pass


def inspect_workbook_health(content: bytes) -> dict[str, int]:
    formulas = 0
    broken_references = 0
    try:
        archive = zipfile.ZipFile(BytesIO(content))
    except zipfile.BadZipFile as exc:
        raise LegacyWorkbookError("O arquivo não é um XLSX válido.") from exc
    with archive:
        for name in archive.namelist():
            if not name.startswith("xl/worksheets/") or not name.endswith(".xml"):
                continue
            root = ET.fromstring(archive.read(name))
            formulas += len(root.findall(f".//{{{MAIN_NS}}}f"))
            for cell in root.findall(f".//{{{MAIN_NS}}}c"):
                formula = cell.findtext(f"{{{MAIN_NS}}}f", default="")
                value = cell.findtext(f"{{{MAIN_NS}}}v", default="")
                if "#REF!" in formula or value == "#REF!":
                    broken_references += 1
    return {"formula_count": formulas, "broken_reference_count": broken_references}


def _column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference.upper())
    if not letters:
        return -1
    result = 0
    for character in letters.group(0):
        result = result * 26 + ord(character) - 64
    return result - 1


def _cell_text(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(f".//{{{MAIN_NS}}}t"))


def read_xlsx_rows(content: bytes) -> dict[str, list[list[str | None]]]:
    try:
        archive = zipfile.ZipFile(BytesIO(content))
    except (zipfile.BadZipFile, OSError) as exc:
        raise LegacyWorkbookError("O arquivo não é um XLSX válido.") from exc
    with archive:
        names = set(archive.namelist())
        if "xl/workbook.xml" not in names:
            raise LegacyWorkbookError("Estrutura interna do XLSX não encontrada.")
        shared: list[str] = []
        if "xl/sharedStrings.xml" in names:
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            shared = [_cell_text(item) for item in root.findall(f"{{{MAIN_NS}}}si")]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {
            item.attrib["Id"]: item.attrib["Target"]
            for item in relationships.findall(f"{{{PKG_REL_NS}}}Relationship")
        }
        sheets: dict[str, list[list[str | None]]] = {}
        for sheet in workbook.findall(f"{{{MAIN_NS}}}sheets/{{{MAIN_NS}}}sheet"):
            name = sheet.attrib["name"]
            relationship_id = sheet.attrib[f"{{{REL_NS}}}id"]
            target = targets[relationship_id].lstrip("/")
            path = target if target.startswith("xl/") else f"xl/{target}"
            root = ET.fromstring(archive.read(path))
            rows: list[list[str | None]] = []
            for row in root.findall(f".//{{{MAIN_NS}}}sheetData/{{{MAIN_NS}}}row"):
                values: list[str | None] = []
                for cell in row.findall(f"{{{MAIN_NS}}}c"):
                    index = _column_index(cell.attrib.get("r", ""))
                    if index < 0:
                        continue
                    while len(values) <= index:
                        values.append(None)
                    cell_type = cell.attrib.get("t")
                    raw = cell.findtext(f"{{{MAIN_NS}}}v", default="")
                    if cell_type == "s" and raw:
                        try:
                            value = shared[int(raw)]
                        except (ValueError, IndexError):
                            value = raw
                    elif cell_type == "inlineStr":
                        inline = cell.find(f"{{{MAIN_NS}}}is")
                        value = _cell_text(inline) if inline is not None else ""
                    else:
                        value = raw
                    values[index] = None if not value or "#REF!" in value else value.strip()
                if any(value not in (None, "") for value in values):
                    rows.append(values)
            sheets[name] = rows
        return sheets


def _value(row: list[str | None], index: int) -> str | None:
    return row[index] if index < len(row) and row[index] not in (None, "", "-") else None


def _identifier(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if re.fullmatch(r"\d+\.0+", cleaned):
        return cleaned.split(".", 1)[0]
    return cleaned


def parse_excel_date(value: str | None) -> date | None:
    if not value:
        return None
    text = value.strip()
    try:
        number = float(text)
        if 1 <= number <= 100000:
            return (EXCEL_EPOCH + timedelta(days=number)).date()
    except ValueError:
        pass
    for pattern in ("%d/%m/%Y", "%Y-%m-%d", "%d/%m/%y"):
        try:
            return datetime.strptime(text, pattern).date()
        except ValueError:
            continue
    return None


def parse_money(value: str | None) -> Decimal | None:
    if not value:
        return None
    text = re.sub(r"[^0-9,.-]", "", value.strip())
    if not text or text == "-":
        return None
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    try:
        result = Decimal(text)
        return result if result >= 0 else None
    except InvalidOperation:
        return None


def _demand_status(value: str | None) -> str:
    normalized = normalize_text(value)
    aliases = {
        "ENTREGUE": "Entregue", "FINALIZADA": "Finalizada", "FINALIZADO": "Finalizada",
        "NAO ENTREGUE": "Não entregue", "CANCELADA": "Cancelada", "EM ANALISE": "Em análise",
        "AGENDADA": "Agendada", "VISTORIA REALIZADA": "Vistoria realizada",
    }
    return aliases.get(normalized, "Recebida")


def _art_status(value: str | None) -> str:
    normalized = normalize_text(value)
    if normalized == "ART PAGA":
        return "ART paga"
    if normalized in {"ISENTO", "ISENTA"}:
        return "Isento"
    if normalized in {"CANCELADO", "CANCELADA"}:
        return "Cancelada"
    return "Pendente"


def _payment_status(value: str | None) -> str:
    normalized = normalize_text(value)
    if normalized in {"PAGAMENTO REALIZADO", "REALIZADO", "PAGO"}:
        return "Pagamento realizado"
    if normalized in {"PARCIAL", "PAGAMENTO PARCIAL"}:
        return "Parcial"
    if normalized in {"CANCELADO", "CANCELADA"}:
        return "Cancelado"
    return "Não realizado"


def _partner_status(value: str | None) -> str:
    normalized = normalize_text(value)
    return {
        "ENTREGUE": "Entregue", "NAO ENTREGUE": "Não entregue", "ACIONADO": "Acionado",
        "CANCELADO": "Cancelado", "CANCELADA": "Cancelado",
    }.get(normalized, "Não definido")


def _system_status(value: str | None) -> str:
    normalized = normalize_text(value)
    return {
        "CONCLUIDA": "Concluída", "CONCLUIDO": "Concluída", "EMITIDA": "Emitida",
        "PENDENTE": "Pendente", "CANCELADA": "Cancelada", "CANCELADO": "Cancelada",
    }.get(normalized, "Não iniciado")


def _partner_profiles(rows: list[list[str | None]]) -> dict[str, dict]:
    profiles: dict[str, dict] = {}
    for row in rows[1:]:
        name = _value(row, 0)
        if not name:
            continue
        profiles[normalize_text(name)] = {
            "name": name.strip(), "state_code": _value(row, 1), "base_city": _value(row, 2),
            "pix": _value(row, 3), "phone": _value(row, 4), "email": _value(row, 5),
            "bank": _value(row, 9), "agency": _value(row, 10), "account": _value(row, 11),
            "operation": _value(row, 12), "account_holder": _value(row, 13),
        }
    return profiles


def analyze_legacy_workbook(content: bytes) -> dict:
    health = inspect_workbook_health(content)
    sheets = read_xlsx_rows(content)
    profiles = _partner_profiles(sheets.get("CONTATO PARCEIROS", []))
    demands: list[dict] = []
    errors: list[dict] = []
    incomplete: list[dict] = []

    mappings = [
        ("BANCO BRASIL", "BB"),
        ("CAIXA ECOMICA", "CAIXA"),
    ]
    for sheet_name, bank_acronym in mappings:
        rows = sheets.get(sheet_name)
        if not rows:
            errors.append({"sheet": sheet_name, "error": "Aba não encontrada ou vazia."})
            continue
        for position, row in enumerate(rows[1:], start=2):
            if bank_acronym == "BB":
                arrival, deadline, os_number = parse_excel_date(_value(row, 0)), parse_excel_date(_value(row, 1)), _identifier(_value(row, 2))
                engineer, partner = _value(row, 4), _value(row, 6)
                demand = {
                    "bank_acronym": bank_acronym, "os_number": os_number, "final_os_number": None,
                    "arrival_date": arrival, "client_deadline": deadline, "service_value": parse_money(_value(row, 3)),
                    "engineer_name": engineer, "art_status": _art_status(_value(row, 5)), "partner_name": partner,
                    "partner_fee": parse_money(_value(row, 7)), "city": _value(row, 8), "state_code": _value(row, 9),
                    "demand_status": _demand_status(_value(row, 10)), "partner_status": _partner_status(_value(row, 10)),
                    "system_status": "Não iniciado", "payment_status": "Não realizado", "notes": _value(row, 15),
                }
            else:
                arrival, deadline, os_number = parse_excel_date(_value(row, 0)), parse_excel_date(_value(row, 1)), _identifier(_value(row, 2))
                engineer, partner = _value(row, 5), _value(row, 7)
                demand = {
                    "bank_acronym": bank_acronym, "os_number": os_number, "final_os_number": _identifier(_value(row, 3)),
                    "arrival_date": arrival, "client_deadline": deadline, "service_value": parse_money(_value(row, 4)),
                    "engineer_name": engineer, "art_status": _art_status(_value(row, 6)), "partner_name": partner,
                    "partner_fee": parse_money(_value(row, 8)), "city": _value(row, 9), "state_code": _value(row, 10),
                    "delivered_to_engineer_at": parse_excel_date(_value(row, 11)),
                    "system_finished_at": parse_excel_date(_value(row, 12)),
                    "demand_status": "Finalizada" if parse_excel_date(_value(row, 12)) else "Recebida",
                    "partner_status": _partner_status(_value(row, 15)), "system_status": _system_status(_value(row, 16)),
                    "payment_status": _payment_status(_value(row, 18)), "notes": _value(row, 17),
                }
            if not any((os_number, arrival, demand.get("city"), demand.get("state_code"))):
                continue
            missing = [key for key in ("os_number", "arrival_date", "city", "state_code") if not demand.get(key)]
            if missing:
                incomplete.append({"sheet": sheet_name, "row": position, "missing": missing, "os_number": os_number})
                continue
            demand["sheet"] = sheet_name
            demand["row"] = position
            demand["partner_profile"] = profiles.get(normalize_text(partner)) if partner else None
            demands.append(demand)

    seen: set[tuple[str, str]] = set()
    duplicates: list[dict] = []
    unique_demands: list[dict] = []
    for demand in demands:
        key = (demand["bank_acronym"], normalize_text(demand["os_number"]))
        if key in seen:
            duplicates.append({"bank": key[0], "os_number": demand["os_number"], "sheet": demand["sheet"], "row": demand["row"]})
            continue
        seen.add(key)
        unique_demands.append(demand)
    return {
        "demands": unique_demands,
        "report": {
            "total_rows_read": sum(max(0, len(sheets.get(name, [])) - 1) for name, _ in mappings),
            "valid_demands": len(unique_demands),
            "ignored_rows": len(incomplete) + len(duplicates),
            "errors": errors,
            "duplicates": duplicates,
            "incomplete_rows": incomplete,
            "partner_profiles_found": len(profiles),
            "workbook_health": health,
        },
    }
