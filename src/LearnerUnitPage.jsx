import { useState } from 'react';

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

function LearnerLessonPlaceholder({ course, unit, unitNumber, lesson, lessonNumber, onBack }) {
  return (
    <main className="learner-lesson-placeholder-page">
      <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
      <section className="learner-lesson-placeholder-card">
        <div className="learner-unit-breadcrumb" aria-label="Learner lesson breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Lesson {lessonNumber}</strong>
        </div>
        <span className="pill">KAN-24 · Lesson Content placeholder</span>
        <span className="learner-unit-kicker">Unit {unitNumber} · Lesson {lessonNumber}</span>
        <h1>{lesson}</h1>
        <p>The lesson destination is connected, but the full lesson-content experience belongs to KAN-24. This placeholder intentionally does not invent teaching material that has not been supplied.</p>
        <div className="learner-lesson-placeholder-meta">
          <div><span>Course</span><strong>{course?.title}</strong></div>
          <div><span>Unit</span><strong>{unit.title}</strong></div>
          <div><span>Next task</span><strong>KAN-24 · Lesson content</strong></div>
        </div>
        <button className="button button-primary" type="button" onClick={onBack}>Return to Unit {unitNumber}</button>
      </section>
    </main>
  );
}

export default function LearnerUnitPage({ course, unitNumber, completedUnits = [], onBack, onOpenUnit }) {
  const [activeLessonIndex, setActiveLessonIndex] = useState(null);
  const unit = pilotUnits[unitNumber - 1];
  const totalUnits = pilotUnits.length;

  if (!unit) {
    return (
      <main className="learner-unit-page">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to course overview</button>
        <section className="learner-unit-empty"><h1>Unit unavailable</h1><p>This unit has not been supplied for the prototype.</p></section>
      </main>
    );
  }

  if (activeLessonIndex !== null) {
    return (
      <LearnerLessonPlaceholder
        course={course}
        unit={unit}
        unitNumber={unitNumber}
        lesson={unit.lessons[activeLessonIndex]}
        lessonNumber={activeLessonIndex + 1}
        onBack={() => setActiveLessonIndex(null)}
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
              <div><span className="section-kicker">Lessons</span><h2 id="learner-unit-lessons-heading">Unit {unitNumber} lessons</h2><p>Select a lesson to open its KAN-24 content placeholder.</p></div>
              <span className="course-unit-count">{unit.lessons.length} lesson{unit.lessons.length === 1 ? '' : 's'}</span>
            </div>
            <div className="learner-lesson-list">
              {unit.lessons.map((lesson, index) => (
                <button className="learner-lesson-card" type="button" key={lesson} onClick={() => setActiveLessonIndex(index)}>
                  <span className="learner-lesson-number">{String(index + 1).padStart(2, '0')}</span>
                  <div><small>Lesson {index + 1}</small><strong>{lesson}</strong></div>
                  <span className="learner-lesson-action">Open lesson <b aria-hidden="true">→</b></span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="learner-unit-side-panel">
          <span className="section-kicker">Course position</span>
          <h2>Unit {unitNumber} of {totalUnits}</h2>
          <p>{status === 'Upcoming' ? 'This unit follows the current learning step and is available to preview in the prototype.' : status.startsWith('Completed') ? 'This unit is complete and remains available for review.' : 'This is the learner’s current unit.'}</p>
          <div className="learner-progress-track" aria-label={`Course ${coursePercent}% complete`}><span style={{ width: `${coursePercent}%` }} /></div>
          <strong className="learner-unit-course-percent">{coursePercent}% course complete</strong>
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
