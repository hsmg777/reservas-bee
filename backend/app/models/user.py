import enum
from datetime import datetime
from sqlalchemy import Enum
from ..extensions import db

class Role(str, enum.Enum):
    user = "user"
    admin = "admin"
    seguridad = "seguridad"

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(Enum(Role, name="role_enum"), nullable=False, default=Role.user)

    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role.value,
            "is_active": self.is_active,
        }
