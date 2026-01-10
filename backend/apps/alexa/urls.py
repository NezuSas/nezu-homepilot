from django.urls import path
from .views import AlexaSkillView

urlpatterns = [
    path('endpoint/', AlexaSkillView.as_view(), name='alexa-endpoint'),
]
