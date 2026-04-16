@echo off
echo Starting Sortify Backend...
cd %~dp0backend
pip install flask flask-cors
python server.py
pause
