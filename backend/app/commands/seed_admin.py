# app/commands/seed_admin.py
import click
from flask.cli import with_appcontext

from app.extensions import db
from app.models import User, Role
from app.services.auth_service import AuthService


ADMIN_EMAIL = "admin@beeconcertclub.com"
ADMIN_PASSWORD = "adminBEE2025"


@click.command("seed-admin")
@with_appcontext
def seed_admin_command():
    """
    Crea (o asegura) el usuario admin inicial.
    """
    u = db.session.execute(
        db.select(User).where(User.email == ADMIN_EMAIL)
    ).scalar_one_or_none()

    if u:
        # Si existe, aseguramos que sea admin y activo
        changed = False
        if getattr(u, "role", None) != Role.admin:
            u.role = Role.admin
            changed = True
        if hasattr(u, "is_active") and not u.is_active:
            u.is_active = True
            changed = True

        if changed:
            db.session.commit()
            click.echo(f"UPDATED: {ADMIN_EMAIL} -> role=admin (y activo)")
        else:
            click.echo(f"OK: {ADMIN_EMAIL} ya existe y es admin")
        return

    # Si no existe, crearlo usando tu AuthService (hash + validaciones)
    admin = AuthService.register(
        name="Admin",
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
        role=Role.admin,  # o "admin" si tu AuthService espera string
    )
    db.session.commit()
    click.echo(f"CREATED: {admin.email} (role=admin)")
