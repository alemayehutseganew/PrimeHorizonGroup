"""Root URL configuration: admin site + versioned JSON API + website pages.

Routing on Vercel:
  The backend project runs Django from the repository root. Its root path
  returns a small JSON service-identification response so the backend
  deployment is distinguishable from the React frontend. API and admin
  routes are preserved unchanged.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.generic import TemplateView


def service_info(request):
    """Simple JSON identification response for the Django backend."""
    return JsonResponse(
        {
            "service": "Prime Horizon Group Plc API",
            "status": "ok",
            "api_base": "/api/",
            "admin": "/admin/",
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    # Backend service identification (replaces the legacy corporate homepage
    # at "/" so this Vercel project is clearly a Django API deployment).
    path("", service_info, name="service_info"),
    # Website pages (served as Django templates from website/)
    path("about/", TemplateView.as_view(template_name="about.html"), name="about"),
    path("services/", TemplateView.as_view(template_name="services.html"), name="services"),
    path("fleet/", TemplateView.as_view(template_name="fleet.html"), name="fleet"),
    path("careers/", TemplateView.as_view(template_name="careers.html"), name="careers"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
    path("portal/", TemplateView.as_view(template_name="portal.html"), name="portal"),
    path("privacy/", TemplateView.as_view(template_name="privacy.html"), name="privacy"),
    path("terms/", TemplateView.as_view(template_name="terms.html"), name="terms"),
]
