import json

d = json.load(open("bandit_high.json", encoding="utf-8"))
for r in d["results"]:
    if r["issue_severity"] == "HIGH":
        print(f"{r['filename']}:{r['line_number']} {r['issue_text']}")
