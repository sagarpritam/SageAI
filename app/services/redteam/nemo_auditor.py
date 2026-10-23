import logging
from typing import Any, Dict, List, Optional, cast

from nemo_microservices import NeMoMicroservices

from app.core.config import settings

logger = logging.getLogger("SageAI.redteam")


class NeMoAuditor:
    """
    NVIDIA NeMo Auditor Service for AI Red Teaming.

    This service allows SafeAI to audit LLM targets (like OpenAI, Anthropic, etc.)
    for security and safety guardrail violations.
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.AUDITOR_BASE_URL
        # Initialize the NeMo Microservices client
        try:
            self._client = NeMoMicroservices(base_url=self.base_url)
        except Exception as e:
            logger.error(f"Failed to initialize NeMo Auditor client: {e}")
            self._client = None

    def create_target(
        self,
        name: str,
        model: str,
        uri: str,
        target_type: str = "openai.OpenAIGenerator",
        namespace: str = "default",
        options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Creates an audit target for the NeMo Auditor.
        """
        if not self._client:
            raise RuntimeError("NeMo Auditor client is not initialized")

        default_options: Dict[str, Any] = {"openai": {"uri": uri, "max_tokens": 1024, "seed": 42}}

        try:
            target = cast(Any, self._client.beta.audit.targets).create(
                namespace=namespace,
                name=name,
                type=target_type,
                model=model,
                options=options or default_options,
            )
            return target.model_dump()
        except Exception as e:
            logger.error(f"Failed to create audit target: {e}")
            raise

    def list_targets(self, namespace: str = "default") -> List[Dict[str, Any]]:
        """
        Lists all registered audit targets.
        """
        if not self._client:
            raise RuntimeError("NeMo Auditor client is not initialized")

        try:
            targets = cast(Any, self._client.beta.audit.targets).list(namespace=namespace)
            return [t.model_dump() for t in targets]
        except Exception as e:
            logger.error(f"Failed to list audit targets: {e}")
            raise

    def start_audit(
        self,
        target_name: str,
        namespace: str = "default",
        probes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Starts an automated audit (red teaming) job on a specific target.
        """
        if not self._client:
            raise RuntimeError("NeMo Auditor client is not initialized")

        try:
            # Typical probes include 'jailbreak', 'pii_leakage', 'offensive_content'
            job = cast(Any, self._client.beta.audit.jobs).create(
                namespace=namespace,
                target_name=target_name,
                probes=probes or ["jailbreak"],
            )
            return job.model_dump()
        except Exception as e:
            logger.error(f"Failed to start audit job: {e}")
            raise

    def get_job_results(
        self, job_id: str, namespace: str = "default"
    ) -> Dict[str, Any]:
        """
        Retrieves the results/findings of an completed audit job.
        """
        if not self._client:
            raise RuntimeError("NeMo Auditor client is not initialized")

        try:
            results = self._client.beta.audit.jobs.get(  # type: ignore[call-arg]
                namespace=namespace, name=job_id
            )
            return results.model_dump()
        except Exception as e:
            logger.error(f"Failed to get audit results: {e}")
            raise


# Global singleton
nemo_auditor = NeMoAuditor()
