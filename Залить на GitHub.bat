@echo off
chcp 65001 >nul
cd /d "%~dp0"
set GIT="C:\Program Files\Git\cmd\git.exe"
echo ============================================
echo   Заливаю обновление сайта погоды на GitHub
echo ============================================
echo.

if exist ".git" goto haverepo
echo Папка ещё не связана с GitHub — сейчас свяжем (это один раз).
echo Открой свой репозиторий на github.com и скопируй адрес из строки браузера.
echo Пример: https://github.com/matveja329-dot/имя-репозитория
echo.
set /p REPO=Вставь адрес репозитория и нажми Enter:
if "%REPO%"=="" (
  echo Адрес пустой — ничего не сделал. Запусти файл заново.
  pause
  exit /b 1
)
%GIT% init -b main
%GIT% remote add origin %REPO%
:haverepo

rem --- имя для коммитов (если ещё не настроено) ---
%GIT% config user.name >nul 2>&1 || %GIT% config user.name "matveja329-dot"
%GIT% config user.email >nul 2>&1 || %GIT% config user.email "matveja329-dot@users.noreply.github.com"

rem --- сохраняем ВСЕ изменения и отправляем ---
%GIT% add -A
%GIT% commit -m "Обновление сайта %date% %time%"
rem --force: главная версия сайта — эта папка, история на GitHub просто заменяется
%GIT% push -u --force origin main
echo.
if %errorlevel%==0 (
  echo --- ГОТОВО! Изменения улетели на GitHub. ---
  echo Подожди ~1 минуту и переоткрой приложение на телефоне.
) else (
  echo --- Что-то пошло не так. Если открылось окно входа — войди в GitHub
  echo --- и запусти этот файл ещё раз. Иначе напиши мне код ошибки выше.
)
echo.
pause
