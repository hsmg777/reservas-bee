import os
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from flask import current_app

from ..schemas.auth_schemas import RegisterSchema, LoginSchema
from ..services.auth_service import AuthService
from ..models import User, Role
from ..extensions import db


auth_blp = Blueprint(
    "Auth",
    "auth",
    url_prefix="/api/auth",
    description="Autenticación con JWT + Roles (user/admin/seguridad)"
)

def _current_user_or_401() -> User:
    uid = get_jwt_identity()
    if not uid:
        abort(401, message="UNAUTHORIZED")

    u = db.session.get(User, int(uid))
    if not u or not u.is_active:
        abort(401, message="UNAUTHORIZED")

    return u

def _require_admin(u: User):
    # Role es Enum → comparar con Role.admin
    if getattr(u, "role", None) != Role.admin:
        abort(403, message="FORBIDDEN")


@auth_blp.route("/register")
class RegisterView(MethodView):
    @auth_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    @auth_blp.arguments(RegisterSchema, location="json")
    def post(self, data):
        # solo admin crea usuarios
        admin_user = _current_user_or_401()
        _require_admin(admin_user)

        try:
            u = AuthService.register(
                name=data["name"],
                email=data["email"],
                password=data["password"],
                role=data["role"],
            )
            return {"message": "REGISTERED", "user": u.to_dict()}, 201

        except ValueError as e:
            current_app.logger.exception("REGISTER ValueError")
            if str(e) == "EMAIL_EXISTS":
                abort(409, message="EMAIL_EXISTS")
            if str(e) == "INVALID_ROLE":
                abort(400, message="INVALID_ROLE")
            abort(400, message=str(e))

        except IntegrityError:
            db.session.rollback()
            abort(409, message="EMAIL_EXISTS")

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
        u = _current_user_or_401()
        return {"user": u.to_dict()}


@auth_blp.route("/users")
class UsersListView(MethodView):
    @auth_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    def get(self):
        admin_user = _current_user_or_401()
        _require_admin(admin_user)

        users = AuthService.list_users()
        return {"items": [u.to_dict() for u in users]}


@auth_blp.route("/users/<int:user_id>")
class UsersDeleteView(MethodView):
    @auth_blp.doc(security=[{"bearerAuth": []}])
    @jwt_required()
    def delete(self, user_id: int):
        admin_user = _current_user_or_401()
        _require_admin(admin_user)

        try:
            AuthService.delete_user(user_id=user_id, actor_id=admin_user.id)
            return {"message": "DELETED"}, 200

        except ValueError as e:
            if str(e) == "CANNOT_DELETE_SELF":
                abort(400, message="CANNOT_DELETE_SELF")
            if str(e) == "NOT_FOUND":
                abort(404, message="NOT_FOUND")
            abort(400, message=str(e))

        except Exception:
            current_app.logger.exception("DELETE USER Unexpected error")
            abort(500, message="SERVER_ERROR")
