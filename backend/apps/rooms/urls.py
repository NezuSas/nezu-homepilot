from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, ZoneViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'zones', ZoneViewSet, basename='zone')

urlpatterns = [
    path('', include(router.urls)),
]
