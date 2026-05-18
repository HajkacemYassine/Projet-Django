@echo off
echo ========================================
echo   NETTOYAGE ET REDEMARRAGE
echo ========================================
echo.

cd /d "c:\Users\yassi\OneDrive\Documents\yassine\dsi semestre2\framework django\projetdjango\mysite2026"

echo Nettoyage du cache Python...
del /F /Q magasin\migrations\__pycache__\*.pyc 2>nul
del /F /Q magasin\__pycache__\*.pyc 2>nul

echo.
echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo.
echo ========================================
echo   DEMARRAGE DU SERVEUR
echo ========================================
echo.
python manage.py runserver

pause
