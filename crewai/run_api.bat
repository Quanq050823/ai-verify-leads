@echo off
echo Khởi động CrewAI Transcript Analysis API...
echo.

echo Kiểm tra và cài đặt các thư viện cần thiết...
pip install -r requirements.txt

echo.
echo Khởi động server tại địa chỉ http://localhost:5000
echo.
python api_server.py

pause 