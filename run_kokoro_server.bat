@echo off
title Servidor de Voz IA Kokoro TTS (Puerto 8880)
echo ========================================================
echo   Iniciando Servidor de Voz IA Neuronal Kokoro TTS
echo   Puerto: http://localhost:8880
echo ========================================================
python "%~dp0kokoro_server\server.py"
pause
