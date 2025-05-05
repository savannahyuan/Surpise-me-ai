from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# DeepSeek API credentials
API_KEY = "sk-c053a62baaa04efb9f19834b9b96d703"
BASE_URL = "https://api.deepseek.com"

# ✅ Serve the frontend files
@app.route("/")
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route("/<path:filename>")
def serve_file(filename):
    return send_from_directory('.', filename)

# ✅ Handle POST /generate
@app.route("/generate", methods=["POST"])
def generate_items():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")

        if not prompt:
            return jsonify({"error": "Prompt is missing"}), 400

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a list generator. You will returns a list of items with short text only without any additional message. No numbers in the outputs."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }

        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            headers=headers,
            json=payload
        )

        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']

        items = [line.strip("-• \n") for line in content.strip().split("\n") if line.strip()]

        return jsonify({"items": items})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
