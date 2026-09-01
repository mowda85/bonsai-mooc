import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import RoleSessionBridge from './RoleSessionBridge.jsx';
import TeacherDashboardBridge from './TeacherDashboardBridge.jsx';
import PublicationWorkflowBridge from './PublicationWorkflowBridge.jsx';
import TeacherProgressResultsBridge from './TeacherProgressResults.jsx';
import TeacherFeedbackOverviewBridge from './TeacherFeedbackOverview.jsx';
import WorkflowVersionBridge from './WorkflowVersionBridge.jsx';
import CrossRoleDataBridge from './CrossRoleDataBridge.jsx';
import Epic5PilotContentBridge from './Epic5PilotContentBridge.jsx';
import LessonExperienceRefinementBridge from './LessonExperienceRefinementBridge.jsx';
import TeacherLessonVideoBridge from './TeacherLessonVideoBridge.jsx';
import StudentNetworkingBridge from './StudentNetworkingBridge.jsx';
import TeacherNetworkingBridge from './TeacherNetworkingBridge.jsx';
import './styles.css';
import './learning-area.css';
import './catalogue.css';
import './course-info.css';
import './learner-dashboard.css';
import './learner-course-overview.css';
import './learner-unit.css';
import './lesson-content.css';
import './learner-activity.css';
import './learner-quiz.css';
import './quiz-results.css';
import './learner-completion.css';
import './student-networking.css';
import './teacher-dashboard.css';
import './teacher-dashboard-layout-fix.css';
import './teacher-course-editor.css';
import './teacher-unit-editor.css';
import './teacher-activity-editor.css';
import './teacher-quiz-editor.css';
import './teacher-learner-preview.css';
import './teacher-publication.css';
import './teacher-feedback-overview.css';
import './teacher-lesson-video.css';
import './teacher-networking.css';
import './workflow-version.css';
import './role-session.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <RoleSessionBridge />
    <TeacherDashboardBridge />
    <PublicationWorkflowBridge />
    <TeacherProgressResultsBridge />
    <TeacherFeedbackOverviewBridge />
    <WorkflowVersionBridge />
    <CrossRoleDataBridge />
    <Epic5PilotContentBridge />
    <LessonExperienceRefinementBridge />
    <TeacherLessonVideoBridge />
    <StudentNetworkingBridge />
    <TeacherNetworkingBridge />
  </React.StrictMode>,
);
