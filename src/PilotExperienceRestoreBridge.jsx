import { useEffect } from 'react';
import { PILOT_COURSE_SLUG, PILOT_COURSE_TITLE } from './courseArchitecture.js';

const QUIZ_COMPLETION_KEY = 'bonsai-mooc.prototype.pilot-quiz-completed.v1';
const ACTIVITY_COMPLETION_KEY = 'bonsai-mooc.prototype.pilot-activity-completed.v1';

function readCompletion(key) {
  try {
    const record = JSON.parse(window.sessionStorage.getItem(key) || 'null');
    return record?.courseSlug === PILOT_COURSE_SLUG ? record : null;
  } catch {
    return null;
  }
}

function replaceText(element, from, to) {
  if (!element || !element.textContent.includes(from)) return;
  element.textContent = element.textContent.replaceAll(from, to);
}

function patchPublicRecognition() {
  document.querySelectorAll('.category-v2-course-award span').forEach((element) => {
    const completed = element.closest('.category-v2-course-card')?.classList.contains('is-complete');
    element.textContent = completed ? '✓ Course badge earned' : 'Course badge';
  });

  const heroSummary = document.querySelector('.category-v2-hero-summary p');
  if (heroSummary) heroSummary.innerHTML = '<b>Course completion</b> → Course Badge<br><b>Whole Category</b> → Specialist Certificate';

  const ladder = document.querySelector('.category-v2-certificate-ladder');
  if (ladder) {
    const intro = ladder.querySelector(':scope > div:first-child p');
    if (intro) intro.textContent = 'Finish an individual course to earn its Course Badge. Finish all courses in one Category to earn the Category’s Specialist Certificate.';
    const firstStep = ladder.querySelector('.category-v2-ladder-step:not(.specialist)');
    if (firstStep) {
      const strong = firstStep.querySelector('strong');
      const small = firstStep.querySelector('small');
      if (strong) strong.textContent = 'Course Badge';
      if (small) small.textContent = 'Awarded per completed course';
    }
  }

  const courseDetail = document.querySelector('.category-v2-course-detail');
  if (courseDetail) {
    const earnedChip = courseDetail.querySelector('.category-v2-earned-chip');
    if (earnedChip) earnedChip.textContent = '✓ Course badge earned';
    courseDetail.querySelectorAll('.category-v2-mini-stats span').forEach((item) => {
      if (/course certificate/i.test(item.textContent || '')) item.innerHTML = '<b>Course badge</b> on completion';
    });
    const started = courseDetail.querySelector('.category-v2-started');
    started?.querySelectorAll('b').forEach((item) => {
      if (/course certificate/i.test(item.textContent || '')) item.textContent = 'Course badge earned';
    });
    const side = courseDetail.querySelector('.category-v2-course-side');
    if (side) {
      const heading = side.querySelector('h2');
      if (heading && /course certificate/i.test(heading.textContent || '')) heading.textContent = `BONSAI Course Badge — ${courseDetail.querySelector('.category-v2-subhero h1')?.textContent || 'Course'}`;
      const paragraph = side.querySelector('h2 + p');
      if (paragraph) paragraph.textContent = 'Complete this individual course to earn its Course Badge. Specialist Certificates are reserved for full Category completion.';
    }
  }

  const categoryDashboard = document.querySelector('.category-v2-learner-dashboard');
  if (categoryDashboard) {
    const stats = categoryDashboard.querySelectorAll('.category-v2-dashboard-stats article');
    if (stats[0]) {
      const label = stats[0].querySelector('span');
      const small = stats[0].querySelector('small');
      if (label) label.textContent = 'Course badges';
      if (small) small.textContent = 'one per completed course';
    }
    const achievements = categoryDashboard.querySelector('.category-v2-achievements');
    if (achievements) {
      const heading = achievements.querySelector('h2');
      if (heading) heading.textContent = 'Badges & Specialist Certificates';
      achievements.querySelectorAll('.category-v2-achievement-list article:not(.specialist)').forEach((card) => {
        const label = card.querySelector('span');
        const strong = card.querySelector('strong');
        if (label) label.textContent = 'Course badge';
        if (strong) strong.textContent = strong.textContent.replace('Course Certificate', 'Course Badge');
      });
      const empty = achievements.querySelector('.category-v2-empty');
      if (empty) {
        const strong = empty.querySelector('strong');
        const p = empty.querySelector('p');
        if (strong) strong.textContent = 'No course badges yet';
        if (p) p.textContent = 'Complete any BONSAI course to earn your first Course Badge.';
      }
    }
  }
}

function patchAuthenticatedRecognition() {
  const dashboard = document.querySelector('.learner-dashboard-page');
  if (dashboard) {
    const stats = dashboard.querySelectorAll('.learner-overview-stat');
    stats.forEach((stat) => {
      const label = stat.querySelector('span');
      if (label?.textContent === 'Course certificates') label.textContent = 'Course badges';
    });
    const achievementSection = dashboard.querySelector('.learner-achievements-section');
    if (achievementSection) {
      const heading = achievementSection.querySelector('h2');
      const intro = achievementSection.querySelector('.learner-section-heading p');
      if (heading) heading.textContent = 'Badges & Specialist Certificates';
      if (intro) intro.textContent = 'Each completed course earns a Course Badge. Completing every course in one Category earns a Specialist Certificate.';
      achievementSection.querySelectorAll('.learner-certificate-card').forEach((card) => {
        const label = card.querySelector('span');
        const strong = card.querySelector('strong');
        if (label?.textContent === 'Course certificate') {
          label.textContent = 'Course badge';
          if (strong) strong.textContent = strong.textContent.replace('Course Certificate', 'Course Badge');
          const button = card.querySelector('button');
          if (button) button.textContent = 'View badge →';
        }
      });
      const empty = achievementSection.querySelector('.learner-empty-achievement');
      if (empty) {
        const strong = empty.querySelector('strong');
        const p = empty.querySelector('p');
        if (strong) strong.textContent = 'No badges earned yet';
        if (p) p.textContent = 'Complete any BONSAI course to earn your first Course Badge.';
      }
    }
    dashboard.querySelectorAll('button').forEach((button) => replaceText(button, 'View completion & certificate', 'View completion & badge'));
  }

  const overview = document.querySelector('.learner-course-overview-page');
  if (overview) {
    overview.querySelectorAll('button').forEach((button) => replaceText(button, 'View completion & certificate', 'View completion & badge'));
    overview.querySelectorAll('p').forEach((p) => replaceText(p, 'course certificate', 'course badge'));
    injectAssessmentPanel(overview);
  }
}

function clickWhenAvailable(selector, attempt = 0) {
  const element = document.querySelector(selector);
  if (element) {
    element.click();
    return;
  }
  if (attempt < 15) window.setTimeout(() => clickWhenAvailable(selector, attempt + 1), 60);
}

function openUnitAndThen(unitIndex, targetSelector) {
  const rows = document.querySelectorAll('.learner-unit-status-card');
  const button = rows[unitIndex - 1]?.querySelector('button');
  if (!button) return;
  button.click();
  window.setTimeout(() => clickWhenAvailable(targetSelector), 60);
}

function injectAssessmentPanel(overview) {
  if (overview.dataset.kan68AssessmentPanel === 'true') return;
  if (overview.querySelector('h1')?.textContent?.trim() !== PILOT_COURSE_TITLE) return;
  const main = overview.querySelector('.learner-course-overview-main');
  const structure = Array.from(main?.querySelectorAll('.learner-enrolled-course-section') || []).find((section) => /Units and progress/i.test(section.querySelector('h2')?.textContent || ''));
  if (!main || !structure) return;

  const panel = document.createElement('section');
  panel.className = 'learner-enrolled-course-section';
  panel.dataset.kan68AssessmentPanel = 'true';
  panel.innerHTML = '<span class="section-kicker">Assessment & practice</span><h2>Required pilot components</h2><p>The pilot includes a five-question knowledge check in Unit 1 and an evolving flood-situation scenario activity in Unit 3. These are part of the course-completion flow.</p><div class="current-course-actions"><button class="button button-primary" type="button" data-kan68-open-quiz>Open knowledge check →</button><button class="button button-outline" type="button" data-kan68-open-activity>Open scenario activity →</button></div>';
  panel.querySelector('[data-kan68-open-quiz]')?.addEventListener('click', () => openUnitAndThen(1, '.learner-unit-quiz-card'));
  panel.querySelector('[data-kan68-open-activity]')?.addEventListener('click', () => openUnitAndThen(3, '.learner-unit-activity-card'));
  structure.parentNode.insertBefore(panel, structure);
  overview.dataset.kan68AssessmentPanel = 'true';
}

function patchUnitRequirements() {
  const unitPage = document.querySelector('.learner-unit-page');
  if (!unitPage || unitPage.querySelector('.lesson-content-page')) return;
  const kicker = unitPage.querySelector('.learner-unit-kicker')?.textContent || '';
  const match = kicker.match(/Unit\s+(\d+)\s+of/i);
  if (!match) return;
  const unitNumber = Number(match[1]);
  const primary = unitPage.querySelector('.learner-unit-side-panel .button.button-primary');
  if (!primary || /Unit complete/i.test(primary.textContent || '')) return;

  const quizComplete = Boolean(readCompletion(QUIZ_COMPLETION_KEY));
  const activityComplete = Boolean(readCompletion(ACTIVITY_COMPLETION_KEY));
  let requirement = '';
  if (unitNumber === 1 && !quizComplete) requirement = 'Complete the knowledge check before marking Unit 1 complete.';
  if (unitNumber === 3 && !activityComplete) requirement = 'Submit the scenario activity before marking Unit 3 complete.';

  let note = unitPage.querySelector('[data-kan68-unit-requirement]');
  if (requirement) {
    primary.disabled = true;
    primary.textContent = unitNumber === 1 ? 'Complete quiz to finish Unit 1' : 'Complete activity to finish Unit 3';
    if (!note) {
      note = document.createElement('p');
      note.dataset.kan68UnitRequirement = 'true';
      note.style.marginTop = '10px';
      primary.insertAdjacentElement('afterend', note);
    }
    note.textContent = requirement;
  } else {
    primary.disabled = false;
    primary.textContent = 'Mark unit complete';
    note?.remove();
  }

  const lessonsSection = unitPage.querySelector('.learner-unit-lessons');
  const lessonList = lessonsSection?.querySelector('.learner-lesson-list');
  const assessment = unitNumber === 1 ? lessonsSection?.querySelector('.learner-unit-quiz') : unitNumber === 3 ? lessonsSection?.querySelector('.learner-unit-activity') : null;
  if (lessonsSection && lessonList && assessment && assessment.nextElementSibling !== lessonList) lessonsSection.insertBefore(assessment, lessonList);
}

function patchAll() {
  patchPublicRecognition();
  patchAuthenticatedRecognition();
  patchUnitRequirements();
}

export default function PilotExperienceRestoreBridge() {
  useEffect(() => {
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
    window.addEventListener('bonsai:category-achievements-changed', scan);
    window.addEventListener('bonsai:pilot-quiz-completed', scan);
    window.addEventListener('bonsai:pilot-activity-completed', scan);
    scan();

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scan);
      window.removeEventListener('bonsai:category-achievements-changed', scan);
      window.removeEventListener('bonsai:pilot-quiz-completed', scan);
      window.removeEventListener('bonsai:pilot-activity-completed', scan);
    };
  }, []);
  return null;
}
