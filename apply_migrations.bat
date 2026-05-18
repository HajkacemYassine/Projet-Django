@echo off
echo ========================================
echo   APPLICATION DES MIGRATIONS
echo ========================================
echo.

cd /d "c:\Users\yassi\OneDrive\Documents\yassine\dsi semestre2\framework django\projetdjango\mysite2026"

echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo.
echo Application des migrations...
python manage.py migrate

echo.
echo ========================================
echo   REDEMARRAGE DU SERVEUR
echo ========================================
echo.
echo Maintenant, redemarrez le serveur Django:
echo    python manage.py runserver
echo.
pause
