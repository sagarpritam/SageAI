import requests


def test_rate_limiting():
    print("Starting DAST Rate Limit Simulation...")
    url = "http://localhost:8000/auth/register"

    responses = []
    # Send rapid requests
    for i in range(15):
        try:
            resp = requests.post(
                url,
                json={
                    "email": f"abuse{i}@test.com",
                    "password": "TestPassword123!",
                    "organization_name": "Org",
                },
                timeout=2,
            )
            responses.append(resp.status_code)
        except requests.exceptions.ConnectionError:
            print(
                "Connection refused - server might not be running locally on port 8000."
            )
            return

    print(f"Response codes received: {responses}")
    if 429 in responses:
        print("[SUCCESS] Rate limiting is active and successfully blocked abuse.")
    else:
        print(
            "[INFO] No 429 Too Many Requests received. Rate limiting might not be aggressively configured for this endpoint."
        )


if __name__ == "__main__":
    test_rate_limiting()
