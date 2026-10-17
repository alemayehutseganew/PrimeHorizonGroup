"""Root URL configuration: admin site + versioned JSON API + website pages.

Mounted at BOTH /api/ and / so the portal works whether Vercel forwards
the original path (/api/auth/token/) or the stripped path (/auth/token/).
"""
import os

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    # Website pages (served as Django templates from website/)
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
    path("about/", TemplateView.as_view(template_name="about.html"), name="about"),
    path("services/", TemplateView.as_view(template_name="services.html"), name="services"),
    path("fleet/", TemplateView.as_view(template_name="fleet.html"), name="fleet"),
    path("projects/", TemplateView.as_view(template_name="projects.html"), name="projects"),
    path("careers/", TemplateView.as_view(template_name="careers.html"), name="careers"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
    path("portal/", TemplateView.as_view(template_name="portal.html"), name="portal"),
    path("privacy/", TemplateView.as_view(template_name="privacy.html"), name="privacy"),
    path("terms/", TemplateView.as_view(template_name="terms.html"), name="terms"),
    # Static assets served directly from website/ (Vercel Django ignores vercel.json rewrites)
    path("static/css/<path:path>", serve, {"document_root": os.path.join(settings.BASE_DIR, "website", "css")}),
    path("static/js/<path:path>", serve, {"document_root": os.path.join(settings.BASE_DIR, "website", "js")}),
    path("", include("core.urls")),
]
