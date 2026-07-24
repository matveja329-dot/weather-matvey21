@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===============================================================
echo    ВХОД В GITHUB ПО ТОКЕНУ  (нужно сделать только один раз)
echo ===============================================================
echo.
echo Сейчас в браузере откроется страница создания токена.
echo.
echo   1) Если попросит - войди в свой аккаунт matveja329-dot
echo   2) Прокрути страницу ВНИЗ и нажми зелёную кнопку
echo      "Generate token"
echo   3) Появится код, начинается на  ghp_...  -- СКОПИРУЙ его
echo   4) Вернись в это чёрное окно, кликни правой кнопкой мыши
echo      (так вставляется текст) и нажми Enter
echo.
echo Открываю страницу...
start "" "https://github.com/settings/tokens/new?scopes=repo&description=weather-matvey21"
echo.
set /p TOKEN=Вставь токен сюда и нажми Enter:
if "%TOKEN%"=="" (
  echo.
  echo Токен пустой - ничего не сделал. Запусти файл заново.
  echo.
  pause
  exit /b 1
)

set GIT="C:\Program Files\Git\cmd\git.exe"

rem --- сохраняем доступ в системе, чтобы git больше не спрашивал ---
%GIT% config --global credential.helper ""
%GIT% config --global --add credential.helper store
> "%USERPROFILE%\.git-credentials" echo https://matveja329-dot:%TOKEN%@github.com

rem --- заливаем изменения (--force: главная версия сайта — эта папка) ---
%GIT% push -u --force origin main
echo.
if %errorlevel%==0 (
  echo ============================================================
  echo   ГОТОВО! Всё залито на GitHub.
  echo   Подожди ~1 минуту и переоткрой приложение на телефоне.
  echo ============================================================
) else (
  echo ============================================================
  echo   ОШИБКА. Скорее всего токен скопирован не полностью.
  echo   Запусти файл заново и вставь токен целиком.
  echo ============================================================
)
echo.
echo (Можешь закрыть это окно)
pause >nul
