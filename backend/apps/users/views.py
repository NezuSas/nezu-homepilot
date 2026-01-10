import logging
from rest_framework import generics, status

logger = logging.getLogger(__name__)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .serializers import UserSerializer, RegisterSerializer, UserUpdateSerializer, ChangePasswordSerializer, DashboardLayoutSerializer
from .models import DashboardLayout

class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email_or_username = request.data.get("email")
        password = request.data.get("password")
        
        from django.contrib.auth import get_user_model
        from django.db.models import Q
        User = get_user_model()
        
        # Try to find user by email OR username
        try:
            user_obj = User.objects.get(Q(email=email_or_username) | Q(username=email_or_username))
            username = user_obj.username
        except User.DoesNotExist:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if user:
            from rest_framework.authtoken.models import Token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})
        else:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

from .serializers import ChangePasswordSerializer, UserUpdateSerializer

class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.data.get('old_password')):
                user.set_password(serializer.data.get('new_password'))
                user.save()
                return Response({'status': 'password set'}, status=status.HTTP_200_OK)
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SyncUsersView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        from apps.core.services.ha_client import ha_client
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            persons = ha_client.get_persons()
            synced_count = 0
            synced_usernames = []
            
            for person in persons:
                entity_id = person.get('entity_id', '')
                attributes = person.get('attributes', {})
                friendly_name = attributes.get('friendly_name', entity_id)
                
                # Generate username from entity_id (person.name -> name)
                username = entity_id.split('.')[1]
                email = f"{username}@nezu.local"
                synced_usernames.append(username)
                
                # Check if user exists
                if not User.objects.filter(username=username).exists():
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password='Nezu123!',
                        first_name=friendly_name
                    )
                    synced_count += 1
            
            # Delete users that are no longer in HA (but keep admin users)
            deleted_count = 0
            stale_users = User.objects.filter(email__endswith='@nezu.local').exclude(username__in=synced_usernames)
            for user in stale_users:
                # Don't delete the current user or admin users
                if user.id != request.user.id and not user.email.endswith('nezuecuador.com'):
                    user.delete()
                    deleted_count += 1
            
            message = f'Se sincronizaron {synced_count} usuarios nuevos.'
            if deleted_count > 0:
                message += f' Se eliminaron {deleted_count} usuarios que ya no existen en Home Assistant.'
            
            return Response({
                'status': 'synced', 
                'count': synced_count,
                'deleted': deleted_count,
                'message': message
            })
            
        except Exception as e:
            print(f"Error syncing users: {e}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ListUsersView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        users = User.objects.all().order_by('-date_joined')
        serialized_users = UserSerializer(users, many=True)
        
        return Response(serialized_users.data)

class DeleteUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            
            # Prevent deleting yourself
            if user_to_delete.id == request.user.id:
                return Response(
                    {'error': 'No puedes eliminar tu propia cuenta'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            username = user_to_delete.username
            user_to_delete.delete()
            
            return Response({
                'status': 'deleted',
                'message': f'Usuario {username} eliminado correctamente'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UploadWallpaperView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        import os
        from django.conf import settings
        
        if 'wallpaper' not in request.FILES:
            return Response(
                {'error': 'No se proporcionó ninguna imagen'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wallpaper_file = request.FILES['wallpaper']
        
        # Validate file size (5MB max)
        if wallpaper_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'La imagen es demasiado grande. Máximo 5MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if wallpaper_file.content_type not in allowed_types:
            return Response(
                {'error': 'Formato no válido. Use JPG, PNG o WebP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create user wallpaper directory
            user_wallpaper_dir = os.path.join(settings.MEDIA_ROOT, 'wallpapers', str(request.user.id))
            os.makedirs(user_wallpaper_dir, exist_ok=True)
            
            # Save file
            file_extension = wallpaper_file.name.split('.')[-1]
            filename = f'wallpaper.{file_extension}'
            filepath = os.path.join(user_wallpaper_dir, filename)
            
            with open(filepath, 'wb+') as destination:
                for chunk in wallpaper_file.chunks():
                    destination.write(chunk)
            
            # Update user wallpaper field
            wallpaper_url = f'/media/wallpapers/{request.user.id}/{filename}'
            request.user.wallpaper = wallpaper_url
            request.user.save()
            
            return Response({
                'status': 'success',
                'wallpaper': wallpaper_url,
                'message': 'Fondo de pantalla actualizado correctamente'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from .serializers import DashboardLayoutSerializer
from .models import DashboardLayout

class DashboardLayoutView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        """Get or create dashboard layout for the current user"""
        layout, created = DashboardLayout.objects.get_or_create(
            user=request.user,
            defaults={'layout': [], 'cards': []}
        )
        serializer = DashboardLayoutSerializer(layout)
        return Response(serializer.data)
    
    def put(self, request):
        """Update dashboard layout for the current user"""
        layout, created = DashboardLayout.objects.get_or_create(user=request.user)
        serializer = DashboardLayoutSerializer(layout, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # We return 200 even if user doesn't exist for security
            return Response({'status': 'Si el email está registrado, se enviaron instrucciones.'})

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        
        # HTML Email Content
        context = {
            'name': user.first_name or user.username,
            'reset_url': reset_url,
        }
        html_content = render_to_string('users/password_reset_email.html', context)
        text_content = strip_tags(html_content)
        
        subject = 'Restablecimiento de contraseña - Nezu HomePilot'
        
        try:
            msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            logger.info(f"HTML Password reset link sent to {email}")
        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
            return Response({'error': 'Error al enviar el email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'status': 'Si el email está registrado, se enviaron instrucciones.'})

class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({'error': 'Datos incompletos'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            logger.info(f"Password reset successful for user ID: {uid}")
            return Response({'status': 'Contraseña actualizada correctamente'})
        else:
            return Response({'error': 'El enlace de recuperación no es válido o ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
