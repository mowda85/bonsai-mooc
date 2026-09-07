import { useMemo, useState } from 'react';
import LearnerQuizResultsPage from './LearnerQuizResultsPage.jsx';
import { getPrototypeQuiz } from './prototypeQuizStore.js';

function isAnswered(question, value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function questionTypeLabel(type) {
  if (type === 'mcq') return 'Multiple choice';
  if (type === 'short') return 'Short writing';
  return 'Scenario response';
}

export default function LearnerQuizPage({ course, unitTitle, unitNumber = 1, onBack, onQuizSubmitted }) {
  const quiz = useMemo(() => getPrototypeQuiz(course?.slug, `pilot-unit-${unitNumber}`), [course?.slug, unitNumber]);
  const questions = quiz?.questions || [];
  const teacherConfigured = quiz?.source === 'teacher';
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationMessage, setValidationMessage] = useState('');
  const [result, setResult] = useState(null);
  const question = questions[activeIndex];
  const answeredCount = useMemo(() => questions.filter((item) => isAnswered(item, answers[item.id])).length, [answers, questions]);
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  function setAnswer(value) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setValidationMessage('');
  }

  function goToQuestion(index) {
    setActiveIndex(index);
    setValidationMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submitQuiz(event) {
    event.preventDefault();
    if (!allAnswered) {
      const firstMissing = questions.findIndex((item) => !isAnswered(item, answers[item.id]));
      setValidationMessage(`Answer every question before submitting. Question ${firstMissing + 1} still needs a response.`);
      setActiveIndex(firstMissing);
      return;
    }

    const mcqs = questions.filter((item) => item.type === 'mcq');
    const score = mcqs.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0);
    const writtenResponseCount = questions.filter((item) => item.type !== 'mcq' && isAnswered(item, answers[item.id])).length;
    const submittedResult = {
      score,
      mcqTotal: mcqs.length,
      responseCount: answeredCount,
      writtenResponseCount,
    };
    setResult(submittedResult);
    onQuizSubmitted?.(submittedResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToNextUnit() {
    onBack();
    window.setTimeout(() => {
      const nextUnitButton = Array.from(document.querySelectorAll('.learner-unit-navigation button')).find((button) => button.textContent.includes('Next Unit') && !button.disabled);
      if (nextUnitButton) nextUnitButton.click();
    }, 50);
  }

  if (!question) {
    return (
      <main className="learner-quiz-page">
        <section className="learner-quiz-hero">
          <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
          <div className="learner-unit-breadcrumb"><span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Knowledge check</strong></div>
          <h1>Knowledge check unavailable</h1>
          <p>No questions are configured for this unit.</p>
        </section>
      </main>
    );
  }

  if (result) {
    return (
      <LearnerQuizResultsPage
        course={course}
        unitTitle={unitTitle}
        unitNumber={unitNumber}
        score={result.score}
        mcqTotal={result.mcqTotal}
        responseCount={result.responseCount}
        totalQuestions={questions.length}
        writtenResponseCount={result.writtenResponseCount}
        onReviewQuiz={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onBackToUnit={onBack}
        onNextUnit={goToNextUnit}
      />
    );
  }

  const mcqCount = questions.filter((item) => item.type === 'mcq').length;

  return (
    <main className="learner-quiz-page">
      <section className="learner-quiz-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner quiz breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Knowledge check</strong>
        </div>
        <div className="learner-quiz-hero-grid">
          <div>
            <div className="learner-unit-badges"><span className="pill">Flood crisis knowledge check</span>{teacherConfigured && <span className="learner-unit-status-pill learner-unit-status-current">Teacher configured</span>}<span className="learner-unit-status-pill learner-unit-status-current">Pilot assessment</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Knowledge check</span>
            <h1>Flood Crisis Management Knowledge Check</h1>
            <p>{teacherConfigured ? 'These questions were configured by the teacher for this course. Complete every question and submit to see the result.' : 'Check your understanding of crisis management, situational awareness, flood forecasting, flood-defence information and decision support.'}</p>
          </div>
          <aside className="learner-quiz-summary">
            <div><span>Questions</span><strong>{questions.length}</strong></div>
            <div><span>Answered</span><strong>{answeredCount} / {questions.length}</strong></div>
            <div><span>Auto-scored</span><strong>{mcqCount} MCQ{mcqCount === 1 ? '' : 's'}</strong></div>
            <div><span>Next step</span><strong>Results</strong></div>
          </aside>
        </div>
      </section>

      <form className="learner-quiz-body" onSubmit={submitQuiz}>
        <section className="learner-quiz-card">
          <div className="learner-quiz-progress-heading">
            <div><span className="section-kicker">{questionTypeLabel(question.type)}</span><h2>Question {activeIndex + 1} of {questions.length}</h2></div>
            <strong>{Math.round(((activeIndex + 1) / questions.length) * 100)}%</strong>
          </div>
          <div className="learner-progress-track" aria-label={`Quiz question ${activeIndex + 1} of ${questions.length}`}><span style={{ width: `${((activeIndex + 1) / questions.length) * 100}%` }} /></div>

          <div className="learner-quiz-question">
            <h3>{question.prompt}</h3>
            {question.helper && <p>{question.helper}</p>}

            {question.type === 'mcq' && (
              <fieldset className="quiz-options">
                <legend className="sr-only">Select one answer</legend>
                {question.options.map((option) => (
                  <label className={`quiz-option ${answers[question.id] === option ? 'quiz-option-selected' : ''}`} key={option}>
                    <input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswer(option)} />
                    <span>{option}</span>
                  </label>
                ))}
              </fieldset>
            )}

            {question.type === 'short' && (
              <div className="quiz-writing-field">
                <label htmlFor={`quiz-short-response-${question.id}`}>Short response</label>
                <textarea id={`quiz-short-response-${question.id}`} rows="5" value={answers[question.id] || ''} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter a short response…" />
                {!question.helper && <small>This response is required for submission but is not automatically scored.</small>}
              </div>
            )}

            {question.type === 'project' && (
              <div className="quiz-writing-field quiz-project-field">
                <label htmlFor={`quiz-project-response-${question.id}`}>Scenario response</label>
                <textarea id={`quiz-project-response-${question.id}`} rows="9" value={answers[question.id] || ''} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter a longer scenario response…" />
                <small>This response is collected for the prototype but is not automatically scored.</small>
              </div>
            )}
          </div>

          {validationMessage && <div className="quiz-validation" role="alert">{validationMessage}</div>}

          <div className="learner-quiz-question-nav">
            <button className="button button-outline" type="button" disabled={activeIndex === 0} onClick={() => goToQuestion(activeIndex - 1)}>← Previous Question</button>
            {activeIndex < questions.length - 1 ? (
              <button className="button button-primary" type="button" onClick={() => goToQuestion(activeIndex + 1)}>Next Question →</button>
            ) : (
              <button className="button button-primary" type="submit" disabled={!allAnswered}>Submit Knowledge Check →</button>
            )}
          </div>
        </section>

        <aside className="learner-quiz-side-panel">
          <span className="section-kicker">Knowledge check progress</span>
          <h2>{answeredCount} of {questions.length} answered</h2>
          <div className="quiz-question-dots">
            {questions.map((item, index) => (
              <button key={item.id} type="button" className={`${index === activeIndex ? 'active' : ''} ${isAnswered(item, answers[item.id]) ? 'answered' : ''}`} onClick={() => goToQuestion(index)} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>
            ))}
          </div>
          <p>All questions require a response before final submission. Multiple-choice questions are automatically scored.</p>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </form>
    </main>
  );
}
