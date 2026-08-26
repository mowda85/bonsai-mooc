import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
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

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);