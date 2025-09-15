from django.contrib import admin
from .models import Problem, Tag, Language, Submission, SubmissionTestCase

# Register your models here.
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'difficulty')
    search_fields = ('title', 'tags', 'difficulty', 'user__email')
    list_filter = ('difficulty', 'created_at', 'updated_at','user')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

admin.site.register(Problem, ProblemAdmin)
admin.site.register(Tag)
admin.site.register(Language)
admin.site.register(Submission)
admin.site.register(SubmissionTestCase)