import { getLiveCourseContent, stageQuizContent } from './crossRoleCourseStore.js';

export const PROTOTYPE_QUIZ_STORAGE_KEY = 'bonsai-mooc.prototype.quizzes.v1';

const PILOT_COURSE_SLUG = 'information-systems-knowledge-dissemination';
const PILOT_UNIT_ONE_ID = 'pilot-unit-1';

const PILOT_QUIZ_FALLBACK = {
  courseSlug: PILOT_COURSE_SLUG,
  unitId: PILOT_UNIT_ONE_ID,
  source: 'prototype',
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'In the established Unit 1 lesson sequence, which lesson follows Data?',
      options: ['Information', 'Knowledge', 'BONSAI information system'],
      answer: 'Information',
    },
    {
      id: 'q2',
      type: 'mcq',
      prompt: 'Which established Unit 1 lesson appears third?',
      options: ['Data', 'Information', 'Knowledge'],
      answer: 'Knowledge',
    },
    {
      id: 'q3',
      type: 'short',
      prompt: 'Prototype short-response field',
      helper: 'Enter a short response to test this answer type. Final instructional wording will be supplied in KAN-50.',
    },
    {
      id: 'q4',
      type: 'project',
      prompt: 'Prototype extended-response field',
      helper: 'Enter a longer response to test the project-style answer area. Final instructional wording will be supplied in KAN-50.',
    },
  ],
};

function cloneQuiz(quiz) {
  return quiz ? JSON.parse(JSON.stringify(quiz)) : null;
}

function readStoredQuizzes() {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.sessionStorage.getItem(PROTOTYPE_QUIZ_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function learnerFacingRoute() {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/learner' || window.location.pathname.startsWith('/learn/');
}

export function getPrototypeQuiz(courseSlug, unitId) {
  if (learnerFacingRoute()) {
    const liveQuiz = getLiveCourseContent(courseSlug)?.quizzes?.[unitId];
    if (liveQuiz) return cloneQuiz({ ...liveQuiz, source: 'teacher' });
    if (courseSlug === PILOT_COURSE_SLUG && unitId === PILOT_UNIT_ONE_ID) return cloneQuiz(PILOT_QUIZ_FALLBACK);
    return null;
  }

  const stored = readStoredQuizzes().find((quiz) => quiz.courseSlug === courseSlug && quiz.unitId === unitId);
  if (stored) return cloneQuiz(stored);
  if (courseSlug === PILOT_COURSE_SLUG && unitId === PILOT_UNIT_ONE_ID) return cloneQuiz(PILOT_QUIZ_FALLBACK);
  return null;
}

export function savePrototypeQuiz(quiz) {
  const saved = {
    courseSlug: quiz.courseSlug,
    unitId: quiz.unitId,
    source: 'teacher',
    questions: quiz.questions.map((question, index) => ({
      id: question.id || `teacher-q-${index + 1}`,
      type: question.type,
      prompt: question.prompt.trim(),
      ...(question.type === 'mcq' ? {
        options: question.options.map((option) => option.trim()).filter(Boolean),
        answer: question.answer.trim(),
      } : {}),
    })),
  };
  const current = readStoredQuizzes();
  const next = [
    ...current.filter((item) => !(item.courseSlug === saved.courseSlug && item.unitId === saved.unitId)),
    saved,
  ];
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(PROTOTYPE_QUIZ_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The prototype can still use the bundled fallback when session storage is unavailable.
    }
  }
  stageQuizContent(saved.courseSlug, saved.unitId, saved);
  return cloneQuiz(saved);
}
