# cpde.py — MQTT -> HTTP polling bridge (visible status)
# Run: pip install paho-mqtt flask
# Then: python cpde.py
import json
import base64
import re
import threading
import time
from typing import Optional
import socket

from flask import Flask, jsonify, make_response
import paho.mqtt.client as mqtt

# ==== MQTT CONFIG ====
BROKER = "192.168.5.121"
PORT = 1883
# Adjust this to your exact uplink topic if needed
UPLINK_TOPIC = "application/+/device/+/event/up"

# ==== STATE ====
latest_value: Optional[float] = None

def extract_value_from_payload(payload: dict) -> Optional[float]:
    for path in (
        ("object", "vibration"),
        ("decoded_payload", "vibration"),
        ("object", "rms"),
        ("decoded_payload", "rms"),
    ):
        try:
            v = payload
            for k in path:
                v = v[k]
            return float(v)
        except Exception:
            pass

    data_b64 = payload.get("data")
    if data_b64:
        try:
            raw = base64.b64decode(data_b64)
            txt = raw.decode("utf-8", errors="ignore")
            m = re.search(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", txt)
            if m:
                return float(m.group(0))
        except Exception:
            pass

    return None

# ==== MQTT CALLBACKS ====
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        client.subscribe(UPLINK_TOPIC)
        print(f"✅ MQTT connected, subscribed to {UPLINK_TOPIC}")
    else:
        print(f"❌ MQTT failed to connect (rc={rc})")

def on_message(client, userdata, msg):
    global latest_value
    if not msg.topic.endswith("/event/up"):
        return

    try:
        payload = json.loads(msg.payload.decode())
        v = extract_value_from_payload(payload)
        if v is None:
            return
        latest_value = float(v)
        print(f"{latest_value:.2f}")
        # --- Save timestamp + value to Data.txt ---
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        with open("Data.txt", "a") as f:
            f.write(f"{timestamp},{latest_value}\n")
    except Exception:
        # If payload wasn't JSON, try to parse raw number from text
        try:
            s = msg.payload.decode(errors="ignore")
            m = re.search(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", s)
            if m:
                latest_value = float(m.group(0))
                print(f"{latest_value:.2f}")
                # --- Save timestamp + value to Data.txt ---
                timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                with open("Data.txt", "a") as f:
                    f.write(f"{timestamp},{latest_value}\n")
        except Exception:
            pass
# ...existing code...

# ==== START MQTT ====
mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(BROKER, PORT)
mqtt_client.loop_start()

# ==== FLASK HTTP (polling endpoint) ====
app = Flask(__name__)

@app.get("/latest")
def latest():
    resp = make_response(jsonify({"value": latest_value}))
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "no-store"
    return resp

def run_http():
    # Try to print host IPs for convenience
    hostname = socket.gethostname()
    try:
        host_ip = socket.gethostbyname(hostname)
    except Exception:
        host_ip = "127.0.0.1"
    print("🌐 HTTP server for chart polling:")
    print(f"    http://127.0.0.1:8765/latest")
    print(f"    http://{host_ip}:8765/latest  (use this from other devices)")
    app.run(host="0.0.0.0", port=8765, debug=False, use_reloader=False)

threading.Thread(target=run_http, daemon=True).start()

# ==== KEEP PROCESS ALIVE ====
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass
