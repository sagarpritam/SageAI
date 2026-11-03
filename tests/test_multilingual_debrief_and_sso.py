"""
Unit & Integration Tests for Multilingual Debriefs (7 Languages)
and Enterprise SAML 2.0 / OIDC SSO Federation.
"""

import base64
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.reporting.multilingual_debrief import (
    MultilingualDebriefService,
    multilingual_debrief_service,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


class TestMultilingualDebrief:
    """Test suite for Multilingual CISO & Board Executive Debriefs."""

    def test_all_seven_languages_supported(self):
        service = MultilingualDebriefService()
        langs = ["en", "ja", "de", "fr", "es", "zh", "ar"]
        for lang in langs:
            assert lang in service.SUPPORTED_LANGUAGES
            assert lang in service.TRANSLATIONS

    def test_generate_debrief_english(self):
        debrief = multilingual_debrief_service.generate_debrief(
            target="enterprise.production.internal",
            risk_score=88.5,
            findings=[
                {"title": "SSRF in Cloud IMDS", "severity": "CRITICAL"},
                {"title": "OAuth Token Leak", "severity": "HIGH"},
            ],
            lang="en",
        )
        assert debrief["status"] == "success"
        assert debrief["language"]["code"] == "en"
        assert debrief["posture"]["risk_level"] == "CRITICAL"
        assert debrief["posture"]["breakdown"]["critical"] == 1
        assert debrief["posture"]["breakdown"]["high"] == 1
        assert "Merkle Hash Chain Verified" in debrief["compliance_assurance"]["tamper_proof_statement"]
        assert debrief["compliance_assurance"]["merkle_verification"]["valid"] is True
        assert debrief["compliance_assurance"]["block_hash"] != ""

    def test_generate_debrief_japanese(self):
        debrief = multilingual_debrief_service.generate_debrief(
            target="tokyo-datacenter.internal",
            risk_score=72.0,
            findings=[{"title": "JWT Algorithm Confusion", "severity": "CRITICAL"}],
            lang="ja",
        )
        assert debrief["status"] == "success"
        assert debrief["language"]["code"] == "ja"
        assert "エグゼクティブ・サイバーセキュリティ報告書" in debrief["metadata"]["title"]
        assert "全体的なセキュリティ態勢" in debrief["posture"]["section_label"]
        assert "Merkleハッシュチェーン検証済み" in debrief["compliance_assurance"]["tamper_proof_statement"]

    def test_generate_debrief_german_french_spanish_chinese_arabic(self):
        tests = [
            ("de", "Cybersicherheit"),
            ("fr", "SageAI"),
            ("es", "Ciberseguridad"),
            ("zh", "首席信息安全官"),
            ("ar", "السيبراني"),
        ]
        for lang, expected_keyword in tests:
            debrief = multilingual_debrief_service.generate_debrief(
                target="global-asset.defense.org",
                risk_score=45.0,
                findings=[],
                lang=lang,
            )
            assert debrief["language"]["code"] == lang
            assert expected_keyword in debrief["metadata"]["title"]

    def test_fallback_unsupported_language_defaults_to_english(self):
        debrief = multilingual_debrief_service.generate_debrief(
            target="test.org",
            risk_score=20.0,
            findings=[],
            lang="klingon",
        )
        assert debrief["language"]["code"] == "en"


@pytest.mark.asyncio
class TestSSOAndDebriefAPI:
    """Test suite for SSO and Debrief HTTP Endpoints."""

    async def test_get_debrief_languages(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/reports/languages")
            assert res.status_code == 200
            data = res.json()
            assert "ja" in data["languages"]
            assert "ar" in data["languages"]

    async def test_get_sso_config(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/auth/sso/config")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "success"
            assert "SAML_2_0" in data["supported_protocols"]
            assert "Okta" in data["supported_idps"]
            assert data["sso"]["sp_entity_id"] != ""

    async def test_get_saml_metadata(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/auth/sso/saml/metadata")
            assert res.status_code == 200
            assert res.headers["content-type"].startswith("application/xml")
            assert b"EntityDescriptor" in res.content
            assert b"AssertionConsumerService" in res.content

    async def test_saml_initiate_login(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post(
                "/auth/sso/saml/login",
                json={"email": "ciso@enterprise.com", "relay_state": "/dashboard"},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "success"
            assert "SAMLRequest=" in data["redirect_url"]
            assert data["authn_request_id"].startswith("SAGE_")

    async def test_saml_acs_authentication_flow(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Build mock SAMLResponse with valid NameID email
            saml_assertion_xml = """<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
                <saml:Assertion>
                    <saml:Subject>
                        <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
                            auditor@enterprise.com
                        </saml:NameID>
                    </saml:Subject>
                </saml:Assertion>
            </samlp:Response>"""

            encoded_response = base64.b64encode(saml_assertion_xml.encode("utf-8")).decode("utf-8")

            res = await client.post(
                "/auth/sso/saml/acs",
                json={"SAMLResponse": encoded_response},
            )
            assert res.status_code == 200
            data = res.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"

    async def test_oidc_callback_flow(self):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post(
                "/auth/sso/oidc/callback",
                json={"code": "oidc_auth_code_987654321", "email": "director@enterprise.com"},
            )
            assert res.status_code == 200
            data = res.json()
            assert "access_token" in data
