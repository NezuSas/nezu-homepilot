from django.urls import path
from .views import RegisterView, LoginView, UserDetailView, ChangePasswordView, SyncUsersView, ListUsersView, DeleteUserView, UploadWallpaperView, DashboardLayoutView, PasswordResetRequestView, PasswordResetConfirmView
from .oauth_login import AutoLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('auto-login/', AutoLoginView.as_view(), name='auto_login'),  # New auto-login endpoint
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('sync/', SyncUsersView.as_view(), name='sync_users'),
    path('list/', ListUsersView.as_view(), name='list_users'),
    path('delete/<int:user_id>/', DeleteUserView.as_view(), name='delete_user'),
    path('upload-wallpaper/', UploadWallpaperView.as_view(), name='upload_wallpaper'),
    path('dashboard-layout/', DashboardLayoutView.as_view(), name='dashboard_layout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
