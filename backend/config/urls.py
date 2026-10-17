"""Root URL configuration: admin site + versioned JSON API.

Mounted at BOTH /api/ and / so the portal works whether Vercel forwards
the original path (/api/auth/token/) or the stripped path (/auth/token/).
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("", include("core.urls")),
]
