from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from apps.devices.views import DeviceViewSet
from apps.routines.views import SceneViewSet, NezuRoutineViewSet
from apps.alexa.oauth_views import AutoAuthorizationView
from apps.alexa.token_views import AlexaTokenView

router = DefaultRouter()
router.register(r'devices', DeviceViewSet, basename='device')
router.register(r'scenes', SceneViewSet, basename='scene')
router.register(r'nezu-routines', NezuRoutineViewSet, basename='nezu-routine')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Custom OAuth2 endpoints for Alexa
    re_path(r'^o/authorize/$', AutoAuthorizationView.as_view(), name="authorize"),
    re_path(r'^o/token/$', AlexaTokenView.as_view(), name="token"),  # Custom token endpoint
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('api/auth/', include('apps.users.urls')),
    path('api/alexa/', include('apps.alexa.urls')),
    path('api/', include('apps.rooms.urls')),
    path('api/', include(router.urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
