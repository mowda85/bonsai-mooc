export default function LearnerQuizResultsPage({
  course,
  unitTitle,
  unitNumber = 1,
  score,
  mcqTotal,
  responseCount,
  totalQuestions,
  writtenResponseCount,
  onReviewQuiz,
  onBackToUnit,
  onNextUnit,
}) {
  const scorePercent = mcqTotal ? Math.round((score / mcqTotal) * 100) : 0;

  return (
    <main className="quiz-results-page">
      <section className="quiz-results-hero">
        <button className="back-link" type="button" onClick={onBackToUnit}>
          <span aria-hidden="true">←</span> Back to Unit {unitNumber}
        </button>
        <div className="learner-unit-breadcrumb" aria-label="Quiz results breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Quiz results</strong>
        </div>
        <div className="quiz-results-hero-grid">
          <div>
            <div className="learner-unit-badges">
              <span className="pill">Quiz results</span>
              <span className="quiz-results-status">Submitted</span>
            </div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Latest attempt</span>
            <h1>Your quiz results</h1>
            <p>The result below comes directly from the quiz attempt you just submitted. Only the multiple-choice questions are automatically scored in the current prototype.</p>
          </div>
          <aside className="quiz-results-score-card" aria-label={`Quiz score ${score} out of ${mcqTotal}`}>
            <span>Score</span>
            <strong>{score}/{mcqTotal}</strong>
            <b>{scorePercent}% of auto-scored questions</b>
          </aside>
        </div>
      </section>

      <section className="quiz-results-body">
        <div className="quiz-results-main">
          <section className="quiz-results-summary-card">
            <div className="quiz-results-section-heading">
              <div><span className="section-kicker">Attempt summary</span><h2>Submission received</h2></div>
              <span className="quiz-results-submitted-badge">✓ Submitted</span>
            </div>
            <div className="quiz-results-metrics">
              <div><span>MCQ score</span><strong>{score} / {mcqTotal}</strong><small>Scored automatically</small></div>
              <div><span>Total responses</span><strong>{responseCount} / {totalQuestions}</strong><small>All required responses submitted</small></div>
              <div><span>Written responses</span><strong>{writtenResponseCount}</strong><small>Submitted · not auto-scored</small></div>
              <div><span>Unit</span><strong>Unit {unitNumber}</strong><small>{unitTitle}</small></div>
            </div>
          </section>

          <section className="quiz-results-feedback-card" aria-labelledby="quiz-results-feedback-heading">
            <span className="section-kicker">Feedback / Comment</span>
            <h2 id="quiz-results-feedback-heading">Prototype feedback</h2>
            <div className="quiz-results-feedback-box">
              <strong>Automatic scoring is complete for the multiple-choice questions.</strong>
              <p>Your short-writing and project-style responses were submitted successfully but are not automatically scored in this prototype. No teacher-authored comment has been added.</p>
            </div>
          </section>

          <section className="quiz-results-next-card">
            <div><span className="section-kicker">Continue learning</span><h2>Ready for Unit {unitNumber + 1}?</h2><p>Continue directly to the next unit, or review the quiz attempt before moving on.</p></div>
            <button className="button button-primary" type="button" onClick={onNextUnit}>Next Unit · {unitNumber + 1} →</button>
          </section>
        </div>

        <aside className="quiz-results-side-panel">
          <span className="section-kicker">Quiz attempt</span>
          <h2>{course?.title}</h2>
          <p>{unitTitle}</p>
          <div className="quiz-results-side-score"><strong>{score}/{mcqTotal}</strong><span>MCQ score</span></div>
          <button className="button button-outline" type="button" onClick={onReviewQuiz}>Review Quiz</button>
          <button className="button button-outline" type="button" onClick={onBackToUnit}>Back to Unit {unitNumber}</button>
          <button className="button button-primary" type="button" onClick={onNextUnit}>Next Unit →</button>
        </aside>
      </section>
    </main>
  );
}
