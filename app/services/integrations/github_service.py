import httpx
import logging
import base64

logger = logging.getLogger("SageAI.github_service")

class GitHubServiceError(Exception):
    pass

class GitHubService:
    def __init__(self, token: str):
        """Initialize GitHubService with a decrypted PAT."""
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        self.base_url = "https://api.github.com"
        # We use a short timeout since agents wait for this
        self.timeout = 10.0

    async def fetch_file_content(self, owner: str, repo: str, file_path: str, ref: str = "main") -> str:
        """Fetches the raw file content from the repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{file_path}?ref={ref}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, timeout=self.timeout)
            if resp.status_code == 404:
                raise GitHubServiceError(f"File not found: {file_path}")
            resp.raise_for_status()
            data = resp.json()
            if data["encoding"] != "base64":
                raise GitHubServiceError(f"Unsupported encoding: {data['encoding']}")
            return base64.b64decode(data["content"]).decode("utf-8")

    async def get_master_sha(self, owner: str, repo: str, base_branch: str = "main") -> str:
        """Gets the SHA of the latest commit on the base branch."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/refs/heads/{base_branch}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, timeout=self.timeout)
            resp.raise_for_status()
            return resp.json()["object"]["sha"]

    async def create_branch(self, owner: str, repo: str, base_branch: str, new_branch: str) -> None:
        """Creates a new branch off the base branch."""
        sha = await self.get_master_sha(owner, repo, base_branch)
        url = f"{self.base_url}/repos/{owner}/{repo}/git/refs"
        payload = {
            "ref": f"refs/heads/{new_branch}",
            "sha": sha
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            if resp.status_code == 422:
                # Branch likely already exists
                pass
            else:
                resp.raise_for_status()

    async def get_file_sha(self, owner: str, repo: str, file_path: str, branch: str) -> str:
        """Gets the existing blob SHA for a file to update it."""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{file_path}?ref={branch}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, timeout=self.timeout)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()["sha"]

    async def commit_file(self, owner: str, repo: str, branch: str, file_path: str, content: str, message: str) -> str:
        """Commits a single file change to a specific branch. Returns commit URL."""
        file_sha = await self.get_file_sha(owner, repo, file_path, branch)
        
        encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{file_path}"
        
        payload = {
            "message": message,
            "content": encoded_content,
            "branch": branch
        }
        if file_sha:
            payload["sha"] = file_sha
            
        async with httpx.AsyncClient() as client:
            resp = await client.put(url, json=payload, headers=self.headers, timeout=self.timeout)
            resp.raise_for_status()
            return resp.json()["commit"]["html_url"]

    async def create_pull_request(self, owner: str, repo: str, head_branch: str, base_branch: str, title: str, body: str) -> str:
        """Opens a Pull Request and applies relevant labels. Returns PR URL."""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
        payload = {
            "title": title,
            "body": body,
            "head": head_branch,
            "base": base_branch
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            resp.raise_for_status()
            pr_data = resp.json()
            pr_url = pr_data["html_url"]
            pr_number = pr_data["number"]
            
            # Try to add labels
            try:
                await self._add_labels(owner, repo, pr_number, ["security", "sageai-fix"])
            except Exception as e:
                logger.warning(f"Could not add labels to PR #{pr_number}: {e}")
                
            return pr_url

    async def _add_labels(self, owner: str, repo: str, pr_number: int, labels: list[str]) -> None:
        """Adds labels to an Issue/PR."""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{pr_number}/labels"
        payload = {"labels": labels}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=self.headers, timeout=self.timeout)
            resp.raise_for_status()
