=====
django_user_feedback
=====

django_user_feedback is a simple Django app to collect and store user feedback.

Quick start
-----------

1. Add the UserFeedback app to your requirements, then pip install::

    -e git+https://github.com/aahilgert/UserFeedback@master#egg=user_feedback

1. Add "user_feedback" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'user_feedback',
    ]

2. Include the user_feedback URLconf in your project urls.py like this::

    url("feedback/", include("user_feedback.urls")),

3. Migrate::

    python manage.py migrate

4. Setup an `EMAIL_BACKEND` in your project's settings.py.

5. Add admin emails to `ADMINS`'s list of tuples in your project's settings.py::

    ADMINS = [('John', 'john@example.com'), ('Mary', 'mary@example.com')]

6. If '/accounts/login/' is not active, make sure to have a `LOGIN_URL` in your settings.py.

7. Import user_feedback's minified script in your base template(s)::

    <script src="{% static 'user_feedback/js/scripts.min.js' %}" defer="true"></script>

8. Place the following element in templates where you would like for users to offer feedback::

    <div id="user-feedback-container"></div>

9. If not in the template already, add a csrf token::

    {% csrf_token %}

10. Add the desired company logo to your static files.

11. Inject the diolog scripts by calling the `injectDialog` function.
    `injectDialog` will take four parameters, dialog title, company logo path,
    snackbar post success message, and snackbar post failure message::

      userFeedback.injectDialog(
        "{% trans 'Let us know how we can improve your experience!' %}",
        "{% static 'user_feedback/example_logo/aperture.svg' %}",
        "{% trans 'Thanks for your feedback!' %}",
        "{% trans 'Sorry, please try again later!' %}"
      );

Quick start dev
---------------

1. Install node modules::

    npm install

2. Install dev-requirements::

    pip install -r requirements/dev-requirements.txt

3. Install pre-commit::

    pre-commit install

4. Create a superuser and login::

    python user_feedback.py createsuperuser
    ...

5. Start the server::

    python user_feedback.py runserver

6. Navigate to '(root)/test/button/', to see the user_feedback button in action.

7. Build when you make edits to scripts.js::

    yarn run gulp build-js

8. If you wish, remake the django package::

    python setup.py sdist
