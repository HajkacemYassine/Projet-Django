"""
Middleware pour exempter les endpoints API du contrôle CSRF
"""
from django.utils.decorators import decorator_from_middleware
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import CsrfViewMiddleware


class CsrfExemptMiddleware(CsrfViewMiddleware):
    """
    Middleware qui exempte les endpoints API (/api/*) du contrôle CSRF
    Permet aussi les requêtes OPTIONS pour les preflight CORS
    """
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Exempter tous les endpoints commençant par /api/
        if request.path.startswith('/api/'):
            return None  # Ignore CSRF check
        
        # Exempter les requêtes OPTIONS (preflight CORS)
        if request.method == 'OPTIONS':
            return None
            
        return super().process_view(request, view_func, view_args, view_kwargs)
