from passlib.hash import pbkdf2_sha256
from flask_jwt_extended import create_access_token, create_refresh_token

from ..extensions import db
from ..models import User, Role


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return pbkdf2_sha256.hash(password)

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        return pbkdf2_sha256.verify(password, password_hash)

    @staticmethod
    def register(name: str, email: str, password: str, role: str) -> User:
        email_norm = email.lower().strip()

        existing = User.query.filter_by(email=email_norm).first()
        if existing:
            raise ValueError("EMAIL_EXISTS")

        try:
            role_enum = Role(role)  # "admin"|"user"|"seguridad"
        except Exception:
            raise ValueError("INVALID_ROLE")

        u = User(
            name=name.strip(),
            email=email_norm,
            password_hash=AuthService.hash_password(password),
            role=role_enum,
        )
        db.session.add(u)
        db.session.commit()
        return u

    @staticmethod
    def login(email: str, password: str):
        email_norm = email.lower().strip()

        u = User.query.filter_by(email=email_norm).first()
        if not u or not u.is_active:
            raise ValueError("INVALID_CREDENTIALS")

        if not AuthService.verify_password(password, u.password_hash):
            raise ValueError("INVALID_CREDENTIALS")

        claims = {"role": u.role.value, "uid": u.id}
        access = create_access_token(identity=str(u.id), additional_claims=claims)
        refresh = create_refresh_token(identity=str(u.id), additional_claims=claims)
        return access, refresh, u

    @staticmethod
    def list_users() -> list[User]:
        # ordena como quieras (últimos primero)
        return User.query.order_by(User.id.desc()).all()

    @staticmethod
    def delete_user(user_id: int, actor_id: int | None = None) -> None:
        if actor_id is not None and int(actor_id) == int(user_id):
            raise ValueError("CANNOT_DELETE_SELF")

        u = db.session.get(User, int(user_id))
        if not u:
            raise ValueError("NOT_FOUND")

        db.session.delete(u)
        db.session.commit()
