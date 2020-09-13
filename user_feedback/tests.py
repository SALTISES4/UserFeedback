from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase, override_settings
from django.test.client import RequestFactory
from django.urls import reverse

from .models import Feedback


@override_settings(ADMINS=[("John", "john@example.com"), ("Mary", "mary@example.com")])
class FeedbackPostTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_feedback_post(self):
        response = self.client.post(
            reverse("user_feedback:post"),
            data={"text": "dfgfdgdfgdfgdfgfdgdfg", "url": "/course/1/", "type": "2"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 302)
        user = User.objects.create(username="testuser")
        user.set_password("testpass")
        user.save()
        logged_in = self.client.login(username="testuser", password="testpass")
        self.assertTrue(logged_in)
        response = self.client.get(
            reverse("user_feedback:post"),
            data={
                "json": '{"rating": 4, "text": "dfgfdgdfgdfgdfgfdgdfg", '
                '"url": "/course/1/", "type": "2"}'
            },
        )
        self.assertEqual(response.status_code, 405)
        response = self.client.post(
            reverse("user_feedback:post"),
            data={"text": "dfgfdgdfgdfgdfgfdgdfg", "url": "/course/1/", "type": "2"},
            content_type="application/json",
        )
        posted_feedback = Feedback.objects.first()
        self.assertEqual(posted_feedback.text, "dfgfdgdfgdfgdfgfdgdfg")
        self.assertEqual(posted_feedback.author, user)
        self.assertEqual(posted_feedback.url, "/course/1/")
        self.assertEqual(posted_feedback.type, 2)
        self.assertEqual(response.status_code, 201)

    def test_email_on_bug_report(self):
        user = User.objects.create(username="testuser")
        user.set_password("testpass")
        user.save()
        logged_in = self.client.login(username="testuser", password="testpass")
        self.assertTrue(logged_in)
        self.client.post(
            reverse("user_feedback:post"),
            data={"text": "dfgfdgdfgdfgdfgfdgdfg", "url": "/course/1/", "type": "1"},
            content_type="application/json",
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("URGENT - bug report", mail.outbox[0].subject)
        self.assertIn(
            "testserver's course/1. The user has written the following: "
            "'dfgfdgdfgdfgdfgfdgdfg' There have been 0 other bugs reported "
            "in the last 10",
            mail.outbox[0].body,
        )

    def test_email_ten_day_bug_count(self):
        user = User.objects.create(username="testuser")
        user.set_password("testpass")
        user.save()
        logged_in = self.client.login(username="testuser", password="testpass")
        self.assertTrue(logged_in)
        self.client.post(
            reverse("user_feedback:post"),
            data={"text": "dfgfdgdfgdfgdfgfdgdfg", "url": "/course/1/", "type": "1"},
            content_type="application/json",
        )
        self.client.post(
            reverse("user_feedback:post"),
            data={"text": "dfgfdgdfgdfgdfgfdgdfg", "url": "/course/1/", "type": "1"},
            content_type="application/json",
        )
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn("URGENT - bug report", mail.outbox[0].subject)
        self.assertIn(
            "A bug has been reported on testserver's course/1. The user has "
            "written the following: 'dfgfdgdfgdfgdfgfdgdfg' There have been 1 "
            "other bugs reported in the last 10 days at this url.",
            mail.outbox[1].body,
        )
