"""Knowledge Base Ingestion Scripts."""

import asyncio
from .vector_store import vector_store

OWASP_TOP_10 = [
    {
        "title": "Broken Access Control",
        "text": "Broken Access Control attacks occur when users can act outside of their intended permissions. This can lead to unauthorized information disclosure, modification, or destruction of all data. Fix: Deny by default, implement role-based access control (RBAC), and log access control failures."
    },
    {
        "title": "Cryptographic Failures",
        "text": "Cryptographic Failures (formerly Sensitive Data Exposure) refer to the lack of proper encryption for data at rest and in transit. Fix: Use strong encryption like AES-256 for data at rest and modern TLS for data in transit. Avoid deprecated algorithms like MD5 or SHA1."
    },
    {
        "title": "Injection",
        "text": "Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. Fix: Use safe APIs, secure parameterized queries (Prepared Statements), and strict input validation."
    },
    {
        "title": "Insecure Design",
        "text": "Insecure Design focuses on risks related to design and architectural flaws. It calls for more use of threat modeling, secure design patterns, and reference architectures. Fix: Integrate security into the SDLC early (Shift-Left)."
    },
    {
        "title": "Security Misconfiguration",
        "text": "Security Misconfiguration is failing to properly secure default settings, having open cloud storage, verbose error messages, or missing HTTP security headers. Fix: Automate hardening, remove unused features, and deploy strict CSP/HSTS headers."
    },
    {
        "title": "Vulnerable and Outdated Components",
        "text": "Using components with known vulnerabilities exposes applications to attacks. Fix: Continuously scan dependencies using tools like Trivy or Dependabot. Keep libraries and frameworks patched to the latest stable versions."
    },
    {
        "title": "Identification and Authentication Failures",
        "text": "Authentication Failures allow attackers to compromise passwords, keys, or session tokens. Fix: Require multi-factor authentication (MFA), enforce strong password policies, and ensure session IDs are securely generated and invalidated upon logout."
    },
    {
        "title": "Software and Data Integrity Failures",
        "text": "Integrity failures relate to code and infrastructure that does not protect against modification, like CI/CD pipelines lacking validation, or deserialization of untrusted data. Fix: Digitally sign code, use secure package managers, and avoid untrusted deserialization."
    },
    {
        "title": "Security Logging and Monitoring Failures",
        "text": "Without logging and monitoring, breaches cannot be detected. Attackers rely on this to maintain persistence. Fix: Log all auth/access events, send logs to centralized SIEM, and set up alerts for suspicious activity."
    },
    {
        "title": "Server-Side Request Forgery (SSRF)",
        "text": "SSRF occurs when a web app fetches a remote resource without validating the user-supplied URL. It allows an attacker to force the server to connect to internal systems. Fix: Use allow-lists for URLs, disable HTTP redirections, and do not send raw responses to clients."
    }
]

async def seed_knowledge_base():
    """Seed the vector store with initial cybersecurity knowledge."""
    print("Seeding vector store with OWASP Top 10...")
    for item in OWASP_TOP_10:
        await vector_store.add_document(
            text=f"{item['title']}: {item['text']}",
            metadata={"source": "OWASP Top 10", "title": item["title"]}
        )
    print("Done seeding knowledge base.")

if __name__ == "__main__":
    asyncio.run(seed_knowledge_base())
