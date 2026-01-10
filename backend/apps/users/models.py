from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model for HomePilot"""
    theme_preference = models.CharField(
        max_length=20, 
        default='light', 
        choices=[('light', 'Light'), ('dark', 'Dark')]
    )
    wallpaper = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Wallpaper ID (e.g., gradient-1) or custom image URL'
    )

class DashboardLayout(models.Model):
    """Store user-specific dashboard layout configuration"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='dashboard_layout'
    )
    layout = models.TextField(
        default='[]',
        help_text='Grid layout configuration with positions and sizes (JSON string)'
    )
    cards = models.TextField(
        default='[]',
        help_text='List of card configurations (JSON string)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dashboard layout for {self.user.username}"

    class Meta:
        verbose_name = "Dashboard Layout"
        verbose_name_plural = "Dashboard Layouts"
