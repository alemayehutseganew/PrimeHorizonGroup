"""Root URL configuration: admin site + versioned JSON API + website pages.

Mounted at BOTH /api/ and / so the portal works whether Vercel forwards
the original path (/api/auth/token/) or the stripped path (/auth/token/).
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
    # NOTE: "/projects/" is intentionally NOT listed here — the portal's live
    # data view depends on it resolving to the Project ViewSet via the root
    # core.urls include below. The public /projects page is served directly
    # by Vercel's static rewrite, so nothing is lost.
    path("careers/", TemplateView.as_view(template_name="careers.html"), name="careers"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
    path("portal/", TemplateView.as_view(template_name="portal.html"), name="portal"),
    path("privacy/", TemplateView.as_view(template_name="privacy.html"), name="privacy"),
    path("terms/", TemplateView.as_view(template_name="terms.html"), name="terms"),
    path("", include("core.urls")),
]
