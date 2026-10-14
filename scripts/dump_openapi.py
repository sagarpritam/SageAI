import json

from app.main import app

openapi_schema = app.openapi()
with open("frontend/openapi.json", "w") as f:
    json.dump(openapi_schema, f)
print("OpenAPI schema dumped to frontend/openapi.json")
