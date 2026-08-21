# Technical Stack Decision

## Frontend

React + JavaScript.

React was selected over plain JavaScript because the MOOC prototype
will contain multiple interactive views and reusable components,
including learner and teacher dashboards, courses, lessons, quizzes,
and progress tracking.

## Mock Data

Mock data will initially be stored as JSON files organized by entity:

- users.json
- courses.json
- modules.json
- lessons.json
- quizzes.json
- progress.json

The data structure will be designed so that it can later be replaced
by a backend API without requiring major changes to the frontend.
