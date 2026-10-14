import json

d = json.load(open("bandit_high.json", encoding="utf-8"))
with open("bandit_high2.txt", "w", encoding="utf-8") as f:
    f.write(
        "\n".join(
            [
                f"{r['filename']}:{r['line_number']} {r['issue_text']}"
                for r in d["results"]
                if r["issue_severity"] == "HIGH"
            ]
        )
    )
