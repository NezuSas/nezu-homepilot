from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from oauth2_provider.contrib.rest_framework import OAuth2Authentication
import logging

logger = logging.getLogger(__name__)

from rest_framework.permissions import IsAuthenticated
from .authentication import AlexaManualAuthentication
from .services import handle_directive

from rest_framework.permissions import AllowAny

class AlexaSkillView(APIView):
    authentication_classes = [AlexaManualAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"=== ALEXA SKILL VIEW POST ===")
            logger.info(f"request.data: {request.data}")
            logger.info(f"Calling handle_directive...")
            
            response = handle_directive(request.data)
            
            logger.info(f"handle_directive returned: {type(response)}")
            logger.info(f"response: {response}")
            
            return Response(response)
        except Exception as e:
            logger.error(f"ERROR in AlexaSkillView.post: {e}")
            import traceback
            traceback.print_exc()
            raise
