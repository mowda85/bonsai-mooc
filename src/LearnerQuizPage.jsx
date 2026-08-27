import { useMemo, useState } from 'react';
import LearnerQuizResultsPage from './LearnerQuizResultsPage.jsx';

const prototypeQuestions = [
  {
    id: 'q1',
    type: 'mcq',
    label: 'Multiple choice',
    prompt: 'In the established Unit 1 lesson sequence, which lesson follows Data?',
    options: ['Information', 'Knowledge', 'BONSAI information system'],
    answer: 'Information',
  },
  {
    id: 'q2',
    type: 'mcq',
    label: 'Multiple choice',
    prompt: 'Which established Unit 1 lesson appears third?',
    options: ['Data', 'Information', 'Knowledge'],
    answer: 'Knowledge',
  },
  {
    id: 'q3',
    type: 'short',
    label: 'Short writing',
    prompt: 'Prototype short-response field',
    helper: 'Enter a short response to test this answer type. Final instructional wording will be supplied in KAN-50.',
  },
  {
    id: 'q4',
    type: 'project',
    label: 'Project-style response',
    prompt: 'Prototype extended-response field',
    helper: 'Enter a longer response to test the project-style answer area. Final instructional wording will be supplied in KAN-50.',
  },
];

function isAnswered(question, value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export default function LearnerQuizPage({ course, unitTitle, unitNumber = 1, onBack, onQuizSubmitted }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationMessage, setValidationMessage] = useState('');
  const [result, setResult] = useState(null);
  const question = prototypeQuestions[activeIndex];
  const answeredCount = useMemo(() => prototypeQuestions.filter((item) => isAnswered(item, answers[item.id])).length, [answers]);
  const allAnswered = answeredCount === prototypeQuestions.length;

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
      const firstMissing = prototypeQuestions.findIndex((item) => !isAnswered(item, answers[item.id]));
      setValidationMessage(`Answer every question before submitting. Question ${firstMissing + 1} still needs a response.`);
      setActiveIndex(firstMissing);
      return;
    }

    const mcqs = prototypeQuestions.filter((item) => item.type === 'mcq');
    const score = mcqs.reduce((total, item) => total + (answers[item.id] === item.answer ? 1 : 0), 0);
    const writtenResponseCount = prototypeQuestions.filter((item) => item.type !== 'mcq' && isAnswered(item, answers[item.id])).length;
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

  if (result) {
    return (
      <LearnerQuizResultsPage
        course={course}
        unitTitle={unitTitle}
        unitNumber={unitNumber}
        score={result.score}
        mcqTotal={result.mcqTotal}
        responseCount={result.responseCount}
        totalQuestions={prototypeQuestions.length}
        writtenResponseCount={result.writtenResponseCount}
        onReviewQuiz={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onBackToUnit={onBack}
        onNextUnit={goToNextUnit}
      />
    );
  }

  return (
    <main className="learner-quiz-page">
      <section className="learner-quiz-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Unit {unitNumber}</button>
        <div className="learner-unit-breadcrumb" aria-label="Learner quiz breadcrumb">
          <span>Learner dashboard</span><b>/</b><span>{course?.title}</span><b>/</b><span>Unit {unitNumber}</span><b>/</b><strong>Quiz</strong>
        </div>
        <div className="learner-quiz-hero-grid">
          <div>
            <div className="learner-unit-badges"><span className="pill">Learner quiz</span><span className="learner-unit-status-pill learner-unit-status-current">KAN-26 prototype</span></div>
            <span className="learner-unit-kicker">Unit {unitNumber} · Prototype quiz</span>
            <h1>Quiz interaction</h1>
            <p>The final five instructional questions belong to KAN-50. This page demonstrates the quiz mechanics, answer types and client-side MCQ scoring.</p>
          </div>
          <aside className="learner-quiz-summary">
            <div><span>Questions</span><strong>{prototypeQuestions.length}</strong></div>
            <div><span>Answered</span><strong>{answeredCount} / {prototypeQuestions.length}</strong></div>
            <div><span>Auto-scored</span><strong>MCQ only</strong></div>
            <div><span>Next step</span><strong>Quiz Results</strong></div>
          </aside>
        </div>
      </section>

      <form className="learner-quiz-body" onSubmit={submitQuiz}>
        <section className="learner-quiz-card">
          <div className="learner-quiz-progress-heading">
            <div><span className="section-kicker">{question.label}</span><h2>Question {activeIndex + 1} of {prototypeQuestions.length}</h2></div>
            <strong>{Math.round(((activeIndex + 1) / prototypeQuestions.length) * 100)}%</strong>
          </div>
          <div className="learner-progress-track" aria-label={`Quiz question ${activeIndex + 1} of ${prototypeQuestions.length}`}><span style={{ width: `${((activeIndex + 1) / prototypeQuestions.length) * 100}%` }} /></div>

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
                <label htmlFor="quiz-short-response">Short response</label>
                <textarea id="quiz-short-response" rows="5" value={answers[question.id] || ''} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter a short prototype response…" />
              </div>
            )}

            {question.type === 'project' && (
              <div className="quiz-writing-field quiz-project-field">
                <label htmlFor="quiz-project-response">Project-style response</label>
                <textarea id="quiz-project-response" rows="9" value={answers[question.id] || ''} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter a longer prototype response…" />
                <small>This response is collected for the prototype but is not automatically scored.</small>
              </div>
            )}
          </div>

          {validationMessage && <div className="quiz-validation" role="alert">{validationMessage}</div>}

          <div className="learner-quiz-question-nav">
            <button className="button button-outline" type="button" disabled={activeIndex === 0} onClick={() => goToQuestion(activeIndex - 1)}>← Previous Question</button>
            {activeIndex < prototypeQuestions.length - 1 ? (
              <button className="button button-primary" type="button" onClick={() => goToQuestion(activeIndex + 1)}>Next Question →</button>
            ) : (
              <button className="button button-primary" type="submit" disabled={!allAnswered}>Submit Quiz →</button>
            )}
          </div>
        </section>

        <aside className="learner-quiz-side-panel">
          <span className="section-kicker">Quiz progress</span>
          <h2>{answeredCount} of {prototypeQuestions.length} answered</h2>
          <div className="quiz-question-dots">
            {prototypeQuestions.map((item, index) => (
              <button key={item.id} type="button" className={`${index === activeIndex ? 'active' : ''} ${isAnswered(item, answers[item.id]) ? 'answered' : ''}`} onClick={() => goToQuestion(index)} aria-label={`Go to question ${index + 1}`}>{index + 1}</button>
            ))}
          </div>
          <p>All questions require a response before final submission. Only the two prototype MCQs are automatically scored.</p>
          <button className="button button-outline" type="button" onClick={onBack}>Back to Unit {unitNumber}</button>
        </aside>
      </form>
    </main>
  );
}
