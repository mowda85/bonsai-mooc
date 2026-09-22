import LearnerActivityPage, { PILOT_SCENARIO_ACTIVITY_ID } from './LearnerActivityPage.jsx';
import LearnerQuizPage from './LearnerQuizPage.jsx';
import { PILOT_COURSE_UNITS } from './courseArchitecture.js';

function unitDescription(unitNumber) {
  if (unitNumber === 1) return 'Build the core crisis-management foundation: emergency response, preparedness, readiness, leadership, situational awareness and decision-making.';
  if (unitNumber === 2) return 'Explore flood maps, temporal forecasting, physics-based and AI methods, plus ANN structure, training, validation, testing and generalisation.';
  return 'Apply communication, stakeholder coordination and scenario-based thinking to evolving flood situations, impacts, response choices, recovery and long-term resilience.';
}

function getUnitStatus(unitNumber, completedUnits) {
  if (completedUnits.includes(unitNumber)) return 'Completed · Review';
  return 'Available';
}

function assessmentForUnit(unitNumber) {
  if (unitNumber === 1) return { type: 'quiz', marker: 'Q', label: 'Required knowledge check' };
  if (unitNumber === 2) return { type: 'quiz', marker: 'Q', label: 'Practice knowledge check' };
  if (unitNumber === 3) return { type: 'activity', marker: 'A', label: 'Scenario activity' };
  return null;
}

function CourseOutlineSidebar({
  course,
  units,
  activeUnitNumber,
  activeLessonNumber = null,
  activeAssessment = null,
  completedUnits = [],
  onCourseOverview,
  onOpenUnit,
  onOpenLesson,
  onOpenAssessment,
}) {
  return (
    <aside className="pilot-course-outline" aria-label="Course units, lessons and assessments">
      <div className="pilot-course-outline-header">
        <span className="section-kicker">Course contents</span>
        <strong>{course?.title || 'BONSAI pilot course'}</strong>
        <small>{completedUnits.length} of {units.length} units complete</small>
        <button type="button" className="pilot-outline-overview-button" onClick={onCourseOverview}>Units overview</button>
      </div>
      <div className="pilot-course-outline-units">
        {units.map((outlineUnit, unitIndex) => {
          const outlineUnitNumber = unitIndex + 1;
          const unitActive = outlineUnitNumber === activeUnitNumber;
          const completed = completedUnits.includes(outlineUnitNumber);
          const assessment = assessmentForUnit(outlineUnitNumber);
          const overviewCurrent = unitActive && !activeLessonNumber && !activeAssessment;
          return (
            <details
              className={`pilot-outline-unit ${unitActive ? 'is-active' : ''} ${completed ? 'is-complete' : ''}`}
              key={outlineUnit.id || outlineUnit.title}
              open={unitActive}
            >
              <summary className="pilot-outline-unit-header">
                <span>{completed ? '✓' : outlineUnitNumber}</span>
                <div><small>Unit {outlineUnitNumber}</small><strong>{outlineUnit.title}</strong></div>
                <b className="pilot-outline-chevron" aria-hidden="true">⌄</b>
              </summary>
              <div className="pilot-outline-items">
                <button
                  type="button"
                  className={`pilot-outline-item pilot-outline-overview-item ${overviewCurrent ? 'is-current' : ''}`}
                  onClick={() => onOpenUnit(outlineUnitNumber)}
                  aria-current={overviewCurrent ? 'page' : undefined}
                >
                  <span className="pilot-outline-item-marker">U</span>
                  <span><small>Unit</small><strong>Unit overview</strong></span>
                </button>
                {outlineUnit.lessons.map((lesson, lessonIndex) => {
                  const lessonNumber = lessonIndex + 1;
                  const current = unitActive && activeLessonNumber === lessonNumber && !activeAssessment;
                  return (
                    <button
                      type="button"
                      className={`pilot-outline-item ${current ? 'is-current' : ''}`}
                      key={`${outlineUnitNumber}-lesson-${lessonNumber}`}
                      onClick={() => onOpenLesson(outlineUnitNumber, lessonNumber)}
                      aria-current={current ? 'page' : undefined}
                    >
                      <span className="pilot-outline-item-marker">{lessonNumber}</span>
                      <span><small>Lesson {lessonNumber}</small><strong>{lesson}</strong></span>
                    </button>
                  );
                })}
                {assessment && (
                  <button
                    type="button"
                    className={`pilot-outline-item pilot-outline-assessment ${unitActive && activeAssessment === assessment.type ? 'is-current' : ''}`}
                    onClick={() => onOpenAssessment(outlineUnitNumber, assessment.type)}
                    aria-current={unitActive && activeAssessment === assessment.type ? 'page' : undefined}
                  >
                    <span className="pilot-outline-item-marker">{assessment.marker}</span>
                    <span><small>{assessment.type === 'quiz' ? 'Quiz' : 'Activity'}</small><strong>{assessment.label}</strong></span>
                  </button>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </aside>
  );
}

function LessonContentPage({ course, unit, unitNumber, lessonNumber, onBack, onNavigateLesson, onOpenQuiz, onOpenActivity, onOpenNextUnit }) {
  const lesson = unit.lessons[lessonNumber - 1];
  const previousLesson = lessonNumber > 1 ? lessonNumber - 1 : null;
  const nextLesson = lessonNumber < unit.lessons.length ? lessonNumber + 1 : null;
  const finalLesson = !nextLesson;
  const hasQuiz = unitNumber === 1 || unitNumber === 2;
  const hasActivity = unitNumber === 3;

  return (
    <main className="lesson-content-page">
      <section className="lesson-content-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner lesson breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Lesson {lessonNumber}</strong>
        </div>
        <div className="lesson-content-hero-grid">
          <div>
            <div className="lesson-content-badges"><span className="pill">Flood crisis pilot lesson</span><span className="lesson-content-status">Pilot content</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Lesson {lessonNumber} of {unit.lessons.length}</span>
            <h1>{lesson}</h1>
            <p>Study this lesson in the context of an evolving flood crisis in an estuarine or flood-prone area.</p>
          </div>
          <aside className="lesson-content-summary" aria-label={`Lesson ${lessonNumber} summary`}>
            <div><span>Course</span><strong>{course?.title}</strong></div>
            <div><span>Unit</span><strong>{unit.title}</strong></div>
            <div><span>Lesson</span><strong>{lessonNumber} of {unit.lessons.length}</strong></div>
            <div><span>Pilot approach</span><strong>Text · visual · scenario support</strong></div>
          </aside>
        </div>
      </section>

      <section className="lesson-content-body">
        <div className="lesson-content-main">
          <section className="lesson-content-block lesson-text-block" aria-labelledby="lesson-text-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">T</span><div><span className="section-kicker">Lesson content</span><h2 id="lesson-text-heading">{lesson}</h2></div></div>
            <div className="lesson-text-placeholder">
              <strong>{lesson}</strong>
              <p>The integrated pilot lesson content will appear here.</p>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-image-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">▧</span><div><span className="section-kicker">Visual support</span><h2 id="lesson-image-heading">Flood crisis visual</h2></div></div>
            <div className="lesson-image-placeholder" role="img" aria-label="Flood crisis learning visual placeholder">
              <div className="lesson-image-symbol" aria-hidden="true">▧</div>
              <strong>Flood crisis visual</strong>
              <span>Relevant pilot visual content appears here when supplied for this lesson.</span>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-video-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">▶</span><div><span className="section-kicker">Video support</span><h2 id="lesson-video-heading">Flood crisis video</h2></div></div>
            <div className="lesson-video-placeholder" aria-label="Flood crisis prototype video player">
              <button className="lesson-video-play" type="button" aria-label="Prototype play control" onClick={() => {}}>▶</button>
              <div className="lesson-video-caption"><strong>Prototype video</strong><span>Video content is integrated only where supplied for the pilot lesson.</span></div>
              <div className="lesson-video-controls" aria-hidden="true"><span className="lesson-video-progress"><b /></span><span>0:00</span><span>Transcript</span></div>
            </div>
          </section>

          <section className="lesson-content-block" aria-labelledby="lesson-download-heading">
            <div className="lesson-content-block-heading"><span className="lesson-type-icon">↓</span><div><span className="section-kicker">Practical resource</span><h2 id="lesson-download-heading">Flood crisis response resource</h2></div></div>
            <div className="lesson-download-card">
              <div className="lesson-download-file-icon" aria-hidden="true">DOC</div>
              <div><strong>Flood crisis resource</strong><p>Downloadable material appears here when supplied for this pilot lesson.</p><span>Prototype resource</span></div>
              <button className="button button-primary" type="button" disabled>Resource pending</button>
            </div>
          </section>
        </div>

        <aside className="lesson-content-side-panel">
          <span className="section-kicker">Lesson position</span>
          <h2>Lesson {lessonNumber} of {unit.lessons.length}</h2>
          <p>{lesson}</p>
          <div className="lesson-content-type-list"><span>✓ Flood crisis lesson</span></div>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </section>

      <nav className="lesson-content-navigation" aria-label="Lesson navigation">
        <button className="button button-outline" type="button" disabled={!previousLesson} onClick={() => previousLesson && onNavigateLesson(previousLesson)}>← {previousLesson ? `Previous Lesson · ${previousLesson}` : 'Previous Lesson'}</button>
        <button className="button button-outline" type="button" onClick={onBack}>Unit {unitNumber} overview</button>
        {nextLesson ? (
          <button className="button button-primary" type="button" onClick={() => onNavigateLesson(nextLesson)}>Next Lesson · {nextLesson} →</button>
        ) : hasQuiz ? (
          <div className="lesson-final-actions" data-native-final-actions="true">
            <button className="button button-outline" type="button" onClick={onOpenQuiz}>Go to quiz →</button>
            {onOpenNextUnit && <button className="button button-primary" type="button" onClick={onOpenNextUnit}>Next Unit · {unitNumber + 1} →</button>}
          </div>
        ) : hasActivity ? (
          <div className="lesson-final-actions" data-native-final-actions="true">
            <button className="button button-primary" type="button" onClick={onOpenActivity}>Go to scenario activity →</button>
          </div>
        ) : (
          <button className="button button-primary" type="button" disabled>Final Lesson</button>
        )}
      </nav>
    </main>
  );
}

export default function LearnerUnitPage({
  course,
  unitNumber,
  initialLessonNumber = null,
  initialAssessment = null,
  completedUnits = [],
  completedActivityIds = [],
  onCompleteActivity,
  onCompleteUnit,
  onQuizSubmitted,
  onBack,
  onOpenUnit,
}) {
  const activeLessonIndex = initialLessonNumber ? Math.max(0, initialLessonNumber - 1) : null;
  const activityOpen = initialAssessment === 'activity';
  const quizOpen = initialAssessment === 'quiz';
  const units = course?.pilot && Array.isArray(course.units) && course.units.length ? course.units : PILOT_COURSE_UNITS;
  const unit = units[unitNumber - 1];
  const totalUnits = units.length;
  const activityComplete = completedActivityIds.includes(PILOT_SCENARIO_ACTIVITY_ID);
  const unitComplete = completedUnits.includes(unitNumber);

  function openLesson(index) {
    onOpenUnit(unitNumber, { lessonNumber: index + 1 });
  }

  function openActivity() {
    onOpenUnit(unitNumber, { assessment: 'activity' });
  }

  function openQuiz() {
    onOpenUnit(unitNumber, { assessment: 'quiz' });
  }

  function backToUnit() {
    onOpenUnit(unitNumber);
  }

  function openOutlineUnit(targetUnitNumber) {
    onOpenUnit(targetUnitNumber);
  }

  function openOutlineLesson(targetUnitNumber, targetLessonNumber) {
    onOpenUnit(targetUnitNumber, { lessonNumber: targetLessonNumber });
  }

  function openOutlineAssessment(targetUnitNumber, assessmentType) {
    onOpenUnit(targetUnitNumber, { assessment: assessmentType });
  }

  function renderWithOutline(content, active = {}) {
    return (
      <div className="learner-course-workspace">
        <CourseOutlineSidebar
          course={course}
          units={units}
          activeUnitNumber={unitNumber}
          activeLessonNumber={active.lessonNumber ?? null}
          activeAssessment={active.assessment ?? null}
          completedUnits={completedUnits}
          onCourseOverview={onBack}
          onOpenUnit={openOutlineUnit}
          onOpenLesson={openOutlineLesson}
          onOpenAssessment={openOutlineAssessment}
        />
        <div className="learner-course-workspace-content">{content}</div>
      </div>
    );
  }

  if (!unit) {
    return (
      <main className="learner-unit-page">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to course overview</button>
        <section className="learner-unit-empty"><h1>Unit unavailable</h1><p>This unit is not part of the current pilot structure.</p></section>
      </main>
    );
  }

  if (quizOpen && (unitNumber === 1 || unitNumber === 2)) {
    return renderWithOutline(
      <LearnerQuizPage course={course} unitTitle={unit.title} unitNumber={unitNumber} onBack={backToUnit} onQuizSubmitted={onQuizSubmitted} />,
      { assessment: 'quiz' },
    );
  }

  if (activityOpen && unitNumber === 3) {
    return renderWithOutline(
      <LearnerActivityPage
        course={course}
        unitTitle={unit.title}
        unitNumber={unitNumber}
        completed={activityComplete}
        onBack={backToUnit}
        onComplete={onCompleteActivity}
      />,
      { assessment: 'activity' },
    );
  }

  if (activeLessonIndex !== null) {
    const activeLessonNumber = activeLessonIndex + 1;
    const nextUnitNumber = unitNumber < totalUnits ? unitNumber + 1 : null;
    return renderWithOutline(
      <LessonContentPage
        course={course}
        unit={unit}
        unitNumber={unitNumber}
        lessonNumber={activeLessonNumber}
        onBack={backToUnit}
        onNavigateLesson={(lessonNumber) => openLesson(lessonNumber - 1)}
        onOpenQuiz={openQuiz}
        onOpenActivity={openActivity}
        onOpenNextUnit={nextUnitNumber ? () => onOpenUnit(nextUnitNumber) : null}
      />,
      { lessonNumber: activeLessonNumber },
    );
  }

  const status = getUnitStatus(unitNumber, completedUnits);
  const coursePercent = totalUnits ? Math.round((completedUnits.length / totalUnits) * 100) : 0;
  const previousUnit = unitNumber > 1 ? unitNumber - 1 : null;
  const nextUnit = unitNumber < totalUnits ? unitNumber + 1 : null;

  return renderWithOutline((
    <main className="learner-unit-page">
      <section className="learner-unit-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to course overview</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner unit breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><strong>Unit {unitNumber}</strong>
        </div>
        <div className="learner-unit-hero-grid">
          <div>
            <div className="learner-unit-badges"><span className="pill">Flood crisis pilot unit</span><span className={`learner-unit-status-pill ${status.startsWith('Completed') ? 'learner-unit-status-complete' : 'learner-unit-status-current'}`}>{status}</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} of {totalUnits}</span>
            <h1>{unit.title}</h1>
            <p>{unitDescription(unitNumber)}</p>
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
            <p>{unitDescription(unitNumber)}</p>
          </section>

          <section className="learner-unit-lessons" aria-labelledby="learner-unit-lessons-heading">
            <div className="learner-unit-section-heading">
              <div><span className="section-kicker">Lessons</span><h2 id="learner-unit-lessons-heading">Unit {unitNumber} lessons</h2><p>Select any lesson to open the pilot learning content. Units are not locked by sequence unless a dependency is explicitly configured.</p></div>
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
                  <div><span className="section-kicker">Knowledge check</span><h2 id="unit-quiz-heading">Flood crisis management knowledge check</h2><p>Test the key ideas from the fundamentals unit with five multiple-choice questions.</p></div>
                  <span className="learner-unit-quiz-badge">5 questions</span>
                </div>
                <button className="learner-unit-quiz-card" type="button" onClick={openQuiz}>
                  <span className="learner-unit-quiz-icon" aria-hidden="true">Q</span>
                  <div><small>Pilot quiz</small><strong>Crisis management, situational awareness and forecasting</strong></div>
                  <span className="learner-unit-quiz-action">Open quiz <b aria-hidden="true">→</b></span>
                </button>
              </section>
            )}

            {unitNumber === 2 && (
              <section className="learner-unit-quiz" aria-labelledby="unit-2-quiz-heading">
                <div className="learner-unit-quiz-heading">
                  <div>
                    <span className="section-kicker">Knowledge check</span>
                    <h2 id="unit-2-quiz-heading">Flood forecasting &amp; ANN knowledge check</h2>
                    <p>Check the main ideas from the Unit 2 theory and supplied Urban Flood Forecasting lecture with seven multiple-choice questions.</p>
                  </div>
                  <span className="learner-unit-quiz-badge">7 questions</span>
                </div>
                <button className="learner-unit-quiz-card" type="button" onClick={openQuiz}>
                  <span className="learner-unit-quiz-icon" aria-hidden="true">Q</span>
                  <div>
                    <small>Unit 2 practice quiz</small>
                    <strong>Forecast lead time, ANN structure, training and evaluation</strong>
                  </div>
                  <span className="learner-unit-quiz-action">Open quiz <b aria-hidden="true">→</b></span>
                </button>
              </section>
            )}

            {unitNumber === 3 && (
              <section className="learner-unit-activity" aria-labelledby="unit-activity-heading">
                <div className="learner-unit-activity-heading">
                  <div><span className="section-kicker">Scenario activity</span><h2 id="unit-activity-heading">Evolving flood situation — response decision exercise</h2><p>Interpret an evolving flood situation, coordinate relevant stakeholders and justify a response decision.</p></div>
                  <span className={`learner-unit-activity-badge ${activityComplete ? 'learner-unit-activity-badge-done' : ''}`}>{activityComplete ? '✓ Completed' : 'To complete'}</span>
                </div>
                <button className="learner-unit-activity-card" type="button" onClick={openActivity}>
                  <span className="learner-unit-activity-icon" aria-hidden="true">✎</span>
                  <div><small>Scenario exercise</small><strong>{activityComplete ? 'Submission recorded' : 'Situational awareness + coordination + response decision'}</strong></div>
                  <span className="learner-unit-activity-action">{activityComplete ? 'Review activity' : 'Open activity'} <b aria-hidden="true">→</b></span>
                </button>
              </section>
            )}
          </section>
        </div>

        <aside className="learner-unit-side-panel">
          <span className="section-kicker">Course progress</span>
          <h2>{coursePercent}% complete</h2>
          <p>{completedUnits.length} of {totalUnits} units are marked complete.</p>
          <div className="learner-progress-track"><span style={{ width: `${coursePercent}%` }} /></div>
          <button className="button button-primary" type="button" disabled={unitComplete} onClick={() => !unitComplete && onCompleteUnit(unitNumber)}>{unitComplete ? 'Unit complete ✓' : 'Mark unit complete'}</button>
          <button className="button button-outline" type="button" onClick={onBack}>Back to course overview</button>
        </aside>
      </section>

      <nav className="learner-unit-navigation" aria-label="Unit navigation">
        <button className="button button-outline" type="button" disabled={!previousUnit} onClick={() => previousUnit && onOpenUnit(previousUnit)}>← {previousUnit ? `Previous Unit · ${previousUnit}` : 'Previous Unit'}</button>
        <button className="button button-outline" type="button" onClick={onBack}>Course overview</button>
        <button className="button button-primary" type="button" disabled={!nextUnit} onClick={() => nextUnit && onOpenUnit(nextUnit)}>{nextUnit ? `Next Unit · ${nextUnit}` : 'Final Unit'} →</button>
      </nav>
    </main>
  ));
}
