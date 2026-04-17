import os
import subprocess
import json
import requests
from openai import OpenAI

# Get env variables
openai_api_key = os.environ["OPENAI_API_KEY"]
github_token = os.environ["GITHUB_TOKEN"]
pr_number = os.environ["PR_NUMBER"]
repo = os.environ["REPO"]
base_sha = os.environ["BASE_SHA"]
head_sha = os.environ["HEAD_SHA"]

# Step 1: Get the git diff
diff = subprocess.check_output(
    ["git", "diff", base_sha, head_sha],
    text=True
)

# Limit diff size to avoid large token usage
diff = diff[:8000]

# Step 2: Ask OpenAI to review the diff
client = OpenAI(api_key=openai_api_key)

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    max_tokens=2000,
    messages=[
        {
            "role": "system",
            "content": "You are a senior code reviewer. When given a git diff, you respond ONLY with a JSON array of review comments. No explanation, no markdown, just raw JSON."
        },
        {
            "role": "user",
            "content": f"""Review this git diff and provide feedback.

For each issue found, respond in this exact JSON format (an array of objects):
[
  {{
    "path": "filename.py",
    "line": 15,
    "comment": "Your review comment here explaining the issue and how to fix it"
  }}
]

Focus on: bugs, security issues, performance problems, bad practices, code style.
If the code looks good, return an empty array: []

Git diff to review:
{diff}

Respond ONLY with the JSON array, no other text."""
        }
    ]
)

# Step 3: Parse the AI response
response_text = response.choices[0].message.content.strip()

# Strip markdown code fences if GPT wraps the JSON in them
if response_text.startswith("```"):
    response_text = response_text.split("```")[1]
    if response_text.startswith("json"):
        response_text = response_text[4:]
    response_text = response_text.strip()

try:
    comments = json.loads(response_text)
except json.JSONDecodeError:
    print("Could not parse AI response:")
    print(response_text)
    comments = []

# Step 4: Post inline comments on the PR via GitHub API
headers = {
    "Authorization": f"Bearer {github_token}",
    "Accept": "application/vnd.github+json"
}

for item in comments:
    payload = {
        "body": f"🤖 **AI Review (GPT-4o):** {item['comment']}",
        "commit_id": head_sha,
        "path": item["path"],
        "line": item["line"],
        "side": "RIGHT"
    }

    result = requests.post(
        f"https://api.github.com/repos/{repo}/pulls/{pr_number}/comments",
        headers=headers,
        json=payload
    )

    if result.status_code == 201:
        print(f"✅ Posted comment on {item['path']} line {item['line']}")
    else:
        print(f"⚠️ Failed to post comment on {item['path']} line {item['line']}: {result.text}")

print("✅ AI review complete!")
