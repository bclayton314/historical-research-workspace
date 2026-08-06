from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db
from app.routes import (
    health_bp,
    projects_bp,
    sources_bp,
)


def create_app(config_class=Config) -> Flask:
    """Create and configure the Flask application."""

    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config[
                    "FRONTEND_ORIGIN"
                ],
            }
        },
    )

    app.register_blueprint(health_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(sources_bp)

    with app.app_context():
        db.create_all()

    return app