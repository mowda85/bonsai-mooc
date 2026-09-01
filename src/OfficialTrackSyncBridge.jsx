import { useEffect } from 'react';
import { teacherLearningAreas } from './TeacherCourseEditor.jsx';
import { getTeacherOfficialLearningAreas } from './officialLearningAreaStore.js';

function syncTeacherAreas() {
  const next = getTeacherOfficialLearningAreas();
  teacherLearningAreas.splice(0, teacherLearningAreas.length, ...next);
}

export default function OfficialTrackSyncBridge() {
  useEffect(() => {
    syncTeacherAreas();
    window.addEventListener('bonsai:official-learning-areas-changed', syncTeacherAreas);
    return () => window.removeEventListener('bonsai:official-learning-areas-changed', syncTeacherAreas);
  }, []);

  return null;
}
