from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class LearnIsphereUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "full_name", "role", "is_active", "is_email_verified")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("full_name", "first_name", "last_name")}),
        ("Permissions", {"fields": ("role", "is_active", "is_staff", "is_superuser", "is_email_verified", "terms_accepted_at", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Google", {"fields": ("google_sub",)}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "full_name", "password1", "password2")}),
    )
    search_fields = ("email", "full_name")
