import { useState } from 'react';
import { getCourseFeedback, saveCourseFeedback } from './feedbackStore.js';

export default function LearnerCompletionPage({ user, course, progress, quizResult, certificate, onCourseOverview, onDashboard }) {
  const totalUnits = progress.totalUnits || 0;
  const completedUnits = progress.completedUnits?.length || 0;
  const scoreLabel = quizResult ? `${quizResult.score} / ${quizResult.mcqTotal}` : 'Not recorded';
  const existingFeedback = getCourseFeedback(user?.id, course?.slug);
  const [feedbackText, setFeedbackText] = useState(existingFeedback?.comment || '');
  const [feedbackRecord, setFeedbackRecord] = useState(existingFeedback);
  const [feedbackError, setFeedbackError] = useState('');

  function submitFeedback(event) {
    event.preventDefault();
    const comment = feedbackText.trim();
    if (!comment) {
      setFeedbackError('Enter a comment before submitting feedback.');
      return;
    }

    const saved = saveCourseFeedback({
      learnerId: user?.id,
      learnerName: user?.name,
      courseSlug: course?.slug,
      courseTitle: course?.title,
      comment,
    });

    setFeedbackRecord(saved);
    setFeedbackText(saved?.comment || comment);
    setFeedbackError('');
  }

  return (
    <main className="learner-completion-page">
      <section className="completion-hero">
        <button className="back-link" type="button" onClick={onCourseOverview}><span aria-hidden="true">←</span> Back to course overview</button>
        <div className="learner-unit-breadcrumb" aria-label="Course completion breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><strong>Completion</strong>
        </div>
        <div className="completion-hero-grid">
          <div>
            <div className="completion-badges"><span className="pill">Course completion</span><span className="completion-status">✓ Completed</span></div>
            <span className="learner-unit-kicker">BONSAI pilot course</span>
            <h1>Course completed</h1>
            <p>You have completed every unit currently included in <strong>{course?.title}</strong>.</p>
            <div className="completion-actions">
              <button className="button button-primary" type="button" onClick={onDashboard}>Return to learner dashboard →</button>
              <button className="button button-outline" type="button" onClick={onCourseOverview}>Review course</button>
            </div>
          </div>
          <aside className="completion-summary" aria-label="Course completion summary">
            <div><span>Course status</span><strong>Completed</strong></div>
            <div><span>Progress</span><strong>{completedUnits} of {totalUnits} units · 100%</strong></div>
            <div><span>Final MCQ score</span><strong>{scoreLabel}</strong></div>
            <div><span>Certificate</span><strong>{certificate ? 'Earned' : 'Pending'}</strong></div>
          </aside>
        </div>
      </section>

      <section className="completion-body">
        <div className="completion-main">
          <section className="completion-card completion-score-card">
            <span className="section-kicker">Final score summary</span>
            <div className="completion-score-row">
              <div><h2>{quizResult ? `Score: ${quizResult.score}/${quizResult.mcqTotal}` : 'No quiz score recorded'}</h2><p>{quizResult ? 'This score comes from the MCQ portion of the quiz submitted during this prototype session.' : 'No quiz attempt was submitted in this prototype session, so the Completion page does not invent a score.'}</p></div>
              <strong>{quizResult ? `${Math.round((quizResult.score / quizResult.mcqTotal) * 100)}%` : '—'}</strong>
            </div>
            <div className="completion-score-notes">
              <span>✓ Course units: {completedUnits}/{totalUnits} complete</span>
              <span>{quizResult ? `✓ Auto-scored MCQs: ${quizResult.mcqTotal}` : '○ Quiz result not available in this session'}</span>
              <span>Written/project responses are not automatically scored.</span>
            </div>
          </section>

          <section className="completion-card" aria-labelledby="certificate-heading">
            <div className="completion-section-heading"><div><span className="section-kicker">Certificate</span><h2 id="certificate-heading">Course completion certificate</h2></div><span className="completion-earned-badge">✓ Earned</span></div>
            {certificate && (
              <div className="certificate-preview">
                <div className="certificate-brand"><img src="/bonsai-logo.webp" alt="" aria-hidden="true" /><div><strong>BONSAI-MOOC</strong><span>Prototype course completion certificate</span></div></div>
                <span className="certificate-kicker">Certificate of Completion</span>
                <p>This prototype certificate records that</p>
                <h3>{user?.name}</h3>
                <p>completed the BONSAI-MOOC course</p>
                <h4>{course?.title}</h4>
                <div className="certificate-meta"><span>Course status</span><strong>Completed · 100%</strong></div>
                <small>Prototype record only. No accreditation, grade, signature or external credential is claimed.</small>
              </div>
            )}
            <div className="certificate-record"><span>Certificate name</span><strong>{certificate?.name}</strong><p>{certificate?.source}</p></div>
          </section>

          <section className="completion-card completion-feedback-card" aria-labelledby="feedback-heading">
            <div className="completion-section-heading">
              <div><span className="section-kicker">Feedback / Comment</span><h2 id="feedback-heading">Share feedback on this course</h2><p>Your latest comment is kept for this prototype session and will be available to the later teacher feedback and progress views.</p></div>
              {feedbackRecord && <span className="completion-earned-badge">✓ Submitted</span>}
            </div>
            <form className="completion-feedback-form" onSubmit={submitFeedback}>
              <label htmlFor="course-feedback">Your comment</label>
              <textarea
                id="course-feedback"
                rows="7"
                value={feedbackText}
                onChange={(event) => { setFeedbackText(event.target.value); setFeedbackError(''); }}
                placeholder="Tell the BONSAI teaching team what worked well or what could be improved…"
              />
              {feedbackError && <div className="completion-feedback-error" role="alert">{feedbackError}</div>}
              {feedbackRecord && <div className="completion-feedback-success" role="status"><strong>Feedback submitted.</strong><span>You can edit the comment above and submit again to update this same-session record.</span></div>}
              <div className="completion-feedback-actions">
                <span>{feedbackText.trim().length} characters</span>
                <button className="button button-primary" type="submit">{feedbackRecord ? 'Update feedback' : 'Submit feedback'} →</button>
              </div>
            </form>
          </section>
        </div>

        <aside className="completion-side-panel">
          <span className="section-kicker">What next?</span>
          <h2>Your certificate is now on the dashboard</h2>
          <p>The Certificates count and list update immediately for this prototype session.</p>
          <button className="button button-primary" type="button" onClick={onDashboard}>View dashboard certificate →</button>
          <button className="button button-outline" type="button" onClick={onCourseOverview}>Course overview</button>
        </aside>
      </section>
    </main>
  );
}
