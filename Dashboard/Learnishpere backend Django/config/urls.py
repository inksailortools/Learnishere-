from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse({"service": "LearnIsphere API", "authentication": "/api/auth/"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api_root),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("commerce.urls")),
]
