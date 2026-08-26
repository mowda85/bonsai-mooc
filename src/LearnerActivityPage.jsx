import { useState } from 'react';

export const UNIT_TWO_ACTIVITY_ID = 'unit-2-prototype-activity';

export default function LearnerActivityPage({ course, unitTitle, unitNumber, completed = false, onBack, onComplete }) {
  const [response, setResponse] = useState('');
  const [submittedNow, setSubmittedNow] = useState(false);
  const isComplete = completed || submittedNow;
  const canSubmit = response.trim().length > 0 && !isComplete;

  function submitActivity(event) {
    event.preventDefault();
    if (!canSubmit) return;
    onComplete?.(UNIT_TWO_ACTIVITY_ID);
    setSubmittedNow(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="learner-activity-page">
      <section className="learner-activity-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner activity breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Activity</strong>
        </div>
        <div className="learner-activity-hero-grid">
          <div>
            <div className="learner-activity-badges">
              <span className="pill">Learner activity</span>
              <span className={`learner-activity-status ${isComplete ? 'learner-activity-status-done' : ''}`}>{isComplete ? '✓ Completed' : 'To complete'}</span>
            </div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Activity</span>
            <h1>Prototype submission activity</h1>
            <p>This activity demonstrates the learner submission workflow. The final BONSAI learning prompt will be added during activity-content integration.</p>
          </div>
          <aside className="learner-activity-summary" aria-label="Activity summary">
            <div><span>Course</span><strong>{course?.title}</strong></div>
            <div><span>Unit</span><strong>{unitTitle}</strong></div>
            <div><span>Submission</span><strong>Free-text response</strong></div>
            <div><span>Status</span><strong>{isComplete ? 'Completed' : 'Not submitted'}</strong></div>
          </aside>
        </div>
      </section>

      <section className="learner-activity-body">
        <div className="learner-activity-main">
          {isComplete && (
            <div className="learner-activity-confirmation" role="status">
              <span aria-hidden="true">✓</span>
              <div><strong>Activity submitted</strong><p>This activity is now marked complete in the prototype learner-progress state for this session.</p></div>
            </div>
          )}

          <section className="learner-activity-card" aria-labelledby="activity-instructions-heading">
            <span className="section-kicker">Instructions</span>
            <h2 id="activity-instructions-heading">Test the submission workflow</h2>
            <p>Enter a short response in the field below and submit it. This prototype checks the submission interaction only; the final instructional prompt belongs to the later activity-content task.</p>
            <div className="learner-activity-instruction-list">
              <div><span>1</span><p>Enter any short prototype response.</p></div>
              <div><span>2</span><p>Submit the response to mark the activity complete.</p></div>
              <div><span>3</span><p>Return to Unit {unitNumber} and confirm the completed state.</p></div>
            </div>
          </section>

          <section className="learner-activity-card" aria-labelledby="activity-submission-heading">
            <span className="section-kicker">Your submission</span>
            <h2 id="activity-submission-heading">Free-text response</h2>
            <form className="learner-activity-form" onSubmit={submitActivity}>
              <label htmlFor="activity-response">Response</label>
              <textarea
                id="activity-response"
                rows="8"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder={isComplete ? 'Submission already recorded for this prototype session.' : 'Enter a short prototype response…'}
                disabled={isComplete}
              />
              <div className="learner-activity-form-footer">
                <span>{isComplete ? 'Completed in this session' : response.trim() ? 'Ready to submit' : 'A response is required before submission.'}</span>
                <button className="button button-primary" type="submit" disabled={!canSubmit}>{isComplete ? 'Submitted ✓' : 'Submit activity →'}</button>
              </div>
            </form>
          </section>
        </div>

        <aside className="learner-activity-side-panel">
          <span className="section-kicker">Activity status</span>
          <h2>{isComplete ? 'Completed' : 'Ready when you are'}</h2>
          <p>{isComplete ? 'Your mock learner-progress state records this activity as done for the current session.' : 'Complete the free-text submission to mark this prototype activity as done.'}</p>
          <div className={`learner-activity-status-card ${isComplete ? 'learner-activity-status-card-done' : ''}`}>
            <span aria-hidden="true">{isComplete ? '✓' : '○'}</span>
            <div><strong>{isComplete ? 'Submission recorded' : 'Not submitted'}</strong><small>{isComplete ? 'Activity complete' : 'Free-text response required'}</small></div>
          </div>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </section>
    </main>
  );
}
