from rest_framework.response import Response
from rest_framework.views import APIView
from account.serializers.profile import ProfileSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()

class ProfileView(APIView):

    """ 
        What does this view do?
        This view allows authenticated users to retrieve and update their profile information.
        how does permission_classes work?
        permission_classes = [IsAuthenticated]
        This view is only accessible to authenticated users.
        If an unauthenticated user tries to access this view, they will receive a 401 Unauthorized response.
        isAuthenticated is a custom permission class that checks if the user is authenticated.
        If authenticated, add the user object to the request object as request.user and return True
        If not authenticated, add AnonymousUser to the request object as request.user and return False
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        """
            Retrieve the authenticated user's profile data.

            - Fetches the user instance from the database using `request.user.id`.
            - Serializes the user instance into a JSON-ready format using `ProfileSerializer`.
            - Accesses `serializer.data` to get the serialized representation.
            - Returns the serialized profile data in the API response.

            Note:
                Passing `instance=user` to the serializer puts it in *read/serialization mode*.
                The serializer converts the Django model instance (Python object)
                into primitive datatypes (dict). Accessing `.data` triggers this conversion,
                and the resulting dict is rendered as JSON by the DRF `Response` object.
        """


        try:
            # print(request.user)
            user = User.objects.get(id=request.user.id)
            
            serializer = ProfileSerializer(instance=user)
            
            # print(serializer.data)

            return Response(
                {
                    "message":"Profile data",
                    'success': True,
                    'data': serializer.data
                }, 
                status=status.HTTP_200_OK
            )
        
        except User.DoesNotExist:
            
            return Response(
                {
                    "message": "User not found",
                    'success': False
                }, 
            status=status.HTTP_404_NOT_FOUND
            )

    
    def patch(self, request):

        """
            Update the authenticated user's profile.

            - Accepts incoming request data (`request.data`).
            - Initializes the serializer in *write/deserialization mode* with `data=request.data`.
            - Validates the input against serializer field definitions.
            - If valid, updates the user instance with new values and saves to the database.
            - Returns the updated profile data as JSON.

            Note:
                Passing `data=request.data` puts the serializer in validation mode.
                It checks the incoming fields, deserializes them into Python types,
                and on `.save()`, updates/creates the corresponding Django model instance.
        """

        
        try:
            
            user = User.objects.get(id=request.user.id)
            
            serializer = ProfileSerializer(instance=user, data=request.data, partial=True)
            
            # print(serializer.initial_data)
            
            if serializer.is_valid():
                
                serializer.save()

                # print(serializer.data)
                # print(serializer.validated_data)
                # print(serializer.instance)

                return Response(
                    {
                        "message" : "Profile updated successfully",
                        'success': True,
                        'updated_data' : serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            
        except User.DoesNotExist:
            
            return Response(
                {
                    "message": "User not found",
                    'success': False
                }, 
                status=status.HTTP_404_NOT_FOUND
            )