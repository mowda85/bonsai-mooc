import { useEffect } from 'react';
import courseMetadata from '../content/pilot-course/course-metadata.json';
import unitData from '../content/pilot-course/units.json';
import lessons from '../content/pilot-course/lessons.json';
import activity from '../content/pilot-course/activity.json';
import quiz from '../content/pilot-course/quiz.json';
import sampleResults from '../content/pilot-course/quiz-results.json';
import sampleFeedback from '../content/pilot-course/feedback.json';
import video from '../content/pilot-course/video-placeholder.json';
import diagramUrl from '../content/pilot-course/data-information-knowledge.svg?url';
import checklistUrl from '../content/pilot-course/bonsai-knowledge-sharing-checklist.txt?url';
import { saveCourseFeedback } from './feedbackStore.js';

const PILOT_SLUG = courseMetadata.slug;
const unitTitles = unitData.units.map((unit) => unit.title);
const titleReplacements = new Map([
  ['Introduction to Data, Information and Knowledge', unitTitles[0]],
  ['Information Systems in BONSAI', unitTitles[1]],
]);

function setText(element, value) {
  if (element && value != null && element.textContent !== value) element.textContent = value;
}

function exactTextReplacements(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const trimmed = node.nodeValue.trim();
    const replacement = titleReplacements.get(trimmed);
    if (replacement) node.nodeValue = node.nodeValue.replace(trimmed, replacement);
    node = walker.nextNode();
  }
}

function pilotCourseRoot() {
  const title = document.querySelector('.course-detail-heading h1')?.textContent?.trim();
  return title === courseMetadata.title ? document.querySelector('.course-detail-page') : null;
}

function patchCourseSurfaces() {
  const courseRoot = pilotCourseRoot();
  if (courseRoot) {
    setText(courseRoot.querySelector('.course-detail-heading h1'), courseMetadata.title);
    setText(courseRoot.querySelector('.course-detail-heading > p'), courseMetadata.description);
    const about = courseRoot.querySelector('#course-description-heading')?.closest('.course-section');
    setText(about?.querySelector('p'), courseMetadata.description);
  }

  document.querySelectorAll('.catalogue-pilot-card, .pilot-course-card').forEach((card) => {
    const title = card.querySelector('strong')?.textContent?.trim();
    if (title === courseMetadata.title) setText(card.querySelector('p'), courseMetadata.description);
  });

  const currentCourse = document.querySelector('.current-course-dashboard-card');
  if (currentCourse?.querySelector('h3')?.textContent?.trim() === courseMetadata.title) {
    setText(currentCourse.querySelector('p'), courseMetadata.description);
  }

  const overview = document.querySelector('.learner-course-overview-page');
  if (overview?.querySelector('h1')?.textContent?.trim() === courseMetadata.title) {
    setText(overview.querySelector('.learner-course-overview-hero-grid > div > p'), courseMetadata.description);
    const about = Array.from(overview.querySelectorAll('.learner-enrolled-course-section')).find((section) => section.querySelector('h2')?.textContent?.trim() === 'Course description');
    setText(about?.querySelector('p'), courseMetadata.description);
    overview.querySelectorAll('.learner-unit-status-copy strong').forEach((element, index) => {
      if (unitTitles[index]) setText(element, unitTitles[index]);
    });
  }
}

function patchPublicStartPlaceholder() {
  const root = document.querySelector('.unit-placeholder-page');
  if (!root || root.dataset.epic5Integrated === 'true') return;
  const heading = root.querySelector('h1');
  if (!heading || !heading.textContent.includes('Data')) return;
  root.dataset.epic5Integrated = 'true';
  setText(root.querySelector('.pill'), 'Pilot course content');
  setText(heading, unitTitles[0]);
  setText(root.querySelector('.unit-placeholder-card > p'), 'The BONSAI sample lessons, media, activity and quiz are now integrated in the learner workspace. Log in with a learner account to take the course end to end.');
  const meta = Array.from(root.querySelectorAll('.unit-placeholder-meta > div'));
  if (meta[2]) {
    setText(meta[2].querySelector('span'), 'Content status');
    setText(meta[2].querySelector('strong'), 'Epic 5 sample content integrated');
  }
}

function lessonPosition(root) {
  const text = root.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = text.match(/Unit\s+(\d+)\s+·\s+Lesson\s+(\d+)/i);
  return match ? { unitNumber: Number(match[1]), lessonNumber: Number(match[2]) } : null;
}

function paragraphHtml(value) {
  const container = document.createElement('div');
  String(value || '').split(/\n\n+/).forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph;
    container.appendChild(p);
  });
  return container.innerHTML;
}

function patchLessonContent() {
  const root = document.querySelector('.lesson-content-page');
  if (!root || root.dataset.epic5Integrated === 'true') return;
  const position = lessonPosition(root);
  if (!position) return;
  root.dataset.epic5Integrated = 'true';
  const { unitNumber, lessonNumber } = position;
  const lesson = lessons.find((item) => item.unitNumber === unitNumber && item.lessonNumber === lessonNumber);
  const hero = root.querySelector('.lesson-content-hero-grid > div');
  setText(hero?.querySelector('.lesson-content-status'), 'BONSAI sample content');

  const textSection = root.querySelector('.lesson-text-block');
  if (lesson) {
    setText(hero?.querySelector('h1'), lesson.title);
    setText(hero?.querySelector('p'), 'Read the pilot lesson and use the accompanying diagram to follow the data → information → knowledge pipeline in the BONSAI context.');
    setText(textSection?.querySelector('h2'), lesson.title);
    const textBody = textSection?.querySelector('.lesson-text-placeholder');
    if (textBody) textBody.innerHTML = `<strong>${lesson.title}</strong>${paragraphHtml(lesson.body)}`;
  } else {
    textSection?.remove();
  }

  const imageSection = root.querySelector('#lesson-image-heading')?.closest('.lesson-content-block');
  if (unitNumber === 1 && lessonNumber === 1 && imageSection) {
    setText(imageSection.querySelector('h2'), 'Data → Information → Knowledge diagram');
    const placeholder = imageSection.querySelector('.lesson-image-placeholder');
    if (placeholder) placeholder.innerHTML = `<img src="${diagramUrl}" alt="Diagram showing Data progressing to Information and then Knowledge" style="display:block;width:100%;height:auto;border-radius:16px" />`;
  } else {
    imageSection?.remove();
  }

  const videoSection = root.querySelector('#lesson-video-heading')?.closest('.lesson-content-block');
  if (unitNumber === 2 && lessonNumber === 2 && videoSection) {
    setText(hero?.querySelector('p'), video.caption);
    setText(videoSection.querySelector('h2'), video.title);
    const player = videoSection.querySelector('.lesson-video-placeholder');
    if (player) {
      player.innerHTML = `<button class="lesson-video-play" type="button" aria-label="Prototype video placeholder" disabled>▶</button><div class="lesson-video-caption"><strong>${video.title}</strong><span>${video.caption}</span></div><div class="lesson-video-controls"><span class="lesson-video-progress"><b></b></span><span>${video.durationLabel}</span><span>${video.transcriptAvailable ? 'Transcript available' : 'Transcript unavailable'}</span></div>`;
    }
  } else {
    videoSection?.remove();
  }

  const downloadSection = root.querySelector('#lesson-download-heading')?.closest('.lesson-content-block');
  if (unitNumber === 3 && lessonNumber === 1 && downloadSection) {
    setText(hero?.querySelector('p'), 'Review the knowledge-dissemination unit and use the downloadable checklist when preparing a project result or lesson learned for sharing.');
    setText(downloadSection.querySelector('h2'), 'BONSAI Knowledge Sharing Checklist');
    const card = downloadSection.querySelector('.lesson-download-card');
    if (card) card.innerHTML = `<div class="lesson-download-file-icon" aria-hidden="true">TXT</div><div><strong>BONSAI Knowledge Sharing Checklist</strong><p>A practical eight-step prototype checklist covering audience, purpose, evidence, messaging, format, reuse, transnational learning and review.</p><span>TXT · Sample MOOC resource</span></div><a class="button button-primary" href="${checklistUrl}" download>Download checklist ↓</a>`;
  } else {
    downloadSection?.remove();
  }

  const typeList = root.querySelector('.lesson-content-type-list');
  if (typeList) {
    const items = [];
    if (lesson) items.push('✓ Sample text lesson');
    if (unitNumber === 1 && lessonNumber === 1) items.push('✓ Pipeline diagram');
    if (unitNumber === 2 && lessonNumber === 2) items.push('✓ Video placeholder');
    if (unitNumber === 3 && lessonNumber === 1) items.push('✓ Downloadable checklist');
    typeList.innerHTML = items.length ? items.map((item) => `<span>${item}</span>`).join('') : '<span>No additional Epic 5 media supplied for this lesson</span>';
  }
}

function patchLearnerUnit() {
  const root = document.querySelector('.learner-unit-page');
  if (!root) return;
  const kicker = root.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = kicker.match(/Unit\s+(\d+)/i);
  const unitNumber = match ? Number(match[1]) : 0;
  if (unitNumber && unitTitles[unitNumber - 1]) setText(root.querySelector('.learner-unit-hero h1'), unitTitles[unitNumber - 1]);

  const quizSection = root.querySelector('.learner-unit-quiz');
  if (unitNumber === 1 && quizSection) {
    setText(quizSection.querySelector('h2'), 'Unit 1 knowledge check');
    setText(quizSection.querySelector('.learner-unit-quiz-heading p'), 'Answer five multiple-choice questions based on the Unit 1 lesson and the BONSAI project context.');
    setText(quizSection.querySelector('.learner-unit-quiz-badge'), `${quiz.questions.length} questions`);
    setText(quizSection.querySelector('.learner-unit-quiz-card small'), 'Pilot quiz');
    setText(quizSection.querySelector('.learner-unit-quiz-card strong'), 'Five multiple-choice questions');
  }

  const activitySection = root.querySelector('.learner-unit-activity');
  if (unitNumber === 2 && activitySection) {
    setText(activitySection.querySelector('h2'), activity.title);
    setText(activitySection.querySelector('.learner-unit-activity-heading p'), activity.instructions);
    const strong = activitySection.querySelector('.learner-unit-activity-card strong');
    if (strong && !strong.textContent.includes('recorded')) setText(strong, `${activity.recommendedLength} free-text reflection`);
  }
}

function patchTeacherProgress() {
  if (window.location.pathname !== '/teacher' || new URLSearchParams(window.location.search).get('progress') !== PILOT_SLUG) return;
  const table = document.querySelector('.teacher-progress-table');
  if (!table) return;
  const head = table.querySelector('.teacher-progress-table-head');
  sampleResults.forEach((record) => {
    if (table.querySelector(`[data-epic5-sample-result="${record.learnerId}"]`)) return;
    const row = document.createElement('div');
    row.className = 'teacher-progress-row';
    row.dataset.epic5SampleResult = record.learnerId;
    row.innerHTML = `<div class="teacher-progress-learner"><span>${record.learnerName.slice(-1)}</span><div><strong>${record.learnerName}</strong><small>Epic 5 sample quiz result</small></div></div><div><span class="teacher-progress-status status-completed">Quiz submitted</span></div><div class="teacher-progress-meter-cell"><div><strong>—</strong><span class="teacher-progress-meter"><i style="width:0%"></i></span></div></div><div class="teacher-progress-score"><strong>${record.quizScore}/${record.quizScoreTotal}</strong><small>Sample result</small></div><div><button class="button button-outline" type="button" disabled>Sample record</button></div>`;
    head?.after(row);
  });
}

function patchFeedbackCopy() {
  const empty = document.querySelector('.teacher-feedback-empty');
  if (empty?.querySelector('h2')?.textContent === 'No learner feedback submitted yet' && sampleFeedback.length) {
    // The seeded records will be visible on the next route render. Trigger that render once.
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

function patchAll() {
  exactTextReplacements();
  patchCourseSurfaces();
  patchPublicStartPlaceholder();
  patchLearnerUnit();
  patchLessonContent();
  patchTeacherProgress();
  patchFeedbackCopy();
}

function seedSampleFeedback() {
  sampleFeedback.forEach((record) => saveCourseFeedback(record));
}

export default function Epic5PilotContentBridge() {
  useEffect(() => {
    seedSampleFeedback();
    let queued = false;
    const scan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        patchAll();
      });
    };
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('popstate', scan);
    scan();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scan);
    };
  }, []);
  return null;
}
