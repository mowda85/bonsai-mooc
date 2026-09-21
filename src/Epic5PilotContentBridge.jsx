import { useEffect } from 'react';
import courseMetadata from '../content/pilot-course/course-metadata.json';
import unitData from '../content/pilot-course/units.json';
import lessons from '../content/pilot-course/lessons.json';
import activity from '../content/pilot-course/activity.json';
import quiz from '../content/pilot-course/quiz.json';
import sampleResults from '../content/pilot-course/quiz-results.json';
import sampleFeedback from '../content/pilot-course/feedback.json';
import video from '../content/pilot-course/video-placeholder.json';
import diagramUrl from '../content/pilot-course/flood-crisis-situation-awareness.svg?url';
import checklistUrl from '../content/pilot-course/flood-crisis-response-checklist.txt?url';
import { saveCourseFeedback } from './feedbackStore.js';
import { downloadPilotHandout } from './pilotHandoutDownload.js';

const PILOT_SLUG = courseMetadata.slug;
const unitTitles = unitData.units.map((unit) => unit.title);
const legacyUnitTitleReplacements = new Map([
  ['Introduction to Data, Information and Knowledge', unitTitles[0]],
  ['Introduction to Data, Information & Knowledge', unitTitles[0]],
  ['Information Systems in BONSAI', unitTitles[1]],
  ['Case Study — Information Systems in BONSAI', unitTitles[1]],
  ['Knowledge Dissemination in BONSAI', unitTitles[2]],
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
    const replacement = legacyUnitTitleReplacements.get(trimmed);
    if (replacement) node.nodeValue = node.nodeValue.replace(trimmed, replacement);
    node = walker.nextNode();
  }
}

function patchCourseSurfaces() {
  const courseRoots = document.querySelectorAll('.course-detail-page, .category-v2-course-detail, .learner-course-overview-page, .current-course-dashboard-card');
  courseRoots.forEach((root) => {
    const heading = root.querySelector('h1, h3');
    if (heading?.textContent?.trim() !== courseMetadata.title) return;
    const descriptionTargets = [
      root.querySelector('.course-detail-heading > p'),
      root.querySelector('.category-v2-subhero > p'),
      root.querySelector('.learner-course-overview-hero-grid > div > p'),
      root.querySelector(':scope > p'),
    ];
    descriptionTargets.forEach((target) => setText(target, courseMetadata.description));
  });

  const overview = document.querySelector('.learner-course-overview-page');
  if (overview?.querySelector('h1')?.textContent?.trim() === courseMetadata.title) {
    const about = Array.from(overview.querySelectorAll('.learner-enrolled-course-section')).find((section) => section.querySelector('h2')?.textContent?.trim() === 'Course description');
    setText(about?.querySelector('p'), courseMetadata.description);
    overview.querySelectorAll('.learner-unit-status-copy strong').forEach((element, index) => {
      if (unitTitles[index]) setText(element, unitTitles[index]);
    });
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

function patchGenericVisual(imageSection, lesson) {
  if (!imageSection) return;
  setText(imageSection.querySelector('h2'), `${lesson.title} — visual placeholder`);
  const placeholder = imageSection.querySelector('.lesson-image-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = '<div class="lesson-image-symbol" aria-hidden="true">▧</div>';
  const strong = document.createElement('strong');
  strong.textContent = `${lesson.title} visual`;
  const span = document.createElement('span');
  span.textContent = 'Placeholder for a diagram, map, photograph, model output or infographic supplied by the course team.';
  placeholder.append(strong, span);
}

function patchGenericVideo(videoSection, lesson) {
  if (!videoSection) return;
  setText(videoSection.querySelector('h2'), `${lesson.title} — video placeholder`);
  const player = videoSection.querySelector('.lesson-video-placeholder');
  if (!player) return;
  player.innerHTML = '<button class="lesson-video-play" type="button" aria-label="Prototype video placeholder" disabled>▶</button>';
  const caption = document.createElement('div');
  caption.className = 'lesson-video-caption';
  const strong = document.createElement('strong');
  strong.textContent = `${lesson.title} video`;
  const span = document.createElement('span');
  span.textContent = 'Video placeholder — a teacher can later attach a lesson-specific recording, animation or field demonstration.';
  caption.append(strong, span);
  const controls = document.createElement('div');
  controls.className = 'lesson-video-controls';
  controls.innerHTML = '<span class="lesson-video-progress"><b></b></span><span>0:00</span><span>Transcript placeholder</span>';
  player.append(caption, controls);
}

function patchGenericResource(downloadSection, lesson) {
  if (!downloadSection) return;
  setText(downloadSection.querySelector('h2'), `${lesson.title} — supporting resource`);
  const card = downloadSection.querySelector('.lesson-download-card');
  if (!card) return;
  card.innerHTML = '<div class="lesson-download-file-icon" aria-hidden="true">DOC</div>';
  const copy = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = 'Lesson resource placeholder';
  const p = document.createElement('p');
  p.textContent = 'Placeholder for a checklist, reading, briefing note, dataset or exercise file related to this lesson.';
  const span = document.createElement('span');
  span.textContent = 'Prototype downloadable resource';
  copy.append(strong, p, span);
  const button = document.createElement('button');
  button.className = 'button button-primary';
  button.type = 'button';
  button.disabled = true;
  button.textContent = 'Resource placeholder';
  card.append(document.createElement('div'));
  card.replaceChildren(card.firstChild, copy, button);
  card.firstChild.className = 'lesson-download-file-icon';
  card.firstChild.setAttribute('aria-hidden', 'true');
  card.firstChild.textContent = 'DOC';
}

function buildTheoryFigure(figure) {
  const wrapper = document.createElement('figure');
  wrapper.className = 'lesson-theory-figure';

  const image = document.createElement('img');
  image.src = figure.src;
  image.alt = figure.alt || '';
  image.loading = 'lazy';
  image.decoding = 'async';

  const caption = document.createElement('figcaption');
  caption.textContent = figure.caption || '';

  wrapper.append(image, caption);
  return wrapper;
}

function renderSourceBasedLesson(textBody, lesson) {
  if (!textBody) return;
  textBody.replaceChildren();
  textBody.classList.add('lesson-source-reading');

  const intro = document.createElement('p');
  intro.className = 'lesson-theory-intro';
  intro.textContent = lesson.body;
  textBody.appendChild(intro);

  (lesson.sections || []).forEach((section) => {
    const block = document.createElement('section');
    block.className = 'lesson-theory-section';

    const heading = document.createElement('h3');
    heading.textContent = section.heading;
    block.appendChild(heading);

    const body = document.createElement('p');
    body.textContent = section.body;
    block.appendChild(body);

    if (section.figures?.length) {
      const figures = document.createElement('div');
      figures.className = `lesson-theory-figure-grid${section.figures.length > 1 ? ' is-multiple' : ''}`;
      section.figures.forEach((figure) => figures.appendChild(buildTheoryFigure(figure)));
      block.appendChild(figures);
    }

    textBody.appendChild(block);
  });

  if (lesson.references?.length) {
    const referenceBlock = document.createElement('section');
    referenceBlock.className = 'lesson-theory-references';
    const heading = document.createElement('h3');
    heading.textContent = 'Source basis';
    referenceBlock.appendChild(heading);
    const list = document.createElement('ul');
    lesson.references.forEach((reference) => {
      const item = document.createElement('li');
      item.textContent = reference;
      list.appendChild(item);
    });
    referenceBlock.appendChild(list);
    textBody.appendChild(referenceBlock);
  }
}

function patchLessonContent() {
  const root = document.querySelector('.lesson-content-page');
  if (!root) return;
  const position = lessonPosition(root);
  if (!position) return;
  const { unitNumber, lessonNumber } = position;
  const lesson = lessons.find((item) => item.unitNumber === unitNumber && item.lessonNumber === lessonNumber);
  if (!lesson) return;
  const integrationKey = `${unitNumber}-${lessonNumber}`;
  const suppliedDescription = lesson.source === 'partner-supplied-description';
  const sourceBasedReading = lesson.source === 'source-based-synthesis';
  if (root.dataset.kan68PilotIntegrated === integrationKey) return;
  root.dataset.kan68PilotIntegrated = integrationKey;

  const hero = root.querySelector('.lesson-content-hero-grid > div');
  setText(hero?.querySelector('.lesson-content-status'), sourceBasedReading ? 'Source-based theory' : suppliedDescription ? 'Supplied course description' : 'Flood crisis pilot content');
  setText(hero?.querySelector('h1'), lesson.title);
  setText(hero?.querySelector('p'), sourceBasedReading ? 'A concise source-based reading connecting flood modelling, AI forecasting, ANN foundations, uncertainty and crisis decision-making.' : suppliedDescription ? 'Read the supplied overview of Flood Inundation Forecasting Using AI. Videos, slides, datasets and exercises for this unit have not yet been supplied.' : 'Study this prototype lesson, review the visual/video/resource placeholders, and connect the content to the wider flood-crisis scenario.');

  const textSection = root.querySelector('.lesson-text-block');
  setText(textSection?.querySelector('h2'), sourceBasedReading ? 'Theory: from flood model to crisis decision' : lesson.title);
  const textBody = textSection?.querySelector('.lesson-text-placeholder');
  if (sourceBasedReading) {
    renderSourceBasedLesson(textBody, lesson);
  } else if (textBody) {
    textBody.classList.remove('lesson-source-reading');
    textBody.innerHTML = `<strong>${lesson.title}</strong>${paragraphHtml(lesson.body)}${suppliedDescription ? '' : '<p><strong>Prototype takeaway:</strong> Connect this lesson to the shared situation picture, the decisions that may be required, and the organisations that would need the information.</p>'}`;
  }

  const imageSection = root.querySelector('#lesson-image-heading')?.closest('.lesson-content-block');
  if (sourceBasedReading && imageSection) {
    imageSection.style.display = 'none';
  } else if (imageSection) {
    imageSection.style.display = '';
  }
  if (unitNumber === 1 && lessonNumber === 3 && imageSection) {
    setText(imageSection.querySelector('h2'), 'Flood crisis situation-awareness flow');
    const placeholder = imageSection.querySelector('.lesson-image-placeholder');
    if (placeholder) placeholder.innerHTML = `<img src="${diagramUrl}" alt="Flow from observations and inspections through forecasting and risk assessment to a shared situation picture and coordinated crisis decisions" style="display:block;width:100%;height:auto;border-radius:16px" />`;
  } else {
    patchGenericVisual(imageSection, lesson);
  }

  const videoSection = root.querySelector('#lesson-video-heading')?.closest('.lesson-content-block');
  if (unitNumber === 3 && lessonNumber === 3 && videoSection) {
    setText(videoSection.querySelector('h2'), video.title);
    const player = videoSection.querySelector('.lesson-video-placeholder');
    if (player) {
      player.innerHTML = `<button class="lesson-video-play" type="button" aria-label="Prototype video placeholder" disabled>▶</button><div class="lesson-video-caption"><strong>${video.title}</strong><span>${video.caption}</span></div><div class="lesson-video-controls"><span class="lesson-video-progress"><b></b></span><span>${video.durationLabel}</span><span>${video.transcriptAvailable ? 'Transcript available' : 'Transcript unavailable'}</span></div>`;
    }
  } else {
    patchGenericVideo(videoSection, lesson);
  }

  const downloadSection = root.querySelector('#lesson-download-heading')?.closest('.lesson-content-block');
  if (sourceBasedReading && lesson.companionResource && downloadSection) {
    setText(downloadSection.querySelector('h2'), lesson.companionResource.title);
    const card = downloadSection.querySelector('.lesson-download-card');
    if (card) {
      card.innerHTML = `<div class="lesson-download-file-icon" aria-hidden="true">DOCX</div><div><strong>${lesson.companionResource.title}</strong><p>${lesson.companionResource.description}</p><span>${lesson.companionResource.meta}</span></div><button class="button button-primary" type="button">Download handout ↓</button>`;
      const button = card.querySelector('button');
      button?.addEventListener('click', async () => {
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = 'Preparing DOCX…';
        try {
          await downloadPilotHandout();
          button.textContent = 'Downloaded ✓';
          window.setTimeout(() => {
            if (!button.isConnected) return;
            button.disabled = false;
            button.textContent = 'Download handout ↓';
          }, 1600);
        } catch (error) {
          console.error('BONSAI companion handout download failed', error);
          button.disabled = false;
          button.textContent = 'Download failed — retry';
        }
      });
    }
  } else if (unitNumber === 3 && lessonNumber === 5 && downloadSection) {
    setText(downloadSection.querySelector('h2'), 'BONSAI Flood Crisis Response Checklist');
    const card = downloadSection.querySelector('.lesson-download-card');
    if (card) card.innerHTML = `<div class="lesson-download-file-icon" aria-hidden="true">TXT</div><div><strong>BONSAI Flood Crisis Response Checklist</strong><p>A prototype checklist covering situational awareness, forecasting, flood-defence information, impacts, coordination, communication, response actions, review and resilience.</p><span>TXT · Sample MOOC resource</span></div><a class="button button-primary" href="${checklistUrl}" download>Download checklist ↓</a>`;
  } else {
    patchGenericResource(downloadSection, lesson);
  }

  const typeList = root.querySelector('.lesson-content-type-list');
  if (typeList) {
    const items = sourceBasedReading
      ? ['✓ Source-based theory', '✓ 3 contextual figures', '✓ Extended DOCX reading', '✓ Unit 2 practice quiz']
      : suppliedDescription
        ? ['✓ Supplied description', 'Teaching resources pending']
        : ['✓ Prototype text content', '✓ Visual content slot', '✓ Video content slot', '✓ Resource slot'];
    if (unitNumber === 1 && lessonNumber === 3) items[1] = '✓ Situation-awareness diagram';
    if (unitNumber === 3 && lessonNumber === 3) items[2] = '✓ Forecast-to-decision video placeholder';
    if (unitNumber === 3 && lessonNumber === 5) items[3] = '✓ Flood crisis response checklist';
    typeList.innerHTML = items.map((item) => `<span>${item}</span>`).join('');
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
    setText(quizSection.querySelector('h2'), 'Required flood crisis management knowledge check');
    setText(quizSection.querySelector('.learner-unit-quiz-heading p'), 'Answer five multiple-choice questions covering crisis management, situational awareness, forecasting and flood-defence information before completing Unit 1.');
    setText(quizSection.querySelector('.learner-unit-quiz-badge'), `${quiz.questions.length} questions`);
    setText(quizSection.querySelector('.learner-unit-quiz-card small'), 'Required pilot quiz');
    setText(quizSection.querySelector('.learner-unit-quiz-card strong'), 'Five flood-crisis multiple-choice questions');
  }

  const activitySection = root.querySelector('.learner-unit-activity');
  if (unitNumber === 3 && activitySection) {
    setText(activitySection.querySelector('h2'), activity.title);
    setText(activitySection.querySelector('.learner-unit-activity-heading p'), `${activity.instructions} Complete this activity before finishing Unit 3.`);
    const strong = activitySection.querySelector('.learner-unit-activity-card strong');
    if (strong && !strong.textContent.includes('recorded')) setText(strong, `${activity.recommendedLength} scenario response`);
  }
}

function patchTeacherProgress() {
  if (window.location.pathname !== '/teacher' || new URLSearchParams(window.location.search).get('progress') !== PILOT_SLUG) return;
  const table = document.querySelector('.teacher-progress-table');
  if (!table) return;
  const head = table.querySelector('.teacher-progress-table-head');
  sampleResults.forEach((record) => {
    if (table.querySelector(`[data-kan67-sample-result="${record.learnerId}"]`)) return;
    const row = document.createElement('div');
    row.className = 'teacher-progress-row';
    row.dataset.kan67SampleResult = record.learnerId;
    row.innerHTML = `<div class="teacher-progress-learner"><span>${record.learnerName.slice(-1)}</span><div><strong>${record.learnerName}</strong><small>Flood crisis pilot sample result</small></div></div><div><span class="teacher-progress-status status-completed">Quiz submitted</span></div><div class="teacher-progress-meter-cell"><div><strong>—</strong><span class="teacher-progress-meter"><i style="width:0%"></i></span></div></div><div class="teacher-progress-score"><strong>${record.quizScore}/${record.quizScoreTotal}</strong><small>Sample result</small></div><div><button class="button button-outline" type="button" disabled>Sample record</button></div>`;
    head?.after(row);
  });
}

function patchAll() {
  exactTextReplacements();
  patchCourseSurfaces();
  patchLearnerUnit();
  patchLessonContent();
  patchTeacherProgress();
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
