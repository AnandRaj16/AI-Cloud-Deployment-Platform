# Groq Setup (openai/gpt-oss-120b)

## 1) Environment variable

Set this in `upload-server/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

The server loads this automatically via:

```ts
import "dotenv/config";
```

## 2) Model used by the app

The `/ask` endpoint in `upload-server/src/index.ts` uses:

`openai/gpt-oss-120b`

with Groq OpenAI-compatible endpoint:

`https://api.groq.com/openai/v1/chat/completions`

## 3) Python usage example (Groq + OpenAI SDK)

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.responses.create(
    input="Explain the importance of fast language models",
    model="openai/gpt-oss-120b",
)

print(response.output_text)
```

## 4) Run

From `upload-server`:

```bash
tsc -b
node dist/index.js
```
