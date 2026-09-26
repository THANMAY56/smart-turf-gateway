from flask import Flask, jsonify
from flask_cors import CORS
import serial
import threading
import time
import random

app = Flask(__name__)
CORS(app)

turf_state = {
    "moisture": 50,
    "temperature": 50,
    "wear": 20,
    "health_score": 95.0,
    "status": "OPEN"
}

SERIAL_PORT = 'COM3' 
BAUD_RATE = 9600

def calculate_health(moisture, temp, wear):
    m_pct = (moisture / 1023.0) * 100
    t_pct = (temp / 1023.0) * 100
    w_pct = (wear / 1023.0) * 100

    m_penalty = abs(50 - m_pct) * 0.4 
    t_penalty = (t_pct - 50) * 0.3 if t_pct > 50 else 0 
    w_penalty = w_pct * 0.7 

    health = 100 - (m_penalty + t_penalty + w_penalty)
    health = max(0, min(100, health))
    return round(health, 1), m_pct, t_pct, w_pct

def serial_listener():
    global turf_state
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        while True:
            line = ser.readline().decode('utf-8').strip()
            if line.startswith("TELEMETRY:"):
                data = line.split(":")[1].split(",")
                if len(data) == 3:
                    raw_m, raw_t, raw_w = int(data[0]), int(data[1]), int(data[2])
                    score, m_pct, t_pct, w_pct = calculate_health(raw_m, raw_t, raw_w)
                    turf_state["moisture"] = round(m_pct, 1)
                    turf_state["temperature"] = round(t_pct, 1)
                    turf_state["wear"] = round(w_pct, 1)
                    turf_state["health_score"] = score
                    
                    if score < 45.0:
                        turf_state["status"] = "MAINTENANCE_LOCKED"
                    elif score < 65.0:
                        turf_state["status"] = "WARNING_HIGH_WEAR"
                    else:
                        turf_state["status"] = "OPEN"
    except Exception:
        while True:
            turf_state["wear"] = min(100, turf_state["wear"] + random.uniform(0.5, 2.0))
            score, _, _, _ = calculate_health(
                turf_state["moisture"] * 10.23, 
                turf_state["temperature"] * 10.23, 
                turf_state["wear"] * 10.23
            )
            turf_state["health_score"] = score
            if score < 45.0:
                turf_state["status"] = "MAINTENANCE_LOCKED"
            time.sleep(2)

@app.route('/api/telemetry', methods=['GET'])
def get_telemetry():
    return jsonify(turf_state)

if __name__ == '__main__':
    threading.Thread(target=serial_listener, daemon=True).start()
    app.run(port=5000, host='0.0.0.0')
