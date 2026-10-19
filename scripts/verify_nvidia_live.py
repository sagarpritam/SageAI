import asyncio
import os
import sys

from dotenv import load_dotenv

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.core.config import settings
from app.services.llm.gateway import llm_gateway


async def verify_nvidia():
    print("Testing NVIDIA Live Integration...")

    # Reload env just in case
    load_dotenv()

    if not settings.NVIDIA_API_KEY or settings.NVIDIA_API_KEY == "":
        print("ERROR: NVIDIA_API_KEY NOT FOUND IN .ENV")
        return

    print(f"Using API Key: {settings.NVIDIA_API_KEY[:10]}...")

    test_prompt = "What are the common vulnerabilities in OpenSSH 7.2?"

    try:
        reply = await llm_gateway.generate(
            prompt=test_prompt,
            provider="nvidia",
            model="meta/llama-3.3-70b-instruct",  # Flagship NVIDIA NIM Model
            org_id="test_org",
        )

        print("\n--- NVIDIA RESPONSE ---")
        print(reply)
        print("-----------------------\n")
        print("SUCCESS: NVIDIA Integration is LIVE!")

    except Exception as e:
        print(f"ERROR: Failed to connect to NVIDIA API: {e}")


if __name__ == "__main__":
    asyncio.run(verify_nvidia())
