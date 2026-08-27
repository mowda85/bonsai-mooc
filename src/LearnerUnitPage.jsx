import { useState } from 'react';
import LearnerActivityPage, { UNIT_TWO_ACTIVITY_ID } from './LearnerActivityPage.jsx';
import LearnerQuizPage from './LearnerQuizPage.jsx';

const pilotUnits = [
  {
    title: 'Introduction to Data, Information and Knowledge',
    description: 'Build the shared vocabulary for data, information and knowledge used throughout the BONSAI pilot course.',
    lessons: ['Data', 'Information', 'Knowledge'],
  },
  {
    title: 'Information Systems in BONSAI',
    description: 'Explore the BONSAI information-system context and the pilot case study that connects information to the wider project.',
    lessons: ['BONSAI information system', 'BONSAI information-system case study'],
  },
  {
    title: 'Knowledge Dissemination in BONSAI',
    description: 'Focus on how knowledge is shared and disseminated within the BONSAI context.',
    lessons: ['Knowledge dissemination in BONSAI'],
  },
];

function getUnitStatus(unitNumber, completedUnits, totalUnits) {
  if (completedUnits.includes(unitNumber)) return 'Completed · Review';
  const nextUnitNumber = Array.from({ length: totalUnits }, (_, index) => index + 1).find((number) => !completedUnits.includes(number));
  return unitNumber === nextUnitNumber ? 'Current · Continue' : 'Upcoming';
}

function LessonContentPage({ course, unit, unitNumber, lessonNumber, onBack, onNavigateLesson }) {
  const lesson = unit.lessons[lessonNumber - 1];
  const previousLesson = lessonNumber > 1 ? lessonNumber - 1 : null;
  const nextLesson = lessonNumber < unit.lessons.length ? lessonNumber + 1 : null;

  return (
    <main className="lesson-content-page">
      <section className="lesson-content-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner lesson breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Lesson {lessonNumber}</strong>
        </div>
        <div className="lesson-content-hero-grid">
          <div>
            <div className="lesson-content-badges"><span className="pill">Learner lesson</span><span className="lesson-content-status">KAN-24 content shell</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Lesson {lessonNumber} of {unit.lessons.length}</span>
            <h1>{lesson}</h1>
            <p>This page demonstrates the four lesson-content types required by the prototype without inventing teaching material that has not yet been supplied.</p>
          </div>
          <aside className="lesson-content-summary" aria-label={`Lesson ${lessonNumber} summary`}>
            <div><span>Course</span><strong>{course?.title}</strong></div>
            <div><span>Unit</span><strong>{unit.title}</strong></div>
            <div><span>Lesson</span><strong>{lessonNumber} of {unit.lessons.length}</strong></div>
            <div><span>Content types</span><strong>Text · Image · Video · Download</strong></div>
          </aside>
        </div>
      </section>

      <section className="lesson-content-body">
        <div className="lesson-content-main">
          <section className="lesson-content-block lesson-text-block" aria-labelledby="lesson-text-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">T</span><div><span className="section-kicker">Text content</span><h2 id="lesson-text-heading">Lesson text placeholder</h2></div></div>
            <div className="lesson-text-placeholder">
              <strong>Instructional text will appear here.</strong>
              <p>This block verifies the layout for headings, paragraphs and structured lesson text. Final teaching content will be supplied in KAN-45.</p>
              <div className="lesson-placeholder-lines" aria-hidden="true"><span /><span /><span className="short" /></div>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-image-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">▧</span><div><span className="section-kicker">Image content</span><h2 id="lesson-image-heading">Responsive image placeholder</h2></div></div>
            <div className="lesson-image-placeholder" role="img" aria-label="Placeholder for the final lesson image to be supplied in KAN-46">
              <div className="lesson-image-symbol" aria-hidden="true">▧</div>
              <strong>Lesson image placeholder</strong>
              <span>Final visual content will be supplied in KAN-46.</span>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-video-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">▶</span><div><span className="section-kicker">Video content</span><h2 id="lesson-video-heading">Video player placeholder</h2></div></div>
            <div className="lesson-video-placeholder" aria-label="Placeholder video player for future lesson video">
              <button className="lesson-video-play" type="button" aria-label="Placeholder play control" onClick={() => {}}>▶</button>
              <div className="lesson-video-caption"><strong>Video content placeholder</strong><span>Final lesson video will be supplied in KAN-47.</span></div>
              <div className="lesson-video-controls" aria-hidden="true"><span className="lesson-video-progress"><b /></span><span>0:00</span><span>⚙</span><span>⛶</span></div>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-download-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">↓</span><div><span className="section-kicker">Downloadable document</span><h2 id="lesson-download-heading">Lesson resource placeholder</h2></div></div>
            <div className="lesson-download-card">
              <div className="lesson-download-file-icon" aria-hidden="true">DOC</div>
              <div><strong>BONSAI lesson resource placeholder</strong><p>This non-instructional file only verifies the download interaction. Final downloadable teaching material will be supplied in KAN-48.</p><span>TXT · Prototype placeholder</span></div>
              <a className="button button-primary" href="/lesson-resource-placeholder.txt" download>Download placeholder ↓</a>
            </div>
          </section>
        </div>

        <aside className="lesson-content-side-panel">
          <span className="section-kicker">Lesson position</span>
          <h2>Lesson {lessonNumber} of {unit.lessons.length}</h2>
          <p>{lesson}</p>
          <div className="lesson-content-type-list"><span>✓ Text shell</span><span>✓ Image shell</span><span>✓ Video shell</span><span>✓ Download shell</span></div>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </section>

      <nav className="lesson-content-navigation" aria-label="Lesson navigation">
        <button className="button button-outline" type="button" disabled={!previousLesson} onClick={() => previousLesson && onNavigateLesson(previousLesson)}>← {previousLesson ? `Previous Lesson · ${previousLesson}` : 'Previous Lesson'}</button>
        <button className="button button-outline" type="button" onClick={onBack}>Unit {unitNumber} overview</button>
        <button className="button button-primary" type="button" disabled={!nextLesson} onClick={() => nextLesson && onNavigateLesson(nextLesson)}>{nextLesson ? `Next Lesson · ${nextLesson}` : 'Final Lesson'} →</button>
      </nav>
    </main>
  );
}

export default function LearnerUnitPage({
  course,
  unitNumber,
  completedUnits = [],
  completedActivityIds = [],
  onCompleteActivity,
  onCompleteUnit,
  onQuizSubmitted,
  onBack,
  onOpenUnit,
}) {
  const [activeLessonIndex, setActiveLessonIndex] = useState(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const unit = pilotUnits[unitNumber - 1];
  const totalUnits = pilotUnits.length;
  const activityComplete = completedActivityIds.includes(UNIT_TWO_ACTIVITY_ID);
  const unitComplete = completedUnits.includes(unitNumber);

  function openLesson(index) {
    setActivityOpen(false);
    setQuizOpen(false);
    setActiveLessonIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openActivity() {
    setActiveLessonIndex(null);
    setQuizOpen(false);
    setActivityOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openQuiz() {
    setActiveLessonIndex(null);
    setActivityOpen(false);
    setQuizOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToUnit() {
    setActiveLessonIndex(null);
    setActivityOpen(false);
    setQuizOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!unit) {
    return (
      <main className="learner-unit-page">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to course overview</button>
        <section className="learner-unit-empty"><h1>Unit unavailable</h1><p>This unit has not been supplied for the prototype.</p></section>
      </main>
    );
  }

  if (quizOpen && unitNumber === 1) {
    return <LearnerQuizPage course={course} unitTitle={unit.title} unitNumber={unitNumber} onBack={backToUnit} onQuizSubmitted={onQuizSubmitted} />;
  }

  if (activityOpen && unitNumber === 2) {
    return (
      <LearnerActivityPage
        course={course}
        unitTitle={unit.title}
        unitNumber={unitNumber}
        completed={activityComplete}
        onBack={backToUnit}
        onComplete={onCompleteActivity}
      />
    );
  }

  if (activeLessonIndex !== null) {
    return (
      <LessonContentPage
        course={course}
        unit={unit}
        unitNumber={unitNumber}
        lessonNumber={activeLessonIndex + 1}
        onBack={backToUnit}
        onNavigateLesson={(lessonNumber) => openLesson(lessonNumber - 1)}
      />
    );
  }

  const status = getUnitStatus(unitNumber, completedUnits, totalUnits);
  const coursePercent = totalUnits ? Math.round((completedUnits.length / totalUnits) * 100) : 0;
  const previousUnit = unitNumber > 1 ? unitNumber - 1 : null;
  const nextUnit = unitNumber < totalUnits ? unitNumber + 1 : null;

  return (
    <main className="learner-unit-page">
      <section className="learner-unit-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to course overview</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner unit breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><strong>Unit {unitNumber}</strong>
        </div>
        <div className="learner-unit-hero-grid">
          <div>
            <div className="learner-unit-badges"><span className="pill">Learner unit</span><span className={`learner-unit-status-pill ${status.startsWith('Completed') ? 'learner-unit-status-complete' : status.startsWith('Current') ? 'learner-unit-status-current' : ''}`}>{status}</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} of {totalUnits}</span>
            <h1>{unit.title}</h1>
            <p>{unit.description}</p>
          </div>
          <aside className="learner-unit-summary" aria-label={`Unit ${unitNumber} summary`}>
            <div><span>Course</span><strong>{course?.title}</strong></div>
            <div><span>Lessons</span><strong>{unit.lessons.length}</strong></div>
            <div><span>Unit status</span><strong>{status}</strong></div>
            <div><span>Course progress</span><strong>{completedUnits.length} of {totalUnits} units · {coursePercent}%</strong></div>
          </aside>
        </div>
      </section>

      <section className="learner-unit-body">
        <div className="learner-unit-main">
          <section className="learner-unit-intro">
            <span className="section-kicker">Unit overview</span>
            <h2>What is in this unit?</h2>
            <p>{unit.description}</p>
          </section>

          <section className="learner-unit-lessons" aria-labelledby="learner-unit-lessons-heading">
            <div className="learner-unit-section-heading">
              <div><span className="section-kicker">Lessons</span><h2 id="learner-unit-lessons-heading">Unit {unitNumber} lessons</h2><p>Select a lesson to open its KAN-24 content page.</p></div>
              <span className="course-unit-count">{unit.lessons.length} lesson{unit.lessons.length === 1 ? '' : 's'}</span>
            </div>
            <div className="learner-lesson-list">
              {unit.lessons.map((lesson, index) => (
                <button className="learner-lesson-card" type="button" key={lesson} onClick={() => openLesson(index)}>
                  <span className="learner-lesson-number">{String(index + 1).padStart(2, '0')}</span>
                  <div><small>Lesson {index + 1}</small><strong>{lesson}</strong></div>
                  <span className="learner-lesson-action">Open lesson <b aria-hidden="true">→</b></span>
                </button>
              ))}
            </div>

            {unitNumber === 1 && (
              <section className="learner-unit-quiz" aria-labelledby="unit-quiz-heading">
                <div className="learner-unit-quiz-heading">
                  <div><span className="section-kicker">Quiz</span><h2 id="unit-quiz-heading">Unit 1 prototype quiz</h2><p>Test MCQ scoring, writing responses and the KAN-27 Results page. Final five questions remain KAN-50.</p></div>
                  <span className="learner-unit-quiz-badge">4 prototype questions</span>
                </div>
                <button className="learner-unit-quiz-card" type="button" onClick={openQuiz}>
                  <span className="learner-unit-quiz-icon" aria-hidden="true">?</span>
                  <div><small>Prototype quiz</small><strong>MCQ + short writing + project response</strong></div>
                  <span className="learner-unit-quiz-action">Open quiz <b aria-hidden="true">→</b></span>
                </button>
              </section>
            )}

            {unitNumber === 2 && (
              <section className="learner-unit-activity" aria-labelledby="unit-activity-heading">
                <div className="learner-unit-activity-heading">
                  <div><span className="section-kicker">Activity</span><h2 id="unit-activity-heading">Unit 2 submission activity</h2><p>Test the free-text submission workflow. Final instructional activity content will be integrated separately.</p></div>
                  <span className={`learner-unit-activity-badge ${activityComplete ? 'learner-unit-activity-badge-done' : ''}`}>{activityComplete ? '✓ Completed' : 'To complete'}</span>
                </div>
                <button className="learner-unit-activity-card" type="button" onClick={openActivity}>
                  <span className="learner-unit-activity-icon" aria-hidden="true">✎</span>
                  <div><small>Prototype activity</small><strong>{activityComplete ? 'Submission recorded' : 'Instructions + free-text submission'}</strong></div>
                  <span className="learner-unit-activity-action">{activityComplete ? 'Review activity' : 'Open activity'} <b aria-hidden="true">→</b></span>
                </button>
              </section>
            )}
          </section>
        </div>

        <aside className="learner-unit-side-panel">
          <span className="section-kicker">Course position</span>
          <h2>Unit {unitNumber} of {totalUnits}</h2>
          <p>{status === 'Upcoming' ? 'This unit follows the current learning step and is available to preview in the prototype.' : status.startsWith('Completed') ? 'This unit is complete and remains available for review.' : 'This is the learner’s current unit.'}</p>
          <div className="learner-progress-track" aria-label={`Course ${coursePercent}% complete`}><span style={{ width: `${coursePercent}%` }} /></div>
          <strong className="learner-unit-course-percent">{coursePercent}% course complete</strong>
          <div className="learner-unit-completion-control">
            <span className="section-kicker">KAN-28 completion</span>
            <p>{unitComplete ? 'This unit is already counted in course progress.' : unitNumber === totalUnits ? 'Mark this final unit complete to finish the course when all other units are complete.' : 'Use this prototype action when you have finished this unit.'}</p>
            <button className={unitComplete ? 'button button-outline' : 'button button-primary'} type="button" disabled={unitComplete} onClick={() => !unitComplete && onCompleteUnit?.(unitNumber)}>{unitComplete ? '✓ Unit completed' : unitNumber === totalUnits ? 'Complete final unit →' : 'Mark Unit complete ✓'}</button>
          </div>
        </aside>
      </section>

      <nav className="learner-unit-navigation" aria-label="Unit navigation">
        <button className="button button-outline" type="button" disabled={!previousUnit} onClick={() => previousUnit && onOpenUnit(previousUnit)}>← {previousUnit ? `Previous Unit · ${previousUnit}` : 'Previous Unit'}</button>
        <button className="button button-outline" type="button" onClick={onBack}>Course overview</button>
        <button className="button button-primary" type="button" disabled={!nextUnit} onClick={() => nextUnit && onOpenUnit(nextUnit)}>{nextUnit ? `Next Unit · ${nextUnit}` : 'Final Unit'} →</button>
      </nav>
    </main>
  );
}
