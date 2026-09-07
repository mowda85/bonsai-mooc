import { useState } from 'react';
import { getPrototypeActivity } from './prototypeActivityStore.js';

export const PILOT_SCENARIO_ACTIVITY_ID = 'pilot-scenario-response-activity';
export const UNIT_TWO_ACTIVITY_ID = PILOT_SCENARIO_ACTIVITY_ID;
export const PILOT_ACTIVITY_COMPLETION_KEY = 'bonsai-mooc.prototype.pilot-activity-completed.v1';

function saveActivityCompletion(courseSlug, unitNumber) {
  const record = { courseSlug, unitNumber, activityId: PILOT_SCENARIO_ACTIVITY_ID, completedAt: new Date().toISOString() };
  try {
    window.sessionStorage.setItem(PILOT_ACTIVITY_COMPLETION_KEY, JSON.stringify(record));
  } catch {
    // The in-memory learner state still records the completed activity.
  }
  window.dispatchEvent(new CustomEvent('bonsai:pilot-activity-completed', { detail: record }));
}

export default function LearnerActivityPage({ course, unitTitle, unitNumber, completed = false, onBack, onComplete }) {
  const [response, setResponse] = useState('');
  const [submittedNow, setSubmittedNow] = useState(false);
  const isComplete = completed || submittedNow;
  const canSubmit = response.trim().length > 0 && !isComplete;
  const configuredActivity = getPrototypeActivity(course?.slug, `pilot-unit-${unitNumber}`);
  const activityTitle = configuredActivity?.title || 'Flood-crisis scenario response';
  const activityInstructions = configuredActivity?.instructions || 'Interpret the evolving flood situation, identify priority information and stakeholders, and explain one response decision you would support.';
  const teacherConfigured = configuredActivity?.source === 'teacher';

  function submitActivity(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onComplete?.(PILOT_SCENARIO_ACTIVITY_ID);
    saveActivityCompletion(course?.slug, unitNumber);
    setSubmittedNow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="learner-activity-page">
      <section className="learner-activity-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner activity breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Scenario activity</strong>
        </div>
        <div className="learner-activity-hero-grid">
          <div>
            <div className="learner-activity-badges">
              <span className="pill">Flood crisis scenario</span>
              {teacherConfigured && <span className="learner-activity-status">Teacher configured</span>}
              <span className={`learner-activity-status ${isComplete ? 'learner-activity-status-done' : ''}`}>{isComplete ? '✓ Completed' : 'Required pilot activity'}</span>
            </div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Scenario activity</span>
            <h1>{activityTitle}</h1>
            <p>Use the course concepts to interpret an evolving flood situation and support a timely, coordinated response decision.</p>
          </div>
          <aside className="learner-activity-summary" aria-label="Activity summary">
            <div><span>Course</span><strong>{course?.title}</strong></div>
            <div><span>Unit</span><strong>{unitTitle}</strong></div>
            <div><span>Submission</span><strong>Free-text scenario response</strong></div>
            <div><span>Completion</span><strong>Required for Unit {unitNumber}</strong></div>
          </aside>
        </div>
      </section>

      <section className="learner-activity-body">
        <div className="learner-activity-main">
          {isComplete && (
            <div className="learner-activity-confirmation" role="status">
              <span aria-hidden="true">✓</span>
              <div><strong>Scenario response submitted</strong><p>This activity is now marked complete in your prototype learner progress for this session.</p></div>
            </div>
          )}

          <section className="learner-activity-card" aria-labelledby="activity-instructions-heading">
            <span className="section-kicker">Instructions</span>
            <h2 id="activity-instructions-heading">Interpret, coordinate and decide</h2>
            <p>{activityInstructions}</p>
            <div className="learner-activity-instruction-list">
              <div><span>1</span><p>Identify the most important information for situational awareness.</p></div>
              <div><span>2</span><p>Consider impacts, stakeholders and coordination needs.</p></div>
              <div><span>3</span><p>State and justify one immediate response decision.</p></div>
            </div>
          </section>

          <section className="learner-activity-card" aria-labelledby="activity-submission-heading">
            <span className="section-kicker">Your submission</span>
            <h2 id="activity-submission-heading">Scenario response</h2>
            <form className="learner-activity-form" onSubmit={submitActivity}>
              <label htmlFor="activity-response">Response</label>
              <textarea
                id="activity-response"
                rows="8"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder={isComplete ? 'Submission already recorded for this prototype session.' : 'Enter your flood-crisis scenario response…'}
                disabled={isComplete}
              />
              <div className="learner-activity-form-footer">
                <span>{isComplete ? 'Completed in this session' : response.trim() ? 'Ready to submit' : 'A response is required before submission.'}</span>
                <button className="button button-primary" type="submit" disabled={!canSubmit}>{isComplete ? 'Submitted ✓' : 'Submit scenario response →'}</button>
              </div>
            </form>
          </section>
        </div>

        <aside className="learner-activity-side-panel">
          <span className="section-kicker">Activity status</span>
          <h2>{isComplete ? 'Completed' : 'Ready when you are'}</h2>
          <p>{isComplete ? 'Your scenario response has been recorded for this prototype session.' : 'Complete the scenario response before Unit 3 can be marked complete.'}</p>
          <div className={`learner-activity-status-card ${isComplete ? 'learner-activity-status-card-done' : ''}`}>
            <span aria-hidden="true">{isComplete ? '✓' : '○'}</span>
            <div><strong>{isComplete ? 'Submission recorded' : 'Not submitted'}</strong><small>{isComplete ? 'Scenario activity complete' : 'Free-text response required'}</small></div>
          </div>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </section>
    </main>
  );
}
