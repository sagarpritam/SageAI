import os
import sys
import argparse
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_social_post(platform: str, audience: str) -> str:
    """Generates a high-converting social media post for SageAI launch."""
    
    prompt = f"""
    You are the indie hacker founder of SageAI, an autonomous AI pentesting platform.
    Your goal is to acquire your first 50 B2B users.
    
    Write a compelling launch post for {platform} targeting {audience}.
    
    Guidelines:
    - Tone: Authentic, vulnerable, and technical.
    - Story: "I was tired of paying $10k for basic pentests, so I built an AI agent to do it for free."
    - Feature drop: Mention the NeMo Red Teaming engine, PDF reports, and the live attack graph.
    - CTA: "Looking for 50 early users to break it. Link in the comments."
    - If platform is Reddit (r/SaaS or r/cybersecurity), focus on the technical stack and problem solved.
    - If platform is X/Twitter, keep it punchy and use threaded style (e.g., 🧵 1/x).
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a master of indie-hacker SaaS storytelling and growth marketing."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating post: {str(e)}"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SageAI Social Post Generator")
    parser.add_argument("--platform", type=str, choices=["reddit", "twitter", "linkedin"], required=True, help="Social Platform")
    parser.add_argument("--audience", type=str, default="SaaS Founders & CTOs", help="Target Audience")
    
    args = parser.parse_args()
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in .env")
        sys.exit(1)
        
    print(f"\n🚀 Generating {args.platform.capitalize()} launch strategy for {args.audience}...\n")
    post = generate_social_post(args.platform, args.audience)
    print("=" * 50)
    print(post)
    print("=" * 50)
    print("\n✅ Ready to publish!")
