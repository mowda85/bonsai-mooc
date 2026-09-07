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
import { PILOT_COURSE_SLUG, PILOT_COURSE_UNITS } from './courseArchitecture.js';

const PILOT_BASE_UNIT_COUNT = PILOT_COURSE_UNITS.length;
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
  const file = fileCard ? {
    name: fileCard.querySelector('strong')?.textContent?.trim() || '',
    meta: fileCard.querySelector('span')?.textContent?.trim() || '',
  } : null;
  const id = slugify(title);
  return {
    id,
    title,
    description,
    exercise,
    file,
    source: 'teacher-published',
    courseSlug,
    lessons: [{ id: `${id}-lesson-1`, title: 'Lesson 1', content: description, file }],
  };
}

function courseSlugFromPublicPath() {
  return window.location.pathname.match(/^\/courses\/([^/]+)/)?.[1] || '';
}

function courseSlugFromLearner() {
  return query().get('course') || PILOT_COURSE_SLUG;
}

function replaceText(element, value) {
  if (element && value != null && element.textContent !== value) element.textContent = value;
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
  replaceText(root.querySelector('#course-description-heading')?.nextElementSibling, course.description);
  if (Array.isArray(course.objectives) && course.objectives.length) {
    const section = root.querySelector('#objectives-heading')?.closest('.course-section');
    if (section) {
      let list = section.querySelector('.objective-list');
      if (!list) {
        section.querySelector('.content-pending')?.remove();
        list = document.createElement('div');
        list.className = 'objective-list';
        section.appendChild(list);
      }
      list.innerHTML = course.objectives.map((objective, index) => `<div class="objective-item"><span>${index + 1}</span><p>${objective}</p></div>`).join('');
    }
  }
}

function appendPublishedUnitsToLearnerOverview(root, slug, units) {
  if (!units?.length) return;
  const list = root.querySelector('.learner-unit-status-list');
  if (!list) return;
  units.forEach((unit, index) => {
    if (String(unit.id || '').startsWith('pilot-unit-')) return;
    if (list.querySelector(`[data-cross-role-unit="${unit.id}"]`)) return;
    const unitNumber = PILOT_BASE_UNIT_COUNT + index + 1;
    const article = document.createElement('article');
    article.className = 'learner-unit-status-card';
    article.dataset.crossRoleUnit = unit.id;
    article.innerHTML = `<div class="learner-unit-status-number">${unitNumber}</div><div class="learner-unit-status-copy"><span>Unit ${unitNumber}</span><strong>${unit.title}</strong><small>${unit.lessons?.length || 1} teacher-published lesson</small></div><div class="learner-unit-status-action"><b>Published update</b><button type="button" class="button button-outline">Open</button></div>`;
    article.querySelector('button')?.addEventListener('click', () => {
      window.history.pushState({}, '', `/learner?course=${encodeURIComponent(slug)}&unit=${unitNumber}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    list.appendChild(article);
  });
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
  const about = Array.from(root.querySelectorAll('.learner-enrolled-course-section')).find((section) => section.querySelector('h2')?.textContent === 'Course description');
  replaceText(about?.querySelector('p'), course.description);
  appendPublishedUnitsToLearnerOverview(root, slug, live.units || []);
}

function renderDynamicLesson(root, slug, unitNumber, unit) {
  const lesson = unit.lessons?.[0] || { title: 'Lesson 1', content: unit.description || '' };
  root.innerHTML = `<section class="lesson-content-hero"><button class="back-link" type="button">← Back to Unit ${unitNumber}</button><div class="lesson-content-hero-grid"><div><div class="lesson-content-badges"><span class="pill">Learner lesson</span><span class="lesson-content-status">Teacher-published</span></div><span class="learner-unit-kicker">Unit ${unitNumber} · Lesson 1</span><h1>${lesson.title || 'Lesson 1'}</h1><p>Published teacher content from the BONSAI prototype publication flow.</p></div><aside class="lesson-content-summary"><div><span>Unit</span><strong>${unit.title}</strong></div><div><span>Source</span><strong>Published teacher update</strong></div></aside></div></section><section class="lesson-content-body"><div class="lesson-content-main"><section class="lesson-content-block lesson-text-block"><div class="lesson-content-block-heading"><span class="lesson-type-icon">T</span><div><span class="section-kicker">Text content</span><h2>Published lesson content</h2></div></div><div class="lesson-text-placeholder"><strong>${unit.title}</strong><p>${lesson.content || unit.description || 'No text content supplied.'}</p></div></section></div></section>`;
  root.querySelector('.back-link')?.addEventListener('click', () => {
    window.history.pushState({}, '', `/learner?course=${encodeURIComponent(slug)}&unit=${unitNumber}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

function patchDynamicLearnerUnit() {
  if (window.location.pathname !== '/learner') return;
  const unitNumber = Number(query().get('unit')) || 0;
  if (unitNumber <= PILOT_BASE_UNIT_COUNT) return;
  const slug = courseSlugFromLearner();
  const live = getLiveCourseContent(slug);
  const extraUnits = (live?.units || []).filter((unit) => !String(unit.id || '').startsWith('pilot-unit-'));
  const unit = extraUnits[unitNumber - PILOT_BASE_UNIT_COUNT - 1];
  const root = document.querySelector('.learner-unit-page');
  if (!root || !unit || root.dataset.crossRoleRendered === unit.id) return;
  root.dataset.crossRoleRendered = unit.id;
  root.innerHTML = `<section class="learner-unit-hero"><button class="back-link" type="button">← Back to course overview</button><div class="learner-unit-hero-grid"><div><div class="learner-unit-badges"><span class="pill">Learner unit</span><span class="learner-unit-status-pill learner-unit-status-current">Teacher-published</span></div><span class="learner-unit-kicker">Unit ${unitNumber}</span><h1>${unit.title}</h1><p>${unit.description || ''}</p></div><aside class="learner-unit-summary"><div><span>Lessons</span><strong>${unit.lessons?.length || 1}</strong></div><div><span>Source</span><strong>Published teacher content</strong></div></aside></div></section><section class="learner-unit-body"><div class="learner-unit-main"><section class="learner-unit-intro"><span class="section-kicker">Unit overview</span><h2>What is in this unit?</h2><p>${unit.description || ''}</p></section><section class="learner-unit-lessons"><div class="learner-unit-section-heading"><div><span class="section-kicker">Lessons</span><h2>Unit ${unitNumber} lessons</h2></div></div><div class="learner-lesson-list"><button class="learner-lesson-card" type="button"><span class="learner-lesson-number">01</span><div><small>Lesson 1</small><strong>${unit.lessons?.[0]?.title || 'Lesson 1'}</strong></div><span class="learner-lesson-action">Open lesson →</span></button></div></section></div></section>`;
  root.querySelector('.back-link')?.addEventListener('click', () => {
    window.history.pushState({}, '', `/learner?course=${encodeURIComponent(slug)}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  root.querySelector('.learner-lesson-card')?.addEventListener('click', () => renderDynamicLesson(root, slug, unitNumber, unit));
}

function captureLearnerResults() {
  if (window.location.pathname !== '/learner') return;
  const slug = courseSlugFromLearner();
  const overview = document.querySelector('.learner-course-overview-page');
  if (overview) {
    const row = Array.from(overview.querySelectorAll('.learner-course-overview-summary > div')).find((item) => item.querySelector('span')?.textContent === 'Progress');
    const match = (row?.querySelector('strong')?.textContent || '').match(/(\d+)\s+of\s+(\d+)\s+units\s+·\s+(\d+)%/i);
    if (match) {
      const completedUnits = Number(match[1]);
      const totalUnits = Number(match[2]);
      const progress = Number(match[3]);
      saveLearnerProgressRecord({ ...PROTOTYPE_LEARNER, courseSlug: slug, completedUnits, totalUnits, progress, status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started' });
    }
  }
  const results = document.querySelector('.quiz-results-page');
  if (results) {
    const match = (results.querySelector('.quiz-results-score-card strong')?.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
    if (match) saveLearnerQuizResult({ ...PROTOTYPE_LEARNER, courseSlug: slug, score: Number(match[1]), scoreTotal: Number(match[2]) });
  }
  if (query().get('completion') === '1') {
    saveLearnerProgressRecord({ ...PROTOTYPE_LEARNER, courseSlug: slug, progress: 100, status: 'Completed' });
  }
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
  const progress = Number(record.progress) || 0;
  const score = record.quizScore == null ? '—' : `${record.quizScore}/${record.quizScoreTotal || '?'}`;
  row.innerHTML = `<div class="teacher-progress-learner"><span>AJ</span><div><strong>${record.learnerName}</strong><small>Same-session learner record</small></div></div><div><span class="teacher-progress-status status-${String(record.status || 'In Progress').toLowerCase().replaceAll(' ', '-')}">${record.status || 'In Progress'}</span></div><div class="teacher-progress-meter-cell"><div><strong>${progress}%</strong><span class="teacher-progress-meter"><i style="width:${progress}%"></i></span></div></div><div class="teacher-progress-score"><strong>${score}</strong><small>Live prototype result</small></div><div><button class="button button-outline" type="button" disabled>Session record</button></div>`;
  table.querySelector('.teacher-progress-table-head')?.after(row);
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
      window.requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    };

    function captureTeacherSave(event) {
      const button = event.target.closest?.('button');
      if (!button) return;
      const current = query();
      const courseRoot = button.closest('.teacher-course-editor-page');
      const editorSlug = current.get('editor');
      if (courseRoot && button.type === 'submit' && editorSlug && editorSlug !== 'new') {
        const snapshot = snapshotCourseEditor(courseRoot);
        window.setTimeout(() => {
          const after = query();
          if (after.get('course') === editorSlug && !after.get('editor')) {
            stageCourseMetadata(editorSlug, snapshot);
            registerCourseContentChange(editorSlug, 'Course metadata', 'Course title, description, objectives or authors updated', prototypePublicationDefaults[editorSlug] || 'Draft');
          }
        }, 0);
      }

      const unitRoot = button.closest('.teacher-unit-editor-page');
      const courseSlug = current.get('course');
      if (unitRoot && button.type === 'submit' && courseSlug) {
        const snapshot = snapshotUnitEditor(unitRoot, courseSlug);
        if (snapshot.title) {
          window.setTimeout(() => {
            stageUnitContent(courseSlug, snapshot);
            registerCourseContentChange(courseSlug, 'Unit content', `${snapshot.title} updated`, prototypePublicationDefaults[courseSlug] || 'Draft');
          }, 20);
        }
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
