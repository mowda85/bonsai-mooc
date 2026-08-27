import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import TeacherDashboardBridge from './TeacherDashboardBridge.jsx';
import PublicationWorkflowBridge from './PublicationWorkflowBridge.jsx';
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
import './teacher-dashboard.css';
import './teacher-dashboard-layout-fix.css';
import './teacher-course-editor.css';
import './teacher-unit-editor.css';
import './teacher-activity-editor.css';
import './teacher-quiz-editor.css';
import './teacher-learner-preview.css';
import './teacher-publication.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <TeacherDashboardBridge />
    <PublicationWorkflowBridge />
  </React.StrictMode>,
);