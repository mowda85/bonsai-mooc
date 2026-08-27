import { useEffect } from 'react';
import {
  getLearnerResultRecords,
  getLiveCourseContent,
  publishPendingCourseContent,
  saveLearnerProgressRecord,
  saveLearnerQuizResult,
  stageCourseMetadata,
  stageUnitContent,
} from './crossRoleCourseStore.js';
import { prototypePublicationDefaults, registerCourseContentChange } from './coursePublicationStore.js';

const PILOT_SLUG = 'information-systems-knowledge-dissemination';
const PILOT_BASE_UNIT_COUNT = 3;
const PROTOTYPE_LEARNER = { learnerId: 'BNS-1001', learnerName: 'Alex Johnson' };

function query() {
  return new URLSearchParams(window.location.search);
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'teacher-unit';
}

function textWithoutButton(element) {
  if (!element) return '';
  const clone = element.cloneNode(true);
  clone.querySelectorAll('button').forEach((button) => button.remove());
  return clone.textContent.trim();
}

function snapshotCourseEditor(root) {
  const title = root.querySelector('input[placeholder="Enter course title"]')?.value?.trim() || '';
  const description = root.querySelector('textarea[placeholder^="Describe what learners"]')?.value?.trim() || '';
  const objectives = (root.querySelector('textarea[placeholder^="Objective 1"]')?.value || '').split('\n').map((item) => item.trim()).filter(Boolean);
  const author = root.querySelector('input[placeholder="Teacher name or BONSAI ID"]')?.value?.trim() || '';
  const areas = Array.from(root.querySelectorAll('.teacher-area-chips > span')).map(textWithoutButton).filter(Boolean);
  const coAuthors = Array.from(root.querySelectorAll('.teacher-authors-card .teacher-selected-chips > span')).map(textWithoutButton).filter(Boolean);
  return { title, description, objectives, author, areas, coAuthors };
}

function snapshotUnitEditor(root, courseSlug) {
  const title = root.querySelector('input[placeholder="Enter unit title"]')?.value?.trim() || '';
  const description = root.querySelector('textarea[placeholder^="Describe the unit"]')?.value?.trim() || '';
  const exercise = root.querySelector('textarea[placeholder^="Add an exercise"]')?.value?.trim() || '';
  const fileCard = root.querySelector('.teacher-unit-file-summary');
  const file = fileCard ? { name: fileCard.querySelector('strong')?.textContent?.trim() || '', meta: fileCard.querySelector('span')?.textContent?.trim() || '' } : null;
  return {
    id: slugify(title),
    title,
    description,
    exercise,
    file,
    source: 'teacher-published',
    courseSlug,
    lessons: [{ id: `${slugify(title)}-lesson-1`, title: 'Lesson 1', content: description, file }],
  };
}

function courseSlugFromPublicPath() {
  const match = window.location.pathname.match(/^\/courses\/([^/]+)/);
  return match?.[1] || '';
}

function courseSlugFromLearner() {
  return query().get('course') || PILOT_SLUG;
}

function replaceText(element, value) {
  if (element && value) element.textContent = value;
}

function patchCourseInformation() {
  const slug = courseSlugFromPublicPath();
  if (!slug) return;
  const live = getLiveCourseContent(slug);
  if (!live) return;
  const root = document.querySelector('.course-detail-page');
  if (!root) return;
  const course = live.course || {};
  replaceText(root.querySelector('.course-detail-heading h1'), course.title);
  replaceText(root.querySelector('.course-detail-heading > p'), course.description);
  const descriptionHeading = root.querySelector('#course-description-heading');
  replaceText(descriptionHeading?.nextElementSibling, course.description);

  if (Array.isArray(course.objectives) && course.objectives.length) {
    const objectiveSection = root.querySelector('#objectives-heading')?.closest('.course-section');
    if (objectiveSection) {
      let list = objectiveSection.querySelector('.objective-list');
      if (!list) {
        objectiveSection.querySelector('.content-pending')?.remove();
        list = document.createElement('div');
        list.className = 'objective-list';
        objectiveSection.appendChild(list);
      }
      list.innerHTML = course.objectives.map((objective, index) => `<div class="objective-item"><span>${index + 1}</span><p>${objective}</p></div>`).join('');
    }
  }

  if (!live.units?.length) return;
  const unitSection = root.querySelector('#units-heading')?.closest('.course-section');
  if (!unitSection) return;
  let accordion = unitSection.querySelector('.unit-accordion');
  if (!accordion) {
    unitSection.querySelector('.content-pending-units')?.remove();
    accordion = document.createElement('div');
    accordion.className = 'unit-accordion';
    unitSection.appendChild(accordion);
  }
  live.units.forEach((unit, index) => {
    if (accordion.querySelector(`[data-cross-role-unit="${unit.id}"]`)) return;
    const article = document.createElement('article');
    article.className = 'unit-accordion-item unit-open';
    article.dataset.crossRoleUnit = unit.id;
    const lessons = unit.lessons?.length ? unit.lessons : [{ title: 'Lesson 1' }];
    article.innerHTML = `<div class="unit-accordion-trigger"><span class="unit-number">Unit ${PILOT_BASE_UNIT_COUNT + index + 1}</span><strong>${unit.title}</strong><span class="unit-meta">${lessons.length} lesson${lessons.length === 1 ? '' : 's'}</span><span class="unit-chevron">−</span></div><div class="unit-lessons">${lessons.map((lesson, lessonIndex) => `<div class="unit-lesson-row"><span>${String(lessonIndex + 1).padStart(2, '0')}</span><strong>${lesson.title || `Lesson ${lessonIndex + 1}`}</strong><small>Teacher-published lesson</small></div>`).join('')}</div>`;
    accordion.appendChild(article);
  });
  replaceText(unitSection.querySelector('.course-unit-count'), `${PILOT_BASE_UNIT_COUNT + live.units.length} units`);
}

function patchLearnerCourseOverview() {
  const root = document.querySelector('.learner-course-overview-page');
  if (!root) return;
  const slug = courseSlugFromLearner();
  const live = getLiveCourseContent(slug);
  if (!live) return;
  const course = live.course || {};
  replaceText(root.querySelector('.learner-course-overview-hero-grid h1'), course.title);
  replaceText(root.querySelector('.learner-course-overview-hero-grid > div > p'), course.description);
  const aboutSection = Array.from(root.querySelectorAll('.learner-enrolled-course-section')).find((section) => section.querySelector('h2')?.textContent === 'Course description');
  replaceText(aboutSection?.querySelector('p'), course.description);

  if (!live.units?.length) return;
  const list = root.querySelector('.learner-unit-status-list');
  if (!list) return;
  live.units.forEach((unit, index) => {
    if (list.querySelector(`[data-cross-role-unit="${unit.id}"]`)) return;
    const unitNumber = PILOT_BASE_UNIT_COUNT + index + 1;
    const article = document.createElement('article');
    article.className = 'learner-unit-status-card';
    article.dataset.crossRoleUnit = unit.id;
    article.innerHTML = `<div class="learner-unit-status-number">${unitNumber}</div><div class="learner-unit-status-copy"><span>Unit ${unitNumber}</span><strong>${unit.title}</strong><small>${unit.lessons?.length || 1} teacher-published lesson</small></div><div class="learner-unit-status-action"><b>Published update</b><button type="button" class="button button-outline">Open</button></div>`;
    article.querySelector('button').addEventListener('click', () => {
      window.location.assign(`/learner?course=${slug}&unit=${unitNumber}`);
    });
    list.appendChild(article);
  });
  const count = root.querySelector('.course-unit-count');
  if (count) count.textContent = `${PILOT_BASE_UNIT_COUNT + live.units.length} units`;
}

function renderDynamicLesson(root, slug, unitNumber, unit) {
  const lesson = unit.lessons?.[0] || { title: 'Lesson 1', content: unit.description || '' };
  root.innerHTML = `<section class="lesson-content-hero"><button class="back-link" type="button">← Back to Unit ${unitNumber}</button><div class="lesson-content-hero-grid"><div><div class="lesson-content-badges"><span class="pill">Learner lesson</span><span class="lesson-content-status">Teacher-published</span></div><span class="learner-unit-kicker">Unit ${unitNumber} · Lesson 1</span><h1>${lesson.title || 'Lesson 1'}</h1><p>Published teacher content from the shared KAN-41 prototype data flow.</p></div><aside class="lesson-content-summary"><div><span>Unit</span><strong>${unit.title}</strong></div><div><span>Source</span><strong>Published teacher update</strong></div></aside></div></section><section class="lesson-content-body"><div class="lesson-content-main"><section class="lesson-content-block lesson-text-block"><div class="lesson-content-block-heading"><span class="lesson-type-icon">T</span><div><span class="section-kicker">Text content</span><h2>Published lesson content</h2></div></div><div class="lesson-text-placeholder"><strong>${unit.title}</strong><p>${lesson.content || unit.description || 'No text content supplied.'}</p></div></section>${lesson.file?.name ? `<section class="lesson-content-block"><div class="lesson-content-block-heading"><span class="lesson-type-icon">↓</span><div><span class="section-kicker">Teacher resource</span><h2>${lesson.file.name}</h2></div></div><div class="lesson-download-card"><div class="lesson-download-file-icon">DOC</div><div><strong>${lesson.file.name}</strong><p>${lesson.file.meta || 'File metadata stored in this prototype session.'}</p></div></div></section>` : ''}</div></section>`;
  root.querySelector('.back-link')?.addEventListener('click', () => window.location.assign(`/learner?course=${slug}&unit=${unitNumber}`));
}

function patchDynamicLearnerUnit() {
  if (window.location.pathname !== '/learner') return;
  const unitNumber = Number(query().get('unit')) || 0;
  if (unitNumber <= PILOT_BASE_UNIT_COUNT) return;
  const slug = courseSlugFromLearner();
  const live = getLiveCourseContent(slug);
  const unit = live?.units?.[unitNumber - PILOT_BASE_UNIT_COUNT - 1];
  const root = document.querySelector('.learner-unit-page');
  if (!root || !unit || root.dataset.crossRoleRendered === unit.id) return;
  root.dataset.crossRoleRendered = unit.id;
  root.innerHTML = `<section class="learner-unit-hero"><button class="back-link" type="button">← Back to course overview</button><div class="learner-unit-hero-grid"><div><div class="learner-unit-badges"><span class="pill">Learner unit</span><span class="learner-unit-status-pill learner-unit-status-current">Teacher-published</span></div><span class="learner-unit-kicker">Unit ${unitNumber}</span><h1>${unit.title}</h1><p>${unit.description || ''}</p></div><aside class="learner-unit-summary"><div><span>Lessons</span><strong>${unit.lessons?.length || 1}</strong></div><div><span>Source</span><strong>Published teacher content</strong></div></aside></div></section><section class="learner-unit-body"><div class="learner-unit-main"><section class="learner-unit-intro"><span class="section-kicker">Unit overview</span><h2>What is in this unit?</h2><p>${unit.description || ''}</p></section><section class="learner-unit-lessons"><div class="learner-unit-section-heading"><div><span class="section-kicker">Lessons</span><h2>Unit ${unitNumber} lessons</h2><p>Open the lesson to see the content entered by the teacher.</p></div></div><div class="learner-lesson-list"><button class="learner-lesson-card" type="button"><span class="learner-lesson-number">01</span><div><small>Lesson 1</small><strong>${unit.lessons?.[0]?.title || 'Lesson 1'}</strong></div><span class="learner-lesson-action">Open lesson →</span></button></div></section></div></section>`;
  root.querySelector('.back-link')?.addEventListener('click', () => window.location.assign(`/learner?course=${slug}`));
  root.querySelector('.learner-lesson-card')?.addEventListener('click', () => renderDynamicLesson(root, slug, unitNumber, unit));
}

function captureLearnerResults() {
  if (window.location.pathname !== '/learner') return;
  const slug = courseSlugFromLearner();
  const overview = document.querySelector('.learner-course-overview-page');
  if (overview) {
    const progressRow = Array.from(overview.querySelectorAll('.learner-course-overview-summary > div')).find((item) => item.querySelector('span')?.textContent === 'Progress');
    const text = progressRow?.querySelector('strong')?.textContent || '';
    const match = text.match(/(\d+)\s+of\s+(\d+)\s+units\s+·\s+(\d+)%/i);
    if (match) {
      const completedUnits = Number(match[1]);
      const totalUnits = Number(match[2]);
      const progress = Number(match[3]);
      saveLearnerProgressRecord({ ...PROTOTYPE_LEARNER, courseSlug: slug, completedUnits, totalUnits, progress, status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started' });
    }
  }

  const results = document.querySelector('.quiz-results-page');
  if (results) {
    const scoreText = results.querySelector('.quiz-results-score-card strong')?.textContent || '';
    const match = scoreText.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) saveLearnerQuizResult({ ...PROTOTYPE_LEARNER, courseSlug: slug, score: Number(match[1]), scoreTotal: Number(match[2]) });
  }

  if (query().get('completion') === '1') {
    saveLearnerProgressRecord({ ...PROTOTYPE_LEARNER, courseSlug: slug, progress: 100, status: 'Completed' });
  }
}

function renderRealLearnerDetail(card, record) {
  if (!card) return;
  const score = record.quizScore == null ? '—' : `${record.quizScore}/${record.quizScoreTotal || '?'}`;
  card.innerHTML = `<span class="section-kicker">Learner detail · live session</span><div class="teacher-progress-detail-title"><span>AJ</span><div><h2>${record.learnerName}</h2><small>${record.status || 'In Progress'}</small></div></div><div class="teacher-progress-detail-grid"><div><span>Course progress</span><strong>${record.progress ?? 0}%</strong></div><div><span>Quiz score</span><strong>${score}</strong></div><div><span>Units completed</span><strong>${record.completedUnits ?? 0}/${record.totalUnits ?? '—'}</strong></div><div><span>Quiz</span><strong>${record.quizStatus || 'Not submitted'}</strong></div></div><section class="teacher-progress-feedback-detail"><span class="section-kicker">Data source</span><strong>Real prototype learner session</strong><p>This record was captured from learner actions in this browser session, not generated as a mock analytics row.</p></section>`;
}

function patchTeacherProgress() {
  if (window.location.pathname !== '/teacher') return;
  const slug = query().get('progress');
  if (!slug) return;
  const record = getLearnerResultRecords(slug)[0];
  const table = document.querySelector('.teacher-progress-table');
  if (!record || !table || table.querySelector('[data-kan41-real-learner]')) return;
  const row = document.createElement('div');
  row.className = 'teacher-progress-row';
  row.dataset.kan41RealLearner = 'true';
  const score = record.quizScore == null ? '—' : `${record.quizScore}/${record.quizScoreTotal || '?'}`;
  const progress = Number(record.progress) || 0;
  row.innerHTML = `<div class="teacher-progress-learner"><span>AJ</span><div><strong>${record.learnerName}</strong><small>Live KAN-41 learner session</small></div></div><div><span class="teacher-progress-status status-${String(record.status || 'In Progress').toLowerCase().replaceAll(' ', '-')}">${record.status || 'In Progress'}</span></div><div class="teacher-progress-meter-cell"><div><strong>${progress}%</strong><span class="teacher-progress-meter"><i style="width:${progress}%"></i></span></div></div><div class="teacher-progress-score"><strong>${score}</strong><small>${record.quizScore == null ? 'Not available' : 'Learner-submitted result'}</small></div><div><button class="button button-outline" type="button">View Learner</button></div>`;
  const head = table.querySelector('.teacher-progress-table-head');
  head?.insertAdjacentElement('afterend', row);
  row.querySelector('button')?.addEventListener('click', () => renderRealLearnerDetail(document.querySelector('.teacher-progress-detail-card'), record));
}

function scan() {
  patchCourseInformation();
  patchLearnerCourseOverview();
  patchDynamicLearnerUnit();
  captureLearnerResults();
  patchTeacherProgress();
}

export default function CrossRoleDataBridge() {
  useEffect(() => {
    let queued = false;
    const scheduleScan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => { queued = false; scan(); });
    };

    function captureTeacherSave(event) {
      const button = event.target.closest('button');
      if (!button) return;
      const current = query();

      const courseRoot = button.closest('.teacher-course-editor-page');
      const editorSlug = current.get('editor');
      if (courseRoot && button.type === 'submit' && editorSlug && editorSlug !== 'new') {
        const snapshot = snapshotCourseEditor(courseRoot);
        window.setTimeout(() => {
          const after = query();
          if (after.get('course') === editorSlug && !after.get('editor')) stageCourseMetadata(editorSlug, snapshot);
        }, 0);
      }

      const unitRoot = button.closest('.teacher-unit-editor-page');
      const courseSlug = current.get('course');
      if (unitRoot && button.type === 'submit' && courseSlug) {
        const snapshot = snapshotUnitEditor(unitRoot, courseSlug);
        window.setTimeout(() => {
          const after = query();
          if (after.get('course') === courseSlug && !after.get('unit') && snapshot.title && snapshot.description) stageUnitContent(courseSlug, snapshot);
        }, 0);
      }

      const quizRoot = button.closest('.teacher-quiz-editor-page');
      const quizUnitId = current.get('quiz');
      if (quizRoot && button.type === 'submit' && courseSlug && quizUnitId) {
        window.setTimeout(() => {
          const after = query();
          if (after.get('course') === courseSlug && !after.get('quiz')) {
            registerCourseContentChange(courseSlug, 'Quiz', `Quiz update · ${quizUnitId}`, prototypePublicationDefaults[courseSlug] || 'Draft');
          }
        }, 0);
      }
    }

    function publicationChanged(event) {
      const { slug, model } = event.detail || {};
      if (slug && model?.live && !model.pending) publishPendingCourseContent(slug, model.live.version);
      scheduleScan();
    }

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', captureTeacherSave, true);
    window.addEventListener('popstate', scheduleScan);
    window.addEventListener('bonsai:publication-status-changed', publicationChanged);
    window.addEventListener('bonsai:cross-role-content-changed', scheduleScan);
    window.addEventListener('bonsai:learner-results-changed', scheduleScan);
    scheduleScan();
    return () => {
      observer.disconnect();
      document.removeEventListener('click', captureTeacherSave, true);
      window.removeEventListener('popstate', scheduleScan);
      window.removeEventListener('bonsai:publication-status-changed', publicationChanged);
      window.removeEventListener('bonsai:cross-role-content-changed', scheduleScan);
      window.removeEventListener('bonsai:learner-results-changed', scheduleScan);
    };
  }, []);

  return null;
}
