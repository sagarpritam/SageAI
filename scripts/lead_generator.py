import argparse
import os
import sys

import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_cold_dm(target_name: str, target_role: str, target_company: str) -> str:
    """Generates a highly personalized cold DM tailored for cybersecurity acquisition."""

    prompt = f"""
    You are the founder of SageAI, an autonomous AI pentesting platform.
    Your goal is to acquire your first 50 B2B users.

    Write a short, punchy, high-converting cold Twitter/LinkedIn DM to this person:
    - Name: {target_name}
    - Role: {target_role}
    - Company: {target_company}

    Guidelines:
    - Keep it under 4 sentences.
    - Casual, founder-to-founder tone (no corporate speak).
    - The hook: "I noticed [Company] is scaling, and I'm looking for beta testers for an AI pentester."
    - The offer: A free, 5-minute autonomous vulnerability scan.
    - End with a low-friction question: "Mind if I send the link?"
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a master of B2B SaaS growth hacking.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=200,
        )
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        return f"Error generating DM: {str(e)}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SageAI Cold DM Generator")
    parser.add_argument("--name", type=str, required=True, help="Target's Name")
    parser.add_argument("--role", type=str, default="Founder/CTO", help="Target's Role")
    parser.add_argument("--company", type=str, required=True, help="Target's Company")

    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in .env")
        sys.exit(1)

    print(
        f"\n🚀 Generating personalized outreach for {args.name} at {args.company}...\n"
    )
    dm = generate_cold_dm(args.name, args.role, args.company)
    print("=" * 50)
    print(dm)
    print("=" * 50)
    print("\n✅ Ready to copy-paste!")
