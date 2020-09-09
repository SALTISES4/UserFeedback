from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Feedback(models.Model):

    ONE_TO_FIVE_RATING_CHOICES = ((1, "1"), (2, "2"), (3, "3"), (4, "4"), (5, "5"))
    FEEDBACK_TYPE = ((1, "Bug Report"), (2, "Feature Request"), (3, "Review"))
    type = models.PositiveIntegerField(choices=FEEDBACK_TYPE)
    rating = models.PositiveIntegerField(choices=ONE_TO_FIVE_RATING_CHOICES, null=True)
    text = models.TextField(max_length=2000, null=True, blank=True)
    url = models.CharField(max_length=50)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = "Feedback"
        verbose_name_plural = "Feedback"
