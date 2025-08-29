from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
from .constants import ROLES_CHOICES
from django.conf import settings
import uuid
from django.utils import timezone
from datetime import timedelta

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields) : 
        if not email:
            raise ValueError ('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields) :
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)



class CustomUser(AbstractBaseUser, PermissionsMixin) : 
    email = models.EmailField(unique=True)
    username = models.CharField(blank=True, unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    profile_url = models.URLField(max_length=200, blank=True)
    bio = models.TextField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    role = models.CharField(max_length=50, choices=ROLES_CHOICES, default='user')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"



class PasswordResetToken(models.Model) : 
    user = models.ForeignKey(settings.AUTH_USER_MODEL , on_delete=models.CASCADE)
    token = models.UUIDField(unique=True, editable=False, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    expired = models.BooleanField(default=False)


    def is_expired (self):
        return timezone.now() > self.created_at + timedelta(minutes=5)
    
    
    
class UserSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    refresh_token = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    jti = models.CharField(max_length=255, unique=True) 
    revoked = models.BooleanField(default=False)
    replaced_by = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.jti} - revoked = {self.revoked}"
    