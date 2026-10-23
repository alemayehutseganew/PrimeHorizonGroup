"""Root URL configuration: admin site + versioned JSON API + website pages.

Routing on Vercel:
  api/index.py receives the original path via __phg_path, restores
  PATH_INFO, and forwards it to this URLconf. Both /admin/* and
  /api/* paths are preserved as-is so Django's standard
  path("admin/", ...) and path("api/", ...) patterns resolve them.
"""
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    # Website pages (served as Django templates from website/)
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
    path("about/", TemplateView.as_view(template_name="about.html"), name="about"),
    path("services/", TemplateView.as_view(template_name="services.html"), name="services"),
    path("fleet/", TemplateView.as_view(template_name="fleet.html"), name="fleet"),
    path("careers/", TemplateView.as_view(template_name="careers.html"), name="careers"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
    path("portal/", TemplateView.as_view(template_name="portal.html"), name="portal"),
    path("privacy/", TemplateView.as_view(template_name="privacy.html"), name="privacy"),
    path("terms/", TemplateView.as_view(template_name="terms.html"), name="terms"),
]
