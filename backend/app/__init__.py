from flask import Flask, jsonify
from dotenv import load_dotenv

from .config import Config
from .extensions import db, migrate, jwt, api
from .routes.auth_routes import auth_blp
from .routes.event_routes import event_blp
from .routes.reservation_routes import reservation_blp
from app.commands.seed_admin import seed_admin_command
from .routes.event_access_routes import event_access_blp, access_check_blp




def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    # Swagger/OpenAPI
    app.config["API_TITLE"] = "Reservas API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/api/docs"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    app.config["OPENAPI_COMPONENTS"] = {
        "securitySchemes": {
            "bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
        }
    }
    app.config["OPENAPI_SECURITY"] = [{"bearerAuth": []}]


    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    api.init_app(app)
    api.register_blueprint(auth_blp)
    api.register_blueprint(event_blp)
    api.register_blueprint(reservation_blp)
    api.register_blueprint(event_access_blp)
    api.register_blueprint(access_check_blp)

    app.cli.add_command(seed_admin_command)



    @app.get("/health")
    def health():
        return jsonify(ok=True)

    return app
