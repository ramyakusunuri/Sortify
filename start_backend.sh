#!/bin/bash
echo "Starting Sortify Backend..."
cd "$(dirname "$0")/backend"
pip install flask flask-cors 2>/dev/null || pip3 install flask flask-cors
python server.py || python3 server.py
