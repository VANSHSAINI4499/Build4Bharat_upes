from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app) # Allow React frontend to access

# Global variable to keep track of the mouse process
mouse_process = None

@app.route('/api/start-mouse', methods=['POST'])
def start_mouse():
    global mouse_process
    if mouse_process is None or mouse_process.poll() is not None:
        try:
            # Assumes virtualmouse.py is in the same directory
            script_path = os.path.join(os.path.dirname(__file__), 'virtualmouse.py')
            mouse_process = subprocess.Popen(['python', script_path])
            return jsonify({"status": "success", "message": "Virtual mouse started"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        return jsonify({"status": "warning", "message": "Virtual mouse is already running"}), 200

@app.route('/api/stop-mouse', methods=['POST'])
def stop_mouse():
    global mouse_process
    if mouse_process is not None and mouse_process.poll() is None:
        mouse_process.terminate()
        mouse_process = None
        return jsonify({"status": "success", "message": "Virtual mouse stopped"}), 200
    else:
        return jsonify({"status": "warning", "message": "Virtual mouse is not running"}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
