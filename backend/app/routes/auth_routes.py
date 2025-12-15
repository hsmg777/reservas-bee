from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..schemas.auth_schemas import RegisterSchema, LoginSchema
from ..services.auth_service import AuthService
from ..models import User
from ..extensions import db
from sqlalchemy.exc import IntegrityError
from flask import current_app
import os


auth_blp = Blueprint(
    "Auth",
    "auth",
    url_prefix="/api/auth",
    description="Autenticación con JWT + Roles (user/admin/seguridad)"
)

@auth_blp.route("/register")
class RegisterView(MethodView):
    @auth_blp.arguments(RegisterSchema, location="json")
    def post(self, data):
        try:
            u = AuthService.register(data["name"], data["email"], data["password"])
            return {"message": "REGISTERED", "user": u.to_dict()}, 201

        except ValueError as e:
            # 👇 clave: ver qué ValueError es realmente
            current_app.logger.exception("REGISTER ValueError")
            if str(e) == "EMAIL_EXISTS":
                abort(409, message="EMAIL_EXISTS")
            abort(400, message=str(e))  # <--- antes decía "BAD_REQUEST"

        except IntegrityError:
            db.session.rollback()
            abort(409, message="EMAIL_EXISTS")  # por unique constraint

        except Exception:
            current_app.logger.exception("REGISTER Unexpected error")
            abort(500, message="SERVER_ERROR")

@auth_blp.route("/login")
class LoginView(MethodView):
    @auth_blp.arguments(LoginSchema)
    def post(self, data):
        try:
            access, refresh, u = AuthService.login(data["email"], data["password"])
            access_min = int(os.getenv("JWT_ACCESS_MIN", "60"))
            return {
                "access_token": access,
                "refresh_token": refresh,
                "token_type": "bearer",
                "expires_in": access_min * 60,
                "user": u.to_dict(),
            }
        except ValueError:
            abort(401, message="INVALID_CREDENTIALS")

@auth_blp.route("/me")
class MeView(MethodView):
    @auth_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    def get(self):
        uid = int(get_jwt_identity())
        u = db.session.get(User, uid)
        if not u:
            abort(404, message="NOT_FOUND")
        return {"user": u.to_dict()}
