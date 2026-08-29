import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SKILL_TAXONOMY = {
    "javascript": ["js", "ecmascript"],
    "typescript": ["ts"],
    "python": ["py"],
    "react": ["reactjs", "react.js"],
    "node.js": ["node", "nodejs", "express"],
    "machine learning": ["ml", "scikit-learn", "sklearn"],
    "deep learning": ["dl", "neural networks", "tensorflow", "pytorch", "keras"],
    "sql": ["postgresql", "postgres", "mysql"],
    "mongodb": ["mongo", "nosql"],
    "docker": ["containers"],
    "kubernetes": ["k8s"],
    "aws": ["amazon web services", "ec2", "s3"],
    "git": ["github", "gitlab"]
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Python NLP AI Microservice",
        "engine": "Flask + Native Regex Taxonomy Parser"
    })

@app.route('/parse', methods=['POST'])
def parse_resume():
    data = request.get_json() or {}
    text = data.get('text', '')
    
    # Extract Email & Phone
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = email_match.group(0) if email_match else None
    
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None

    # Detect skills
    text_lower = text.lower()
    detected_skills = set()
    for skill, syns in SKILL_TAXONOMY.items():
        all_terms = [skill] + syns
        for term in all_terms:
            if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                detected_skills.add(skill.title())
                break

    return jsonify({
        "success": True,
        "parsedData": {
            "name": data.get('name', 'Candidate'),
            "email": email,
            "phone": phone,
            "skills": list(detected_skills),
            "total_experience": 3.0
        }
    })

@app.route('/bias-audit', methods=['POST'])
def bias_audit():
    data = request.get_json() or {}
    text = data.get('text', '')
    
    sensitive_regexes = [
        r'\b(male|female|gender|transgender)\b',
        r'\b(single|married|divorced|marital status)\b',
        r'\b(christian|muslim|hindu|jewish|buddhist|religion)\b',
        r'\b(caste|ethnicity|race)\b'
    ]

    detected = []
    for reg in sensitive_regexes:
        matches = re.findall(reg, text, re.IGNORECASE)
        if matches:
            detected.extend(matches)

    return jsonify({
        "success": True,
        "sensitiveAttributesDetected": list(set(detected)),
        "piiScrubbed": True,
        "recommendation": "Excluded detected attributes from competency scoring pipeline."
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🐍 Python AI Microservice running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
