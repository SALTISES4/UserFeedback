from django.conf.urls import url

from . import views


app_name = "user_feedback"


def patterns():
    return [url(r"^post", views.post_feedback_json, name="post")]


urlpatterns = sum([patterns()], [])
