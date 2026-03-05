"""Email service — transactional emails via SMTP."""

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("sageai.email")


class EmailService:
    """Send transactional emails."""

    def __init__(self):
        self.host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.user = os.getenv("SMTP_USER", "")
        self.password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM", self.user or "noreply@sageai.com")

    def _send(self, to: str, subject: str, html_body: str):
        """Send an email."""
        if not self.user or not self.password:
            logger.warning("SMTP not configured — email not sent")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SageAI <{self.from_email}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.send_message(msg)
            logger.info(f"Email sent to {to}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Email failed to {to}: {e}")
            return False

    def send_scan_result(self, to: str, target: str, risk_level: str, risk_score: int):
        """Send scan completion notification."""
        color = {"Critical": "#ef4444", "High": "#f97316", "Medium": "#eab308", "Low": "#22c55e"}.get(risk_level, "#6b7280")
        self._send(to, f"SageAI Scan Complete — {target}", f"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
            <h1 style="color:#06b6d4;">🛡️ SageAI Scan Report</h1>
            <p>Your security scan for <strong>{target}</strong> is complete.</p>
            <div style="background:#1e293b;padding:20px;border-radius:8px;margin:16px 0;">
                <p style="margin:0;">Risk Level: <span style="color:{color};font-weight:bold;">{risk_level}</span></p>
                <p style="margin:8px 0 0;">Risk Score: <strong>{risk_score}/100</strong></p>
            </div>
            <p>Log in to your dashboard to view full details.</p>
        </div>
        """)

    def send_invite(self, to: str, org_name: str, invite_link: str):
        """Send team invitation email."""
        self._send(to, f"You're invited to {org_name} on SageAI", f"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
            <h1 style="color:#06b6d4;">🛡️ Team Invitation</h1>
            <p>You've been invited to join <strong>{org_name}</strong> on SageAI.</p>
            <a href="{invite_link}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Accept Invitation</a>
        </div>
        """)

    def send_password_reset(self, to: str, reset_link: str):
        """Send password reset email."""
        self._send(to, "Reset your SageAI password", f"""
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
            <h1 style="color:#06b6d4;">🔑 Password Reset</h1>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="{reset_link}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#8b5cf6);color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
        </div>
        """)


email_service = EmailService()
