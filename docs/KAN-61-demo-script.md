# BONSAI-MOOC Prototype Demo Script

**Target duration:** 7–9 minutes  
**Task:** KAN-61 — Prepare demo script  
**Pilot course:** Flood Crisis Management in Estuarine Areas

## Before the demo

- Open the live BONSAI-MOOC Vercel site in a fresh browser tab.
- Use `alex` + any non-empty password for the learner journey.
- Use `anna` + any non-empty password for the teacher journey.
- Use `admin` + any non-empty password for the admin journey if needed.
- The prototype uses browser-session mock data, so avoid unnecessary refreshes after login.

## 0:00–0:45 — Introduce the prototype

**Say:**

> BONSAI-MOOC is a prototype learning platform for the BONSAI project. The curriculum is organised into five Categories and learners may take individual courses directly unless a specific prerequisite or dependency is configured. Today I will show the end-to-end learner journey through the pilot course, the teacher authoring and publication journey, and the networking vision.

**Show:** Homepage → Categories → Courses.

## 0:45–3:30 — Learner journey: discover → start → learn → assess → complete

### 1. Find the pilot course

From the homepage or Course Catalogue, open **Flood Crisis Management in Estuarine Areas** in the **Crisis Management** Category.

**Say:**

> Course information is public, so visitors can inspect the description, objectives, structure, achievement and any configured prerequisites before signing in. Flood Crisis Management in Estuarine Areas is the functional pilot used to demonstrate the complete learner workflow.

Point out the course description, pilot badge, learning objectives, three units and Crisis Management Specialist Certificate pathway.

### 2. Start the course and log in

Press **Start Course** and log in with `alex` and any non-empty password.

**Say:**

> Learner content is protected by the learner session, while the public course information remains open. Current BONSAI courses are open by default unless a teacher later configures a required prerequisite or internal dependency.

### 3. Show the pilot learning content

Open the first unit and one or two lessons. Briefly show:

- crisis-management and emergency-response lesson content
- situational-awareness material
- optional lesson video area
- unit and lesson navigation
- the handoff from the final Unit 1 lesson to the quiz

Then briefly show Unit 2 to illustrate the flood-risk and forecasting content, including flood-wave propagation, inundation forecasting, dike/levee inspection, breach modelling, climate-change effects and AI-based forecasting approaches.

### 4. Show assessment and scenario activity

Open the Unit 1 flood-crisis knowledge check and submit it. Show the result screen.

Then open the scenario-based activity and point out that the learner is asked to interpret an evolving flood situation, identify priority information and stakeholders, and recommend immediate response actions.

**Say:**

> The pilot combines knowledge checks with scenario-based work so learners practise interpreting changing flood conditions and supporting timely decisions, rather than only reading static content.

### 5. Show completion and recognition

Return to the learner dashboard/course overview and point out unit progress. When the course is complete, open the completion view and certificate.

**Say:**

> Completing the pilot awards the individual BONSAI Course Certificate for Flood Crisis Management in Estuarine Areas. It also contributes one completed course toward the Crisis Management Specialist Certificate.

## 3:30–7:00 — Teacher journey: manage → edit → review → publish → inspect results

Log out, then log in with `anna` and any non-empty password.

### 1. Teacher dashboard and assigned pilot

Open the Teacher Dashboard and select **Flood Crisis Management in Estuarine Areas**.

Point out the pilot badge, Crisis Management Category, three-unit structure and learner count.

### 2. Edit course structure and content

Show **Edit Course**, including:

- title and description
- learning objectives
- Category assignment
- external prerequisites
- internal learning dependencies

Return to the assigned course and show unit, activity, quiz and per-lesson video controls.

**Say:**

> Teachers can manage course metadata, units, lessons, activities, quizzes and lesson media. Prerequisites and dependencies are configurable features rather than fixed assumptions in the current course catalogue.

### 3. Show review and publication workflow

Open the review/publication controls.

**Say:**

> Course content follows the prototype governance workflow: Draft → Under Review → Approved → Published. Lead Author and Admin approval are modelled before a new version becomes learner-visible, while an existing Published version can remain available during revision.

### 4. Show Progress & Results and feedback

Open **Progress & Results** for Flood Crisis Management in Estuarine Areas.

Show learner rows, progress, quiz results, activity status and learner feedback. If useful, open the teacher feedback overview as well.

## 7:00–8:15 — Admin and networking vision

If time allows, log in as `admin` and show the course-review queue, users/roles and Category governance. Point out that the new pilot appears in publication governance under its correct course title.

Then show **Teacher networking** and briefly mention the learner networking space.

**Say:**

> BONSAI is a cross-institution project, so the prototype also shows the longer-term collaboration vision for teachers and learners. These networking screens remain a prototype showcase rather than a production messaging service.

## 8:15–8:45 — Close

**Say:**

> The prototype demonstrates public course discovery, the five-Category learning architecture, configurable prerequisites and dependencies, a complete flood-crisis pilot course, protected learner content, assessment and scenario work, completion and certificates, teacher authoring, review and publication, learner results, admin governance and the future networking layer.

## Acceptance-criteria mapping

| Requirement | Demo section |
| --- | --- |
| Public course discovery | Course catalogue and Crisis Management Category |
| New pilot identity | Flood Crisis Management in Estuarine Areas shown as the only pilot |
| Learner start/login | Pilot Start Course flow |
| Three-unit pilot learning flow | Units 1–3 |
| Quiz/results | Unit 1 flood-crisis knowledge check |
| Scenario activity | Evolving flood situation exercise |
| Course completion/certificate | Learner completion page |
| Specialist progress | Crisis Management Specialist Certificate pathway |
| Teacher edit | Course/unit/activity/quiz/video controls |
| Prerequisites/dependencies | Course Editor |
| Review/publication | Draft → Under Review → Approved → Published |
| Teacher results/feedback | Progress & Results / Feedback |
| Admin governance | Reviews, users and Categories |
| Networking showcase | Teacher and learner networking spaces |

## Demo fallback notes

- If a live edit would consume too much time, show the existing pilot editor and configured content rather than authoring new material from scratch.
- If learner completion state is not prepared, demonstrate the units, quiz/results and completion screen separately rather than spending the demo completing every item.
- Keep the networking section short; it is a static vision showcase.
- Avoid unnecessary browser reloads because prototype session state is stored in the browser session.
