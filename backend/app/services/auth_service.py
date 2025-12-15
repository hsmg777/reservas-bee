from passlib.hash import pbkdf2_sha256
from flask_jwt_extended import create_access_token, create_refresh_token
from ..extensions import db
from ..models import User, Role

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        # ✅ sin límite 72 bytes
        return pbkdf2_sha256.hash(password)

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        # ✅ verifica hashes PBKDF2
        return pbkdf2_sha256.verify(password, password_hash)

    @staticmethod
    def register(name: str, email: str, password: str) -> User:
        email_norm = email.lower().strip()

        existing = User.query.filter_by(email=email_norm).first()
        if existing:
            raise ValueError("EMAIL_EXISTS")

        u = User(
            name=name.strip(),
            email=email_norm,
            password_hash=AuthService.hash_password(password),
            role=Role.user,
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
