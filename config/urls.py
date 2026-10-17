"""Root URL configuration: admin site + versioned JSON API + website pages.

Mounted at BOTH /api/ and / so the portal works whether Vercel forwards
the original path (/api/auth/token/) or the stripped path (/auth/token/).
"""
import os
from pathlib import Path

from django.conf import settings
from django.contrib import admin
from django.http import Http404, HttpResponse
from django.urls import include, path
from django.views.generic import TemplateView


def static_asset(request, path):
    """Serve static assets (CSS, JS, images) from website/ directory.

    Tries multiple possible project roots because Vercel's serverless
    filesystem may resolve __file__ differently than local dev.
    """
    candidate_roots = [
        Path(__file__).resolve().parent.parent,  # config/urls.py -> WEB/
        Path.cwd(),                              # current working directory
    ]
    full_path = None
    for root in candidate_roots:
        candidate = root / "website" / path
        if candidate.is_file():
            full_path = candidate
            break
    if full_path is None:
        raise Http404(f"Static asset not found: {path}")
    with open(full_path, "rb") as f:
        content = f.read()
    if path.endswith(".css"):
        content_type = "text/css"
    elif path.endswith(".js"):
        content_type = "application/javascript"
    elif path.endswith(".png"):
        content_type = "image/png"
    elif path.endswith((".jpg", ".jpeg")):
        content_type = "image/jpeg"
    elif path.endswith(".svg"):
        content_type = "image/svg+xml"
    else:
        content_type = "application/octet-stream"
    return HttpResponse(content, content_type=content_type)


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
    path("static/<path:path>", static_asset),
    path("", include("core.urls")),
]
