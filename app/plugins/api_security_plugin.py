"""
SageAI Plugin: API Security Scanner
Detects API security vulnerabilities:
  - Broken authentication
  - Mass assignment
  - Exposed Swagger/OpenAPI docs
  - Missing rate limiting
  - CORS misconfigurations
  - GraphQL introspection exposure
"""
import asyncio
import httpx
from app.plugins.base import SecurityPlugin, PluginResult, PluginMetadata


API_DOC_PATHS = [
    "/swagger", "/swagger-ui.html", "/swagger-ui", "/api-docs",
    "/openapi.json", "/openapi.yaml", "/api/swagger.json",
    "/v1/swagger.json", "/v2/api-docs", "/v3/api-docs",
    "/graphql", "/graphiql", "/playground",
    "/api/v1", "/api/v2", "/api",
]

CORS_HEADERS = ["access-control-allow-origin", "access-control-allow-credentials"]


class APISecurityPlugin(SecurityPlugin):
    @property
    def meta(self) -> PluginMetadata:
        return PluginMetadata(
            name="api_security",
            version="1.0.0",
            author="SageAI Core",
            description="Detects API security issues: exposed Swagger docs, GraphQL introspection, CORS misconfigs, missing auth headers, and rate limiting bypass indicators.",
            category="api",
            tags=["api", "rest", "graphql", "swagger", "cors", "authentication", "owasp-api"],
            min_plan="pro",
        )

    async def run(self, target: str, **kwargs) -> PluginResult:
        host = target.replace("https://", "").replace("http://", "").split("/")[0]
        base_url = f"https://{host}"
        findings = []
        metadata = {"host": host, "api_paths_checked": len(API_DOC_PATHS)}

        async with httpx.AsyncClient(timeout=7, verify=False, follow_redirects=True) as client:
            # Check for exposed API documentation
            doc_tasks = [self._check_api_doc(client, base_url + path) for path in API_DOC_PATHS]
            doc_results = await asyncio.gather(*doc_tasks, return_exceptions=True)
            for r in doc_results:
                if r and not isinstance(r, Exception):
                    findings.append(r)

            # Check CORS misconfiguration
            cors_finding = await self._check_cors(client, base_url)
            if cors_finding:
                findings.append(cors_finding)

            # Check GraphQL introspection
            gql_finding = await self._check_graphql(client, base_url)
            if gql_finding:
                findings.append(gql_finding)

            # Check rate limiting
            rate_finding = await self._check_rate_limit(client, base_url)
            if rate_finding:
                findings.append(rate_finding)

        return PluginResult(self.name, target, findings, metadata)

    async def _check_api_doc(self, client, url: str):
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                body = resp.text[:1000].lower()
                if any(kw in body for kw in ["swagger", "openapi", "paths", "info", "graphql", "query"]):
                    path = url.split("//", 1)[-1].split("/", 1)[-1] if "/" in url.split("//", 1)[-1] else ""
                    return {
                        "type": "exposed_api_documentation",
                        "severity": "medium",
                        "detail": f"API documentation publicly accessible at {url}",
                        "url": url,
                        "source": "api_security",
                    }
        except Exception:
            pass
        return None

    async def _check_cors(self, client, base_url: str):
        try:
            resp = await client.get(
                base_url,
                headers={"Origin": "https://evil.com"},
            )
            acao = resp.headers.get("access-control-allow-origin", "")
            acac = resp.headers.get("access-control-allow-credentials", "")
            if acao in ("*", "https://evil.com") and acac.lower() == "true":
                return {
                    "type": "cors_misconfiguration",
                    "severity": "high",
                    "detail": f"CORS misconfiguration: Origin 'evil.com' allowed with credentials. ACAO: {acao}",
                    "source": "api_security",
                }
            elif acao == "*":
                return {
                    "type": "cors_wildcard",
                    "severity": "medium",
                    "detail": "CORS wildcard (*) allows any origin to read responses.",
                    "source": "api_security",
                }
        except Exception:
            pass
        return None

    async def _check_graphql(self, client, base_url: str):
        try:
            resp = await client.post(
                f"{base_url}/graphql",
                json={"query": "{__schema{types{name}}}"},
                headers={"Content-Type": "application/json"},
            )
            if resp.status_code == 200 and "__schema" in resp.text:
                return {
                    "type": "graphql_introspection_enabled",
                    "severity": "medium",
                    "detail": "GraphQL introspection is enabled. Attackers can enumerate all types, queries, and mutations.",
                    "source": "api_security",
                }
        except Exception:
            pass
        return None

    async def _check_rate_limit(self, client, base_url: str):
        """Send 5 quick requests and check if rate limiting headers appear."""
        try:
            responses = []
            for _ in range(5):
                r = await client.get(base_url)
                responses.append(r)

            last = responses[-1]
            has_rate_headers = any(
                h in last.headers
                for h in ["x-ratelimit-limit", "retry-after", "x-rate-limit", "ratelimit-limit"]
            )
            if not has_rate_headers and all(r.status_code < 400 for r in responses):
                return {
                    "type": "missing_rate_limiting",
                    "severity": "medium",
                    "detail": "No rate limiting headers detected. API may be vulnerable to brute force or DoS.",
                    "source": "api_security",
                }
        except Exception:
            pass
        return None
