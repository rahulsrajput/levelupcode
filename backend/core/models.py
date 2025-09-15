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

    slug = models.SlugField(
        max_length = 200,
        unique = True,
        db_index = True,
        blank = True,
        null = True
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    


class Submission(models.Model):

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        FAILED = 'Failed', 'Failed'
        PASSED = 'Passed', 'Passed'


    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    source_code = models.TextField() # user code

    language = models.ForeignKey(
        Language, 
        on_delete=models.CASCADE,
        related_name='submissions'
    )

    status = models.CharField(
        choices = Status.choices,
        default = Status.PENDING,
        max_length = 10
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Latest submissions first

    def __str__(self):
        return f"Submission #{self.id} by {self.user.email} for {self.problem.title}"



class SubmissionTestCase(models.Model):

    class Status(models.TextChoices):
        IN_QUEUE = "In Queue", "In Queue"
        PROCESSING = "Processing", "Processing"
        ACCEPTED = "Accepted", "Accepted"
        WRONG_ANSWER = "Wrong Answer", "Wrong Answer"
        RUNTIME_ERROR = "Runtime Error", "Runtime Error"
        COMPILATION_ERROR = "Compilation Error", "Compilation Error"
        TIME_LIMIT_EXCEEDED = "Time Limit Exceeded", "Time Limit Exceeded"

    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name="testcases"
    )

    # Judge0 token for this testcase
    token = models.CharField(max_length=100, unique=True,db_index=True,null=True, blank=True)

    status = models.CharField(
        choices=Status.choices,
        default=Status.IN_QUEUE,
        max_length=50,
        db_index=True
    )

    # Problem’s testcase data
    input_data = models.TextField()
    expected_output = models.TextField()

    # Judge0 results
    actual_output = models.TextField(blank=True, null=True)
    stderr = models.TextField(blank=True, null=True)
    compile_output = models.TextField(blank=True, null=True)

    memory = models.CharField(max_length=50, blank=True, null=True)
    time = models.CharField(max_length=50, blank=True, null=True)
    stdout = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"TestCase {self.id} of Submission {self.submission.id}"