from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)

keypress_log = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/log_keypress', methods=['POST'])
def log_keypress():
    data = request.get_json()
    if data:
        keypress_entry = {
            'key': data.get('key'),
            'timestamp': data.get('timestamp')
        }
        keypress_log.append(keypress_entry)
        return jsonify({"status": "success", "logged_key": keypress_entry}), 200
    return jsonify({"status": "error", "message": "Invalid data"}), 400

@app.route('/keypress_log', methods=['GET'])
def get_keypress_log():
    return jsonify(keypress_log), 200

@app.route('/clear_log', methods=['POST'])
def clear_log():
    global keypress_log
    keypress_log = []
    return jsonify({"status": "success", "message": "Log cleared"}), 200

if __name__ == "__main__":
    app.run(debug=True)
