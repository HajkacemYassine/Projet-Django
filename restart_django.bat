@echo off
echo ========================================
echo   REDEMARRAGE SERVEUR DJANGO
echo ========================================
echo.
echo 1. Arretez le serveur Django (Ctrl+C dans le terminal)
echo 2. Puis executez cette commande:
echo.
echo    cd mysite2026
echo    python manage.py runserver
echo.
echo ========================================
echo   VERIFICATION DES URLS
echo ========================================
echo.
echo Testez l'URL avec curl:
echo    curl http://localhost:8000/api/suivi-livraison/4/
echo.
echo Ou ouvrez dans le navigateur:
echo    http://localhost:8000/api/suivi-livraison/4/
echo.
pause
