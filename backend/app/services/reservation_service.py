import io
import secrets
import smtplib
from datetime import datetime
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import qrcode
from flask import current_app
from sqlalchemy import update

from ..extensions import db
from ..models import Event, Reservation, ReservationStatus


class ReservationService:
    @staticmethod
    def _generate_code() -> str:
        return secrets.token_hex(16)

    @staticmethod
    def _checkin_url(reservation_code: str) -> str:
        base = (current_app.config.get("PUBLIC_BASE_URL") or "").rstrip("/")
        return f"{base}/checkin/{reservation_code}"

    @staticmethod
    def _qr_png_bytes(data: str) -> bytes:
        img = qrcode.make(data)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()

    @staticmethod
    def _send_email_with_qr(to_email: str, subject: str, html: str, qr_png: bytes):
        """
        Gmail + Outlook friendly:
        - multipart/related (inline images)
        - multipart/alternative (plain + html)
        - QR inline via CID and also attached as file
        """
        cfg = current_app.config

        server = cfg.get("MAIL_SERVER")
        port = int(cfg.get("MAIL_PORT", 587))
        use_tls = bool(cfg.get("MAIL_USE_TLS", True))
        username = cfg.get("MAIL_USERNAME")
        password = cfg.get("MAIL_PASSWORD")
        sender = cfg.get("MAIL_DEFAULT_SENDER") or username

        if not (server and port and username and password and sender):
            raise RuntimeError("MAIL_CONFIG_MISSING")

        # Root container
        msg = MIMEMultipart("related")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to_email

        # Alternative (text + html)
        alt = MIMEMultipart("alternative")
        msg.attach(alt)

        alt.attach(
            MIMEText(
                "Tu invitación está lista. Si no ves el contenido, abre el correo en HTML.",
                "plain",
                "utf-8",
            )
        )
        alt.attach(MIMEText(html, "html", "utf-8"))

        # Inline QR (CID)
        qr_cid = "qr-image"
        img = MIMEImage(qr_png, _subtype="png")
        img.add_header("Content-ID", f"<{qr_cid}>")
        img.add_header("Content-Disposition", "inline", filename="qr.png")
        msg.attach(img)

        # Also attach QR as file (for clients that block inline)
        attach = MIMEImage(qr_png, _subtype="png")
        attach.add_header("Content-Disposition", "attachment", filename="qr.png")
        msg.attach(attach)

        with smtplib.SMTP(server, port) as smtp:
            smtp.ehlo()
            if use_tls:
                smtp.starttls()
                smtp.ehlo()
            smtp.login(username, password)
            smtp.sendmail(sender, [to_email], msg.as_string())

    @staticmethod
    def create_public_reservation(public_code: str, data: dict) -> Reservation:
        ev: Event | None = Event.query.filter_by(public_code=public_code).first()
        if not ev:
            raise ValueError("EVENT_NOT_FOUND")

        now = datetime.utcnow()
        if ev.end_at <= now:
            raise ValueError("EVENT_ENDED")

        if getattr(ev, "status", None) and ev.status.value in ("ended", "cancelled"):
            raise ValueError("EVENT_NOT_AVAILABLE")

        # reservation_code único
        for _ in range(8):
            code = ReservationService._generate_code()
            exists = Reservation.query.filter_by(reservation_code=code).first()
            if not exists:
                break
        else:
            raise ValueError("RESERVATION_CODE_GENERATION_FAILED")

        r = Reservation(
            event_id=ev.id,
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            email=data["email"].strip().lower(),
            phone=data["phone"].strip(),
            instagram=(data.get("instagram") or None),
            reservation_code=code,
            status=ReservationStatus.created,
        )
        db.session.add(r)
        db.session.commit()

        checkin_url = ReservationService._checkin_url(r.reservation_code)
        qr_png = ReservationService._qr_png_bytes(checkin_url)

        # IMPORTANTE: CID fijo que coincide con _send_email_with_qr (qr-image)
        html = f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:92%;background:#0f0f0f;border:1px solid #222;border-radius:18px;overflow:hidden;">

                <!-- Top bar -->
                <tr>
                  <td style="background:#ffd400;padding:18px 22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left">
                          <div style="font-size:12px;letter-spacing:3px;font-weight:800;color:#1a1a1a;text-transform:uppercase;">
                            Bee Concert Club
                          </div>
                          <div style="font-size:20px;font-weight:900;color:#0b0b0b;line-height:1.2;margin-top:4px;">
                            Tu invitación está lista!
                          </div>
                        </td>
                        <td align="right">
                          <div style="display:inline-block;background:#0b0b0b;color:#ffd400;font-weight:900;font-size:12px;padding:8px 12px;border-radius:999px;">
                            QR · 1 SOLO USO
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:22px 22px 10px 22px;color:#f5f5f5;">
                    <p style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#eaeaea;">
                      Hola <b style="color:#ffffff;">{r.first_name} {r.last_name}</b>, tu reserva fue registrada.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;background:#141414;border:1px solid #242424;border-radius:14px;">
                      <tr>
                        <td style="padding:14px 14px;">
                          <div style="font-size:12px;letter-spacing:2px;font-weight:800;color:#ffd400;text-transform:uppercase;">
                            Evento
                          </div>
                          <div style="font-size:18px;font-weight:900;color:#ffffff;margin-top:4px;line-height:1.3;">
                            {ev.name}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:16px 0 12px 0;font-size:14px;line-height:1.6;color:#dcdcdc;">
                      Presenta este QR en la entrada:
                    </p>

                    <!-- QR box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0b;border:1px solid #242424;border-radius:14px;">
                      <tr>
                        <td align="center" style="padding:16px;">
                          <img src="cid:qr-image" alt="QR Bee Concert Club"
                               width="260" height="260"
                               style="display:block;width:260px;height:260px;border-radius:16px;border:1px solid #2b2b2b;background:#ffffff;padding:10px;" />
                        </td>
                      </tr>
                    </table>

                    <p style="margin:12px 0 0 0;font-size:12px;color:#bdbdbd;line-height:1.5;">
                      *El QR es de un solo uso. Una vez escaneado, queda marcado como utilizado.
                    </p>

                    <!-- Rules -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#141414;border:1px solid #242424;border-radius:14px;">
                      <tr>
                        <td style="padding:14px 14px;">
                          <div style="font-size:13px;font-weight:900;color:#ffd400;">
                            ¡Recuerda!
                          </div>

                          <div style="margin-top:10px;font-size:13px;line-height:1.6;color:#e6e6e6;">
                            <div style="margin:0 0 8px 0;">
                              • Ingreso con documento <b>FÍSICO OBLIGATORIO</b> ⚠️:<br/>
                              <span style="color:#cfcfcf;">Nacionales:</span> Cédula / Licencia de conducir.<br/>
                              <span style="color:#cfcfcf;">Extranjeros:</span> Pasaporte.
                            </div>

                            <div style="margin:0 0 8px 0;">
                              • Está prohibido el ingreso de menores de edad 🚫.
                            </div>

                            <div style="margin:10px 0 0 0;color:#cfcfcf;">
                              Recuerda presentarlo al ingresar.<br/>
                              <b style="color:#ffd400;">⚠️: Tu reserva no garantiza el ingreso!</b> Recuerda cumplir las politicas.
                            </div>

                            <div style="margin-top:10px;color:#eaeaea;">
                              Gracias por confiar en nosotros.
                            </div>

                            <div style="margin-top:10px;color:#eaeaea;">
                              Atentamente,<br/>
                              <b>Equipo de Bee Concert Club 🐝</b>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 22px 18px 22px;">
                    <div style="border-top:1px solid #242424;padding-top:12px;color:#9a9a9a;font-size:11px;line-height:1.5;text-align:center;">
                      Desarrollado por <b style="color:#cfcfcf;">Nivusoftware SAS.</b> · <span style="color:#cfcfcf;">@nivu.soft</span>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
        """

        try:
            ReservationService._send_email_with_qr(
                to_email=r.email,
                subject=f"Tu invitación - {ev.name}",
                html=html,
                qr_png=qr_png,
            )
            r.email_sent_at = datetime.utcnow()
            r.email_send_status = "sent"
            r.email_error = None
        except Exception as e:
            r.email_send_status = "failed"
            r.email_error = str(e)

        db.session.commit()
        return r

    @staticmethod
    def serialize(r: Reservation) -> dict:
        return {
            **r.to_dict(),
            "checkin_url": ReservationService._checkin_url(r.reservation_code),
            "qr_url": f"/api/reservations/{r.id}/qr",
        }

    @staticmethod
    def qr_png_for_reservation(reservation_id: int) -> bytes:
        r: Reservation | None = db.session.get(Reservation, reservation_id)
        if not r:
            raise ValueError("NOT_FOUND")
        checkin_url = ReservationService._checkin_url(r.reservation_code)
        return ReservationService._qr_png_bytes(checkin_url)

    @staticmethod
    def list_by_event(event_id: int) -> list[Reservation]:
        ev = db.session.get(Event, event_id)
        if not ev:
            raise ValueError("EVENT_NOT_FOUND")

        return (
            Reservation.query
            .filter_by(event_id=event_id)
            .order_by(Reservation.created_at.desc())
            .all()
        )

    @staticmethod
    def checkin_atomic(
        reservation_code: str, scanned_by_user_id: int | None
    ) -> tuple[bool, Reservation | None, str]:
        """
        Solo 1 uso:
        UPDATE reservations
        SET used_at=now, status='checked_in'
        WHERE reservation_code=:code AND used_at IS NULL AND status='created'
        """
        now = datetime.utcnow()

        r = Reservation.query.filter_by(reservation_code=reservation_code).first()
        if not r:
            return False, None, "NOT_FOUND"

        ev = db.session.get(Event, r.event_id)
        if not ev:
            return False, r, "EVENT_NOT_FOUND"

        if ev.end_at <= now:
            return False, r, "EVENT_ENDED"

        if getattr(ev, "status", None) and ev.status.value in ("ended", "cancelled"):
            return False, r, "EVENT_NOT_AVAILABLE"

        stmt = (
            update(Reservation)
            .where(Reservation.reservation_code == reservation_code)
            .where(Reservation.used_at.is_(None))
            .where(Reservation.status == ReservationStatus.created)
            .values(
                used_at=now,
                status=ReservationStatus.checked_in,
                scanned_by_user_id=scanned_by_user_id,
                scan_count=Reservation.scan_count + 1,
                last_scan_at=now,
            )
        )

        result = db.session.execute(stmt)
        db.session.commit()

        if result.rowcount == 1:
            updated = Reservation.query.filter_by(reservation_code=reservation_code).first()
            return True, updated, "OK"

        r = Reservation.query.filter_by(reservation_code=reservation_code).first()
        return False, r, "ALREADY_USED"
