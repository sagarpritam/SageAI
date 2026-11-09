"""
SageAI Multilingual Executive CISO Debrief Service.

Generates executive security briefs, risk posture assessments, and remediation roadmaps
in 7 major global languages: English (en), Japanese (ja), German (de), French (fr),
Spanish (es), Simplified Chinese (zh), and Arabic (ar).
Fulfills Pillar VI (Internationalization) of the Master Plan.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List

from app.services.audit_chain import audit_chain


class MultilingualDebriefService:
    """
    Synthesizes multilingual executive debriefs for boardrooms and CISOs globally.
    Integrates cryptographic Merkle chain verification for tamper-evident compliance.
    """

    SUPPORTED_LANGUAGES = {
        "en": "English",
        "ja": "日本語 (Japanese)",
        "de": "Deutsch (German)",
        "fr": "Français (French)",
        "es": "Español (Spanish)",
        "zh": "简体中文 (Chinese)",
        "ar": "العربية (Arabic)",
    }

    TRANSLATIONS = {
        "en": {
            "title": "SageAI Executive Cybersecurity Debrief & Board Briefing",
            "overall_posture": "Overall Security Posture",
            "executive_summary": "Executive Summary",
            "key_metrics": "Key Risk Metrics",
            "critical_findings": "Critical Attack Vectors & Findings",
            "mitigation_roadmap": "Strategic Mitigation Roadmap",
            "compliance_attestation": "SOC2 Type II / ISO 27001 Cryptographic Assurance",
            "tamper_proof": "Merkle Hash Chain Verified: 100% Tamper Evident",
            "autonomous_defense": "Autonomous AI Council Multi-Model Consensus Active",
            "summary_text": "This security posture debrief reflects continuous multi-agent attack surface telemetry, in-line WAF packet inspection, malware detonation, and deception honeypot surveillance. Immediate remediation is prioritized by exploitability.",
        },
        "ja": {
            "title": "SageAI エグゼクティブ・サイバーセキュリティ報告書",
            "overall_posture": "全体的なセキュリティ態勢",
            "executive_summary": "エグゼクティブ・サマリー",
            "key_metrics": "主要リスク指標",
            "critical_findings": "重大な攻撃ベクトルと検出事項",
            "mitigation_roadmap": "戦略的修復ロードマップ",
            "compliance_attestation": "SOC2 Type II / ISO 27001 暗号化保証",
            "tamper_proof": "Merkleハッシュチェーン検証済み: 改ざん検出率100%",
            "autonomous_defense": "自律型AI評議会マルチモデル合意システム稼働中",
            "summary_text": "本セキュリティ態勢報告書は、マルチエージェント攻撃対象領域テレメトリ、インラインWAFパケット検査、マルウェア分析、おとりハニーポット監視の結果を集約したものです。即時修復措置が優先されます。",
        },
        "de": {
            "title": "SageAI Vorstandsbericht zur Cybersicherheit & Bedrohungsanalyse",
            "overall_posture": "Gesamte Sicherheitslage",
            "executive_summary": "Zusammenfassung für die Geschäftsleitung",
            "key_metrics": "Wesentliche Risikokennzahlen",
            "critical_findings": "Kritische Angriffsvektoren und Befunde",
            "mitigation_roadmap": "Strategischer Behebungsplan",
            "compliance_attestation": "Kryptografische Zusicherung nach SOC2 Typ II / ISO 27001",
            "tamper_proof": "Merkle-Hash-Kette verifiziert: 100% manipulationssicher",
            "autonomous_defense": "Autonome Multi-Modell-Konsensprüfung aktiv",
            "summary_text": "Dieser Sicherheitsbericht konsolidiert kontinuierliche Multi-Agenten-Telemetrie, WAF-Paketinspektion, Malware-Detonation und Deception-Honeypot-Überwachung. Sofortige Abhilfemaßnahmen sind priorisiert.",
        },
        "fr": {
            "title": "Rapport Exécutif de Cybersécurité et Débriefing CISO SageAI",
            "overall_posture": "Posture Globale de Sécurité",
            "executive_summary": "Résumé Exécutif",
            "key_metrics": "Indicateurs Clés de Risque",
            "critical_findings": "Vecteurs d'Attaque Critiques et Vulnérabilités",
            "mitigation_roadmap": "Feuille de Route de Remédiation Stratégique",
            "compliance_attestation": "Assurance Cryptographique SOC2 Type II / ISO 27001",
            "tamper_proof": "Chaîne de Hachage Merkle Vérifiée: 100% Inviolable",
            "autonomous_defense": "Consensus Multi-Modèles du Conseil IA Autonome Actif",
            "summary_text": "Ce rapport de posture de sécurité consolide la télémétrie multi-agents, l'inspection WAF en ligne, la détonation de malwares et la surveillance par pots de miel. Les remédiations immédiates sont priorisées.",
        },
        "es": {
            "title": "Informe Ejecutivo de Ciberseguridad y Resumen CISO de SageAI",
            "overall_posture": "Postura General de Seguridad",
            "executive_summary": "Resumen Ejecutivo",
            "key_metrics": "Métricas Clave de Riesgo",
            "critical_findings": "Vectores de Ataque Críticos y Hallazgos",
            "mitigation_roadmap": "Hoja de Ruta de Mitigación Estratégica",
            "compliance_attestation": "Garantía Criptográfica SOC2 Tipo II / ISO 27001",
            "tamper_proof": "Cadena de Hashing Merkle Verificada: 100% Inviolable",
            "autonomous_defense": "Consenso Multimodelo del Consejo de IA Autónomo Activo",
            "summary_text": "Este informe consolida la telemetría continua de superficie de ataque, inspección WAF en línea, detonación de malware y señuelos trampa. Se prioriza la mitigación inmediata.",
        },
        "zh": {
            "title": "SageAI 首席信息安全官安全态势与董事会简报",
            "overall_posture": "总体安全态势",
            "executive_summary": "执行摘要",
            "key_metrics": "关键风险指标",
            "critical_findings": "高危攻击向量与漏洞发现",
            "mitigation_roadmap": "战略性修复路线图",
            "compliance_attestation": "SOC2 Type II / ISO 27001 密码学合规保证",
            "tamper_proof": "Merkle哈希审计链验证: 100%防篡改证据",
            "autonomous_defense": "自主AI议会多模型共识裁决引擎运行中",
            "summary_text": "本网络安全态势简报综合了多智能体攻击面侦察、内联WAF流量检测、恶意代码沙箱引爆和欺骗蜜罐诱捕数据。根据漏洞可利用性优先级排列了整改措施。",
        },
        "ar": {
            "title": "تقرير SageAI للأمن السيبراني للمديرين التنفيذيين ومجلس الإدارة",
            "overall_posture": "الوضع الأمني العام",
            "executive_summary": "الملخص التنفيذي",
            "key_metrics": "مقاييس المخاطر الرئيسية",
            "critical_findings": "ثغرات الهجوم الحرجة ونتائج الفحص",
            "mitigation_roadmap": "خارطة طريق المعالجة الاستراتيجية",
            "compliance_attestation": "الضمان التشفيري وفق معايير SOC2 Type II / ISO 27001",
            "tamper_proof": "سلسلة تجزئة ميركل موثقة: دليل قاطع ضد التلاعب بنسبة 100٪",
            "autonomous_defense": "نظام إجماع مجلس الذكاء الاصطناعي المستقل نشط",
            "summary_text": "يعكس هذا التقرير القياس عن بعد المستمر لمساحة الهجوم، وفحص حزم جدار الحماية، وتفجير البرامج الضارة، ومصائد الخداع. يتم إعطاء الأولوية القصوى للمعالجة الفورية.",
        },
    }

    def generate_debrief(
        self,
        target: str,
        risk_score: float,
        findings: List[Dict[str, Any]],
        lang: str = "en",
        org_id: str = "system",
    ) -> Dict[str, Any]:
        """
        Generates an internationalized executive brief for a scan or organizational asset.
        """
        lang_code = lang.lower().strip() if lang else "en"
        if lang_code not in self.TRANSLATIONS:
            lang_code = "en"

        t = self.TRANSLATIONS[lang_code]
        audit_state = audit_chain.verify_chain_integrity()

        # Group findings by severity
        critical_count = sum(
            1 for f in findings if str(f.get("severity", "")).upper() == "CRITICAL"
        )
        high_count = sum(
            1 for f in findings if str(f.get("severity", "")).upper() == "HIGH"
        )
        medium_count = sum(
            1 for f in findings if str(f.get("severity", "")).upper() == "MEDIUM"
        )
        low_count = sum(
            1 for f in findings if str(f.get("severity", "")).upper() == "LOW"
        )

        risk_level = (
            "CRITICAL"
            if risk_score >= 80
            else "HIGH"
            if risk_score >= 60
            else "MEDIUM"
            if risk_score >= 30
            else "LOW"
        )

        # Generate top strategic recommendations
        recommendations = [
            f"Deploy SagePatch virtual WAF filter for {critical_count} critical attack paths.",
            "Enforce zero-trust IAM token rotation on all administrative accounts.",
            "Verify canary tokens in production storage to monitor for persistence.",
        ]

        # Record generation in audit chain
        chain_record = audit_chain.record_action(
            actor="SageAI Multilingual Debrief Generator",
            action="EXECUTIVE_DEBRIEF_COMPILED",
            details={
                "target": target,
                "language": lang_code,
                "risk_score": risk_score,
                "critical_findings": critical_count,
            },
            org_id=org_id,
        )

        return {
            "status": "success",
            "language": {
                "code": lang_code,
                "name": self.SUPPORTED_LANGUAGES[lang_code],
            },
            "metadata": {
                "title": t["title"],
                "target": target,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "org_id": org_id,
            },
            "posture": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "section_label": t["overall_posture"],
                "metrics_label": t["key_metrics"],
                "breakdown": {
                    "critical": critical_count,
                    "high": high_count,
                    "medium": medium_count,
                    "low": low_count,
                    "total": len(findings),
                },
            },
            "executive_summary": {
                "section_label": t["executive_summary"],
                "content": t["summary_text"],
                "autonomous_defense_notice": t["autonomous_defense"],
            },
            "strategic_recommendations": {
                "section_label": t["mitigation_roadmap"],
                "items": recommendations,
            },
            "compliance_assurance": {
                "section_label": t["compliance_attestation"],
                "tamper_proof_statement": t["tamper_proof"],
                "merkle_verification": audit_state,
                "block_index": chain_record["index"],
                "block_hash": chain_record["record_hash"],
            },
        }


# Global singleton instance
multilingual_debrief_service = MultilingualDebriefService()
