from django.db import models

class Files(models.Model):
    path = models.TextField()
    url = models.TextField()