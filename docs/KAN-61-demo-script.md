# BONSAI-MOOC Prototype Demo Script

**Target duration:** 7–9 minutes  
**Task:** KAN-61 — Prepare demo script  
**Live site:** https://bonsai-mooc-bhes4kf06-mowda-6182.vercel.app

## Before the demo

- Open the live Vercel URL in a fresh browser tab.
- Use `alex` + any non-empty password for the learner journey.
- Use `anna` + any non-empty password for the teacher journey.
- Use `admin` + any non-empty password only if you want to mention the admin role.
- The prototype session is in-memory, so avoid refreshing the page after login; a reload resets the mock session.

## 0:00–0:45 — Introduce the prototype

**Say:**

> BONSAI-MOOC is a prototype learning platform for the BONSAI project. The common Foundation gives every learner the same baseline knowledge, after which learners can explore the specialization areas that fit their interests. Today I will show the end-to-end learner journey, the teacher authoring and publication journey, and the networking vision.

**Show:** Homepage → Foundation → Courses.

## 0:45–3:30 — Learner journey: find → enroll/start → complete → certificate

### 1. Find the pilot course

From the homepage or Courses catalogue, open **Information Systems and Knowledge Dissemination**.

**Say:**

> Course information is public, so visitors can inspect the description before signing in. The pilot course is the Foundation course used to demonstrate the full learner workflow.

Point out the course description, estimated duration and units.

### 2. Start the course and log in

Press **Start Course**. The prototype should route to login while preserving the requested learner destination.

Log in with `alex` and any non-empty password.

**Say:**

> Learner content itself is protected. After login, the learner is returned to the requested course rather than losing their place.

### 3. Show learning content

Open the first unit and a lesson. Briefly show:

- lesson text/content
- optional lesson video area
- unit navigation
- the final-lesson handoff to the unit quiz

**Say:**

> Units contain lessons, and the prototype supports text, downloadable material, video and assessment handoffs.

### 4. Show assessment and progress

Open the quiz, answer or submit it, and show the result screen. If time allows, also open the Unit 2 activity.

Return to the learner dashboard/course overview and point out progress/completion.

**Say:**

> Quiz and activity outcomes feed the learner progress state. Completion is based on the required course components, including the assessments.

### 5. Show completion/certificate

Open the completion/certificate view when available in the current learner state.

**Say:**

> Once the completion conditions are satisfied, the learner journey ends with course completion and the prototype certificate experience.

## 3:30–7:00 — Teacher journey: create → edit → publish → see results

Log out, then log in with `anna` and any non-empty password.

### 1. Teacher dashboard and assigned courses

Open the Teacher Dashboard and select **Information Systems and Knowledge Dissemination**.

**Say:**

> The teacher dashboard separates authoring from the learner experience. Teachers can manage their assigned courses, content and results.

### 2. Edit course structure and content

Show **Edit Course**, then return and show **Add Unit** / unit editing. Open an existing unit and briefly point out lesson, activity and quiz authoring controls.

If useful, point out the per-lesson video field.

**Say:**

> A teacher can edit course metadata, organize units and lessons, add activities and quizzes, and attach a video to an individual lesson. Draft organization is kept separate from official learning-area governance.

### 3. Show publication workflow

Open the review/publication controls for a course or revision.

**Say:**

> Publishing is not a single unrestricted button. The prototype models the BONSAI review path from Draft to Under Review, Approved and Published, with review controls before content becomes learner-visible. A published version remains visible while a new revision is being prepared.

If demonstrating a new draft would take too long, show the existing status/workflow controls instead of creating a complete course live.

### 4. Show Progress & Results

Open **Progress & Results** from the assigned course or from the new teacher sidebar.

**Say:**

> Teachers can then inspect learner-level progress and results for the course.

Show:

- learner rows
- progress/completion status
- quiz scores
- learner detail panel
- activity/quiz status and feedback where present

This directly demonstrates the **see results** acceptance step.

## 7:00–8:15 — Networking vision showcase

Open **Menu → Teacher networking**.

Show the static examples for pedagogy discussion, co-author search and experience sharing.

**Say:**

> BONSAI is a cross-institution project, so the prototype also shows the longer-term networking vision: teachers can discuss teaching approaches, find co-authors and exchange delivery experience across institutions. This screen is intentionally a non-functional vision showcase in the prototype.

If time allows, mention the learner networking space as the equivalent place for learner Q&A, cross-university focus groups and announcements.

## 8:15–8:45 — Close

**Say:**

> The prototype therefore demonstrates the complete concept: public course discovery, protected learner content, learning and assessment, completion, teacher authoring and review, publication, learner results, and the future networking layer. The next development step would be replacing the prototype mock/session data with persistent backend services while keeping these validated workflows and improving the UI iteratively.

## Acceptance-criteria mapping

| KAN-61 requirement | Demo section |
| --- | --- |
| Learner: find | Courses / pilot course, 0:45–1:15 |
| Learner: enroll/start | Start Course + login, 1:15–1:45 |
| Learner: complete | lessons + quiz/activity + progress, 1:45–3:10 |
| Learner: certificate | completion/certificate, 3:10–3:30 |
| Teacher: create/edit | Teacher Dashboard + editor/unit controls, 3:30–5:15 |
| Teacher: publish | review/publication workflow, 5:15–6:00 |
| Teacher: see results | Progress & Results, 6:00–7:00 |
| Networking showcase | teacher + learner networking vision, 7:00–8:15 |
| 5–10 minute target | planned duration 7–9 minutes |

## Demo fallback notes

- If a live edit would consume too much time, show the existing editor and saved pilot content rather than authoring everything from scratch.
- If learner completion state is not already prepared, show quiz/results and the completion screen separately and explain the completion condition rather than spending the demo completing every item.
- Keep the networking section short; it is a static Epic 6 vision showcase, not a functional messaging system.
- Avoid a browser reload after login because the current prototype session resets on refresh.
