from __future__ import annotations

from pathlib import Path
import argparse

from .config import load_settings


MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def connect(database_url: str):
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError("Instale as dependências do backend antes de acessar o PostgreSQL.") from exc
    return psycopg.connect(database_url)


def apply_migrations(database_url: str) -> list[str]:
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        raise RuntimeError("Nenhuma migração encontrada.")
    applied: list[str] = []
    with connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                  filename text PRIMARY KEY,
                  applied_at timestamptz NOT NULL DEFAULT now()
                )
                """
            )
            cursor.execute("SELECT filename FROM schema_migrations")
            already_applied = {row[0] for row in cursor.fetchall()}
        connection.commit()
        for migration in migration_files:
            if migration.name in already_applied:
                continue
            with connection.cursor() as cursor:
                cursor.execute(migration.read_text(encoding="utf-8"))
                cursor.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)",
                    (migration.name,),
                )
            connection.commit()
            applied.append(migration.name)
    return applied


def main() -> None:
    parser = argparse.ArgumentParser(description="Ferramentas de banco do SISAVALIA")
    parser.add_argument("command", choices=["migrate"])
    args = parser.parse_args()
    settings = load_settings()
    if not settings.database_url:
        raise SystemExit("Defina SISAVALIA_DATABASE_URL antes de executar migrações.")
    if args.command == "migrate":
        for name in apply_migrations(settings.database_url):
            print(f"Migração aplicada: {name}")


if __name__ == "__main__":
    main()
