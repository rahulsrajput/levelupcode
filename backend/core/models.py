from django import db
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

# Create your models here.
class Tag(models.Model):
    
    name = models.CharField(
        max_length = 50, 
        unique = True
    )
   
    slug = models.SlugField(
        max_length = 50,
        unique = True,
        db_index = True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Language(models.Model):
    
    langId = models.IntegerField(
        unique = True,
        blank = False,
        null = False,
    )
    
    name = models.CharField(
        max_length = 50, 
        unique = True,
        blank = False,
        null = False,
    )
    
    isActive = models.BooleanField(default=True)
    
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower().capitalize()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name



class Problem(models.Model):
    
    title = models.CharField(
        max_length = 200,
        blank = False,
        null = False,
        unique = True,
    )
    
    description = models.TextField()
    
    class DifficultyLevel(models.TextChoices):
        EASY = 'Easy', 'Easy'
        MEDIUM = 'Medium', 'Medium'
        HARD = 'Hard', 'Hard'
    difficulty = models.CharField(
        choices = DifficultyLevel.choices, 
        default = DifficultyLevel.EASY, 
        max_length = 10,
        db_index = True
    )

    tags = models.ManyToManyField(
        Tag,
        related_name = 'problems', 
        db_index = True,
    )

    examples = models.JSONField(blank=False, null=False)
    
    constraints = models.TextField(blank=True, null=True)
    
    hints = models.JSONField(default=list, blank=True, null=True)
    
    editorial = models.TextField(blank=True, null=True)

    testcases = models.JSONField(
        default = list, 
        blank = False, 
        null = False
    )

    code_snippets = models.JSONField(
        default = list, 
        blank = True, 
        null = True
    )

    reference_solutions = models.JSONField(
        default = dict, 
        blank = False, 
        null = False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE, 
        related_name='problems'
    )

    def __str__(self):
        return self.title