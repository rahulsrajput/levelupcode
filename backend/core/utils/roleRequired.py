from rest_framework.permissions import BasePermission

""" 
    This function is used to check if the user has the required role to access the view
    
    Parameters:
        allowed_roles (list): A list of allowed roles for the view
        
    Returns:
        bool: True if the user has the required role, False otherwise
"""

def RoleRequired(allowed_roles):
    class _RoleRequired(BasePermission):
        
        def has_permission(self, request, view):
            user_role = getattr(request.user, 'role', None)
            roles = allowed_roles if isinstance(allowed_roles, list) else [allowed_roles]
            
            return user_role in roles
    
    return _RoleRequired