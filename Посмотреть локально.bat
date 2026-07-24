@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=8123
title Предпросмотр погоды — НЕ закрывай это окно, пока смотришь сайт
echo ============================================
echo   Локальный предпросмотр сайта погоды
echo ============================================
echo.
echo  Сейчас откроется браузер по адресу:
echo      http://localhost:%PORT%
echo.
echo  ВАЖНО: НЕ закрывай это чёрное окно, пока смотришь сайт —
echo  оно держит локальный сервер. Закрыл окно = выключил сервер.
echo.
rem  Браузер открываем с задержкой 2 сек — чтобы сервер успел подняться
start "" cmd /c "timeout /t 2 >nul & explorer http://localhost:%PORT%/index.html"
rem  Поднимаем простой статический сервер (Python установлен по этому пути)
"C:\Users\Admin\AppData\Local\Python\bin\python.exe" -m http.server %PORT%
echo.
echo  Сервер остановлен. Можешь закрыть окно.
pause
