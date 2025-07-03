from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, EmailVerificationToken

# Register your models here.
class CustomUserAdmin(UserAdmin) : 
    model = CustomUser
    list_display = ('email', 'username', 'is_active', 'is_staff', 'role', 'is_verified')
    list_filter = ('is_active', 'is_staff', 'role', 'is_verified')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('personal info', {'fields': ('username', 'first_name', 'last_name')}),
        ('permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'role', 'groups', 'user_permissions')}),
        ('dates', {'fields': ('last_login', )})
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2','is_active', 'is_staff', 'is_superuser', 'is_verified', 'role', 'groups', 'user_permissions')
        }),
    )


class EmailVerificationTokenAdmin(admin.ModelAdmin) :
    list_display = ('user', 'token', 'created_at', 'used')
    readonly_fields = ('token', 'created_at')
    search_fields = ('user__email', 'token')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(EmailVerificationToken, EmailVerificationTokenAdmin)