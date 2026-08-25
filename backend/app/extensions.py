from sqlalchemy import event
from sqlalchemy.engine import Engine

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


@event.listens_for(
    Engine,
    "connect",
)
def enable_sqlite_foreign_keys(
    dbapi_connection,
    connection_record,
):
    """Enable foreign-key constraints for SQLite."""

    del connection_record

    cursor = dbapi_connection.cursor()

    try:
        cursor.execute(
            "PRAGMA foreign_keys=ON"
        )
    except Exception:
        pass
    finally:
        cursor.close()