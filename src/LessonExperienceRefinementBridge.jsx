import { useEffect } from 'react';
import { getLiveCourseContent, stageUnitContent } from './crossRoleCourseStore.js';
import { PILOT_COURSE_SLUG, PILOT_COURSE_UNITS } from './courseArchitecture.js';

const QUIZ_HANDOFF_KEY = 'bonsai-mooc.prototype.kan63.open-unit-1-quiz.v2';
const PILOT_BASE_UNIT_COUNT = PILOT_COURSE_UNITS.length;

function query() {
  return new URLSearchParams(window.location.search);
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'teacher-unit';
}

function readFileMetadata(root) {
  const card = root.querySelector('.teacher-unit-file-summary');
  if (!card) return null;
  return {
    name: card.querySelector('strong')?.textContent?.trim() || '',
    meta: card.querySelector('span')?.textContent?.trim() || '',
  };
}

function snapshotEnhancedUnit(root, courseSlug) {
  const title = root.querySelector('input[placeholder="Enter unit title"]')?.value?.trim() || '';
  const description = root.querySelector('textarea[placeholder^="Describe the unit"]')?.value?.trim() || '';
  const exercise = root.querySelector('textarea[placeholder^="Add an exercise"]')?.value?.trim() || '';
  const videoTitle = root.querySelector('input[name="lessonVideoTitle"]')?.value?.trim() || '';
  const videoUrl = root.querySelector('input[name="lessonVideoUrl"]')?.value?.trim() || '';
  const file = readFileMetadata(root);
  const id = slugify(title);
  const video = videoUrl ? { title: videoTitle || 'Lesson video', url: videoUrl } : null;
  return {
    id,
    title,
    description,
    exercise,
    file,
    videoTitle,
    videoUrl,
    source: 'teacher-published',
    courseSlug,
    lessons: [{ id: `${id}-lesson-1`, title: 'Lesson 1', content: description, file, video }],
  };
}

function readQuizHandoff() {
  try {
    return window.sessionStorage.getItem(QUIZ_HANDOFF_KEY) === '1';
  } catch {
    return false;
  }
}

function setQuizHandoff(active) {
  try {
    if (active) window.sessionStorage.setItem(QUIZ_HANDOFF_KEY, '1');
    else window.sessionStorage.removeItem(QUIZ_HANDOFF_KEY);
  } catch {
    // Normal unit navigation remains available when storage is restricted.
  }
}

function patchFinalLessonQuiz() {
  const root = document.querySelector('.lesson-content-page');
  if (!root) return;
  const kicker = root.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = kicker.match(/Unit\s+(\d+)\s+·\s+Lesson\s+(\d+)\s+of\s+(\d+)/i);
  if (!match) return;
  const unitNumber = Number(match[1]);
  const lessonNumber = Number(match[2]);
  const lessonTotal = Number(match[3]);
  if (unitNumber !== 1 || lessonNumber !== lessonTotal) return;
  const nav = root.querySelector('.lesson-content-navigation');
  const nextButton = nav?.querySelector('button:last-child');
  if (!nav || !nextButton || nextButton.dataset.kan63QuizHandoff === 'true') return;
  nextButton.dataset.kan63QuizHandoff = 'true';
  nextButton.disabled = false;
  nextButton.textContent = 'Go to Quiz →';
  nextButton.addEventListener('click', () => {
    setQuizHandoff(true);
    const unitOverview = Array.from(nav.querySelectorAll('button')).find((button) => /Unit\s+1\s+overview/i.test(button.textContent || ''));
    if (unitOverview) unitOverview.click();
  });
}

function continueQuizHandoff() {
  if (!readQuizHandoff()) return;
  const quizCard = document.querySelector('.learner-unit-page .learner-unit-quiz-card');
  if (!quizCard) return;
  setQuizHandoff(false);
  window.setTimeout(() => quizCard.click(), 0);
}

function createVideoSection({ title = 'Optional lesson video', message = 'No video has been added for this lesson yet.' } = {}) {
  const section = document.createElement('section');
  section.className = 'lesson-content-block';
  section.dataset.kan63VideoSlot = 'true';
  const heading = document.createElement('div');
  heading.className = 'lesson-content-block-heading';
  heading.innerHTML = '<span class="lesson-type-icon">▶</span><div><span class="section-kicker">Video content</span><h2 id="lesson-video-heading"></h2></div>';
  heading.querySelector('h2').textContent = title;
  const player = document.createElement('div');
  player.className = 'lesson-video-placeholder';
  const caption = document.createElement('div');
  caption.className = 'lesson-video-caption';
  const strong = document.createElement('strong');
  strong.textContent = title;
  const span = document.createElement('span');
  span.textContent = message;
  caption.append(strong, span);
  player.appendChild(caption);
  section.append(heading, player);
  return section;
}

function videoEmbedUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/embed/')) return url.toString();
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean).reverse().find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function renderVideo(section, video) {
  if (!section || !video?.url) return;
  const heading = section.querySelector('#lesson-video-heading');
  const player = section.querySelector('.lesson-video-placeholder');
  if (!player) return;
  const title = video.title || 'Lesson video';
  if (heading) heading.textContent = title;
  player.replaceChildren();
  const embed = videoEmbedUrl(video.url);
  if (embed) {
    const iframe = document.createElement('iframe');
    iframe.src = embed;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.aspectRatio = '16 / 9';
    iframe.style.border = '0';
    player.appendChild(iframe);
    return;
  }
  try {
    const url = new URL(video.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported video URL');
    const element = document.createElement('video');
    element.controls = true;
    element.preload = 'metadata';
    element.src = url.toString();
    element.style.width = '100%';
    element.setAttribute('aria-label', title);
    player.appendChild(element);
  } catch {
    const caption = document.createElement('div');
    caption.className = 'lesson-video-caption';
    caption.innerHTML = `<strong>${title}</strong><span>The saved video URL is not a supported http(s) media address.</span>`;
    player.appendChild(caption);
  }
}

function ensureStaticLessonVideoSlot() {
  const root = document.querySelector('.lesson-content-page');
  if (!root || root.querySelector('#lesson-video-heading')) return;
  const main = root.querySelector('.lesson-content-main');
  if (!main) return;
  main.appendChild(createVideoSection({
    title: 'Optional lesson video',
    message: 'This lesson has no video assigned yet. The lesson model supports an optional video independently for every lesson.',
  }));
}

function patchStaticPublishedLessonVideo() {
  const root = document.querySelector('.lesson-content-page');
  if (!root) return;
  const kicker = root.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = kicker.match(/Unit\s+(\d+)\s+·\s+Lesson\s+(\d+)/i);
  if (!match) return;
  const unitNumber = Number(match[1]);
  const lessonNumber = Number(match[2]);
  if (unitNumber < 1 || unitNumber > PILOT_BASE_UNIT_COUNT) return;
  const slug = query().get('course') || PILOT_COURSE_SLUG;
  if (slug !== PILOT_COURSE_SLUG) return;
  const live = getLiveCourseContent(slug);
  const unit = live?.units?.find((item) => item.id === `pilot-unit-${unitNumber}`);
  const video = unit?.lessons?.[lessonNumber - 1]?.video;
  if (!video?.url) return;
  let section = root.querySelector('#lesson-video-heading')?.closest('.lesson-content-block');
  if (!section) {
    const main = root.querySelector('.lesson-content-main');
    if (!main) return;
    section = createVideoSection({ title: video.title || 'Lesson video', message: 'Published lesson video.' });
    main.appendChild(section);
  }
  if (section.dataset.kan63PublishedVideo === video.url) return;
  section.dataset.kan63PublishedVideo = video.url;
  renderVideo(section, video);
}

function patchTeacherPublishedLessonVideo() {
  if (window.location.pathname !== '/learner') return;
  const root = document.querySelector('.learner-unit-page[data-cross-role-rendered]');
  if (!root || !root.querySelector('.lesson-content-status')) return;
  const kicker = root.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = kicker.match(/Unit\s+(\d+)\s+·\s+Lesson\s+(\d+)/i);
  if (!match) return;
  const unitNumber = Number(match[1]);
  if (unitNumber <= PILOT_BASE_UNIT_COUNT) return;
  const slug = query().get('course');
  const live = slug ? getLiveCourseContent(slug) : null;
  const unit = live?.units?.[unitNumber - PILOT_BASE_UNIT_COUNT - 1];
  const lesson = unit?.lessons?.[0];
  const main = root.querySelector('.lesson-content-main');
  if (!main || main.querySelector('[data-kan63-video-slot]')) return;
  const video = lesson?.video || (unit?.videoUrl ? { title: unit.videoTitle || 'Lesson video', url: unit.videoUrl } : null);
  const section = createVideoSection({
    title: video?.title || 'Optional lesson video',
    message: video ? 'Published lesson video.' : 'No video has been assigned to this teacher-published lesson.',
  });
  main.appendChild(section);
  if (video) renderVideo(section, video);
}

function scan() {
  patchFinalLessonQuiz();
  continueQuizHandoff();
  ensureStaticLessonVideoSlot();
  patchStaticPublishedLessonVideo();
  patchTeacherPublishedLessonVideo();
}

export default function LessonExperienceRefinementBridge() {
  useEffect(() => {
    let queued = false;
    function scheduleScan() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    }
    function captureTeacherUnitSave(event) {
      const button = event.target.closest?.('button');
      const root = button?.closest?.('.teacher-unit-editor-page');
      if (!button || !root || button.type !== 'submit') return;
      const courseSlug = query().get('course');
      if (!courseSlug) return;
      const snapshot = snapshotEnhancedUnit(root, courseSlug);
      if (!snapshot.title || !snapshot.description) return;
      window.setTimeout(() => {
        const after = query();
        if (after.get('course') === courseSlug && !after.get('unit')) stageUnitContent(courseSlug, snapshot);
      }, 20);
    }
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener('click', captureTeacherUnitSave, true);
    window.addEventListener('popstate', scheduleScan);
    window.addEventListener('bonsai:cross-role-content-changed', scheduleScan);
    scan();
    return () => {
      observer.disconnect();
      document.removeEventListener('click', captureTeacherUnitSave, true);
      window.removeEventListener('popstate', scheduleScan);
      window.removeEventListener('bonsai:cross-role-content-changed', scheduleScan);
    };
  }, []);
  return null;
}
