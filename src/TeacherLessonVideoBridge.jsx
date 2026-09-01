import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getLiveCourseContent, getPendingCourseContent, stageUnitContent } from './crossRoleCourseStore.js';
import { prototypePublicationDefaults, registerCourseContentChange } from './coursePublicationStore.js';
import { mockTeacherPortfolio } from './TeacherDashboard.jsx';

const pilotUnits = {
  'pilot-unit-1': {
    title: 'Introduction to Data, Information & Knowledge',
    lessons: ['Data', 'Information', 'Knowledge'],
  },
  'pilot-unit-2': {
    title: 'Case Study — Information Systems in BONSAI',
    lessons: ['BONSAI information system', 'BONSAI information-system case study'],
  },
  'pilot-unit-3': {
    title: 'Knowledge Dissemination in BONSAI',
    lessons: ['Knowledge dissemination in BONSAI'],
  },
};

function locationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function teacherQuery() {
  return new URLSearchParams(window.location.search);
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'teacher-unit';
}

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validVideoUrl(value) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function knownCourseUnit(courseSlug, unitId) {
  const course = mockTeacherPortfolio.find((item) => item.slug === courseSlug);
  return course?.units?.find((unit) => unit.id === unitId) || null;
}

function storedUnit(courseSlug, unitId) {
  const pending = getPendingCourseContent(courseSlug)?.units?.find((unit) => unit.id === unitId);
  const live = getLiveCourseContent(courseSlug)?.units?.find((unit) => unit.id === unitId);
  return pending || live || null;
}

function lessonRows(courseSlug, unitId, unitTitle) {
  const stored = storedUnit(courseSlug, unitId);
  const pilot = pilotUnits[unitId];
  const known = knownCourseUnit(courseSlug, unitId);
  const baseLessons = stored?.lessons?.length
    ? stored.lessons
    : Array.isArray(known?.lessons) && known.lessons.length
      ? known.lessons
      : pilot?.lessons?.map((title, index) => ({ id: `${unitId}-lesson-${index + 1}`, title }))
        || [{ id: `${unitId}-lesson-1`, title: unitTitle || known?.title || 'Lesson 1' }];

  return baseLessons.map((lesson, index) => {
    const normalized = typeof lesson === 'string' ? { title: lesson } : lesson;
    return {
      id: normalized.id || `${unitId}-lesson-${index + 1}`,
      title: normalized.title || `Lesson ${index + 1}`,
      content: normalized.content || '',
      file: normalized.file || null,
      videoTitle: normalized.video?.title || '',
      videoUrl: normalized.video?.url || '',
    };
  });
}

function unitTitleFor(courseSlug, unitId) {
  return storedUnit(courseSlug, unitId)?.title
    || knownCourseUnit(courseSlug, unitId)?.title
    || pilotUnits[unitId]?.title
    || unitId.replaceAll('-', ' ');
}

function LessonVideoEditor({ courseSlug, unitId, onBack }) {
  const unitTitle = useMemo(() => unitTitleFor(courseSlug, unitId), [courseSlug, unitId]);
  const [lessons, setLessons] = useState(() => lessonRows(courseSlug, unitId, unitTitle));
  const [errors, setErrors] = useState([]);

  function updateLesson(index, field, value) {
    setLessons((current) => current.map((lesson, lessonIndex) => lessonIndex === index ? { ...lesson, [field]: value } : lesson));
    setErrors([]);
  }

  function save(event) {
    event.preventDefault();
    const invalid = lessons.filter((lesson) => !validVideoUrl(lesson.videoUrl));
    if (invalid.length) {
      setErrors(invalid.map((lesson) => `${lesson.title}: enter a valid http(s) video URL or leave it empty.`));
      return;
    }

    const existing = storedUnit(courseSlug, unitId) || knownCourseUnit(courseSlug, unitId) || {};
    const staged = {
      ...existing,
      id: unitId,
      title: existing.title || unitTitle,
      source: existing.source || 'teacher-published',
      courseSlug,
      lessons: lessons.map((lesson, index) => ({
        ...(Array.isArray(existing.lessons) && typeof existing.lessons[index] === 'object' ? existing.lessons[index] : {}),
        id: lesson.id,
        title: lesson.title,
        ...(lesson.content ? { content: lesson.content } : {}),
        ...(lesson.file ? { file: lesson.file } : {}),
        video: lesson.videoUrl.trim()
          ? { title: lesson.videoTitle.trim() || `${lesson.title} video`, url: lesson.videoUrl.trim() }
          : null,
      })),
    };

    stageUnitContent(courseSlug, staged);
    registerCourseContentChange(
      courseSlug,
      'Lesson video',
      `${unitTitle} · per-lesson video update`,
      prototypePublicationDefaults[courseSlug] || 'Draft',
    );
    onBack();
  }

  return (
    <main className="teacher-unit-editor-page teacher-lesson-video-editor-page">
      <section className="teacher-unit-editor-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{unitTitle}</span><b>/</b><strong>Lesson Videos</strong></div>
        <div className="teacher-unit-editor-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Lesson media</span><span className="teacher-kicker-badge">KAN-63</span></div>
            <h1>Add a video to any lesson</h1>
            <p>Each lesson has its own optional video field. Add, replace or remove a lesson video independently without changing the videos attached to other lessons.</p>
          </div>
          <aside><span>Unit</span><strong>{lessons.length} lesson{lessons.length === 1 ? '' : 's'}</strong><small>Video changes use the existing Draft → Review → Publication flow before becoming learner-visible.</small></aside>
        </div>
      </section>

      <form className="teacher-unit-editor-body teacher-lesson-video-body" onSubmit={save}>
        <section className="teacher-unit-form-card teacher-lesson-video-list">
          <div className="teacher-editor-card-heading"><div><span className="section-kicker">Per-lesson media</span><h2>{unitTitle}</h2></div><span className="teacher-required-note">Videos are optional</span></div>
          <p>Use a YouTube/Vimeo link or a direct http(s) video URL. Leaving a URL empty means that lesson has no assigned video.</p>

          {lessons.map((lesson, index) => (
            <section className="teacher-lesson-video-row" key={lesson.id}>
              <div className="teacher-lesson-video-heading"><span>{String(index + 1).padStart(2, '0')}</span><div><small>Lesson {index + 1}</small><strong>{lesson.title}</strong></div></div>
              <label className="teacher-editor-field"><span>Video title</span><input value={lesson.videoTitle} onChange={(event) => updateLesson(index, 'videoTitle', event.target.value)} placeholder={`${lesson.title} video`} /></label>
              <label className="teacher-editor-field"><span>Video URL</span><input type="url" value={lesson.videoUrl} onChange={(event) => updateLesson(index, 'videoUrl', event.target.value)} placeholder="https://example.com/video" /></label>
              <small className="teacher-lesson-video-state">{lesson.videoUrl.trim() ? 'Video configured for this lesson' : 'No video assigned to this lesson'}</small>
            </section>
          ))}
        </section>

        <aside className="teacher-unit-side-stack">
          <section className="teacher-unit-form-card">
            <span className="section-kicker">How it works</span>
            <h2>One video setting per lesson</h2>
            <p>The video metadata is stored on the individual lesson record, so every lesson can have a different video or no video at all.</p>
            <div className="teacher-unassigned-note"><strong>Publication-safe</strong><span>Saving stages a content revision. Learners continue to see the currently Published content until the normal review and publication workflow completes.</span></div>
          </section>

          <section className="teacher-unit-form-card teacher-unit-actions-card">
            <span className="section-kicker">Lesson media actions</span>
            <h2>Save video settings</h2>
            {errors.length > 0 && <div className="teacher-editor-errors" role="alert"><strong>Check the video URLs</strong>{errors.map((error) => <span key={error}>{error}</span>)}</div>}
            <div className="teacher-editor-actions"><button className="button button-primary" type="submit">Save Lesson Videos</button><button className="button button-outline" type="button" onClick={onBack}>Cancel</button></div>
          </section>
        </aside>
      </form>
    </main>
  );
}

export default function TeacherLessonVideoBridge() {
  const [, setRouteKey] = useState(locationKey);
  const [target, setTarget] = useState(null);
  const active = window.location.pathname === '/teacher' ? teacherQuery().get('media') : null;
  const courseSlug = window.location.pathname === '/teacher' ? teacherQuery().get('course') || '' : '';

  useEffect(() => {
    let queued = false;

    function injectButtons() {
      if (window.location.pathname !== '/teacher') return;
      const params = teacherQuery();
      const slug = params.get('course');
      if (!slug || params.get('media')) return;
      const course = mockTeacherPortfolio.find((item) => item.slug === slug);
      const rows = Array.from(document.querySelectorAll('.teacher-course-unit-row'));

      rows.forEach((row, index) => {
        const actions = row.querySelector('.teacher-course-unit-actions');
        if (!actions || actions.querySelector('[data-kan63-lesson-videos]')) return;
        const visibleTitle = row.querySelector('div > strong')?.textContent?.trim() || `Unit ${index + 1}`;
        const unitId = course?.units?.[index]?.id || slugify(visibleTitle);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'teacher-unit-lesson-video-link';
        button.dataset.kan63LessonVideos = 'true';
        button.textContent = 'Lesson Videos';
        button.addEventListener('click', () => navigate(`/teacher?media=${encodeURIComponent(unitId)}&course=${encodeURIComponent(slug)}`));
        actions.appendChild(button);
      });
    }

    function scan() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        const nextTarget = document.querySelector('.dashboard-placeholder');
        setTarget((current) => current === nextTarget ? current : nextTarget);
        setRouteKey(locationKey());
        injectButtons();
      });
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', scan);
    scan();
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scan);
    };
  }, []);

  useEffect(() => {
    if (!target) return undefined;
    target.classList.toggle('teacher-lesson-video-active', Boolean(active && courseSlug));
    return () => target?.classList.remove('teacher-lesson-video-active');
  }, [active, courseSlug, target]);

  if (!target || !active || !courseSlug) return null;
  return createPortal(
    <LessonVideoEditor courseSlug={courseSlug} unitId={active} onBack={() => navigate(`/teacher?course=${encodeURIComponent(courseSlug)}`)} />,
    target,
  );
}
