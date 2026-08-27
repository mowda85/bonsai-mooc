import { useMemo, useRef, useState } from 'react';
import { getPrototypeQuiz } from './prototypeQuizStore.js';

const typeLabels = {
  mcq: 'Multiple choice',
  short: 'Short writing',
  project: 'Project-style response',
};

function newQuestionId() {
  return `teacher-q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyQuestion() {
  return { id: newQuestionId(), type: 'mcq', prompt: '', options: ['', ''], answer: '' };
}

function loadQuestions(courseSlug, unitId) {
  const quiz = getPrototypeQuiz(courseSlug, unitId);
  return quiz?.questions?.length ? quiz.questions : [];
}

export default function TeacherQuizEditor({ portfolio, initialCourseSlug, initialUnitId, onBack, onSave }) {
  const course = useMemo(() => portfolio.find((item) => item.slug === initialCourseSlug) || null, [initialCourseSlug, portfolio]);
  const units = course?.units || [];
  const resolvedInitialUnitId = units.some((unit) => unit.id === initialUnitId) ? initialUnitId : units[0]?.id || '';
  const [unitId, setUnitId] = useState(resolvedInitialUnitId);
  const [questions, setQuestions] = useState(() => loadQuestions(initialCourseSlug, resolvedInitialUnitId));
  const [errors, setErrors] = useState([]);
  const questionListRef = useRef(null);
  const selectedUnit = units.find((unit) => unit.id === unitId) || null;
  const existingQuiz = unitId ? getPrototypeQuiz(initialCourseSlug, unitId) : null;

  function changeUnit(nextUnitId) {
    setUnitId(nextUnitId);
    setQuestions(loadQuestions(initialCourseSlug, nextUnitId));
    setErrors([]);
  }

  function updateQuestion(index, patch) {
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question));
    setErrors([]);
  }

  function changeType(index, type) {
    updateQuestion(index, type === 'mcq'
      ? { type, options: ['', ''], answer: '' }
      : { type, options: undefined, answer: undefined });
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const oldValue = question.options?.[optionIndex] || '';
      const options = [...(question.options || [])];
      options[optionIndex] = value;
      return { ...question, options, answer: question.answer === oldValue ? value : question.answer };
    }));
    setErrors([]);
  }

  function addOption(questionIndex) {
    setQuestions((current) => current.map((question, index) => index === questionIndex ? { ...question, options: [...(question.options || []), ''] } : question));
  }

  function removeOption(questionIndex, optionIndex) {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const removed = question.options?.[optionIndex] || '';
      const options = (question.options || []).filter((_, indexToKeep) => indexToKeep !== optionIndex);
      return { ...question, options, answer: question.answer === removed ? '' : question.answer };
    }));
  }

  function addQuestion() {
    setQuestions((current) => [...current, emptyQuestion()]);
    setErrors([]);
    window.setTimeout(() => questionListRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  function removeQuestion(index) {
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
    setErrors([]);
  }

  function moveQuestion(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    setQuestions((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function validate() {
    const nextErrors = [];
    if (!unitId) nextErrors.push('Assign the quiz to a unit.');
    if (!questions.length) nextErrors.push('Add at least one quiz question.');
    questions.forEach((question, index) => {
      const prefix = `Question ${index + 1}`;
      if (!question.prompt?.trim()) nextErrors.push(`${prefix}: Question Text is required.`);
      if (!typeLabels[question.type]) nextErrors.push(`${prefix}: Answer Type is required.`);
      if (question.type === 'mcq') {
        const options = (question.options || []).map((option) => option.trim()).filter(Boolean);
        if (options.length < 2) nextErrors.push(`${prefix}: MCQ requires at least two non-empty options.`);
        if (!question.answer?.trim() || !options.includes(question.answer.trim())) nextErrors.push(`${prefix}: select a Correct Answer from the options.`);
      }
    });
    return nextErrors;
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.length) return;
    onSave({ courseSlug: initialCourseSlug, unitId, questions });
  }

  return (
    <main className="teacher-quiz-editor-page">
      <section className="teacher-quiz-editor-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{course?.title || 'Assigned Course'}</span><b>/</b><strong>Quiz Editor</strong></div>
        <div className="teacher-quiz-editor-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Quiz Editor</span><span className="teacher-kicker-badge">KAN-35</span></div>
            <h1>{existingQuiz ? 'Edit quiz questions' : 'Create a quiz'}</h1>
            <p>Add MCQ, short-writing and project-style questions, keep them in the order learners should see them, and save the configuration to the current browser session.</p>
          </div>
          <aside><span>Content ownership</span><strong>KAN-50 remains separate</strong><small>The current Unit 1 fallback stays prototype-only. This task does not introduce the final five scientific quiz questions.</small></aside>
        </div>
      </section>

      <form className="teacher-quiz-editor-body" onSubmit={submit}>
        <section className="teacher-quiz-main">
          <section className="teacher-quiz-form-card teacher-quiz-assignment-card">
            <div><span className="section-kicker">Quiz placement</span><h2>Assign to Unit *</h2><p>The originating course is fixed. Select one unit for this quiz configuration.</p></div>
            <div className="teacher-quiz-assignment-grid">
              <div className="teacher-quiz-course-context"><span>Course</span><strong>{course?.title || 'Course unavailable'}</strong></div>
              <label className="teacher-editor-field"><span>Unit *</span><select value={unitId} onChange={(event) => changeUnit(event.target.value)} disabled={!units.length}><option value="">Select a unit</option>{units.map((unit, index) => <option key={unit.id} value={unit.id}>Unit {index + 1} · {unit.title}</option>)}</select></label>
            </div>
            {selectedUnit && <div className="teacher-quiz-unit-context"><span>Selected unit</span><strong>{selectedUnit.title}</strong><small>{selectedUnit.source === 'pilot' ? 'Established pilot structure' : 'Teacher-created unit'}</small></div>}
          </section>

          <section className="teacher-quiz-form-card">
            <div className="teacher-quiz-list-heading"><div><span className="section-kicker">Question editor</span><h2>Quiz questions</h2><p>Questions are saved and shown to learners in the order below.</p></div><button className="button button-primary" type="button" onClick={addQuestion}>+ Add Question</button></div>
            {!questions.length && <div className="teacher-quiz-empty">No questions yet. Add the first question to begin.</div>}
            <div className="teacher-quiz-question-list" ref={questionListRef}>
              {questions.map((question, index) => (
                <article className="teacher-quiz-question-card" key={question.id}>
                  <div className="teacher-quiz-question-head">
                    <div><span>Question {index + 1}</span><strong>{typeLabels[question.type] || 'Question'}</strong></div>
                    <div className="teacher-quiz-order-actions"><button type="button" disabled={index === 0} onClick={() => moveQuestion(index, -1)} aria-label={`Move question ${index + 1} up`}>↑</button><button type="button" disabled={index === questions.length - 1} onClick={() => moveQuestion(index, 1)} aria-label={`Move question ${index + 1} down`}>↓</button><button className="teacher-quiz-remove-question" type="button" onClick={() => removeQuestion(index)}>Remove</button></div>
                  </div>

                  <div className="teacher-quiz-question-grid">
                    <label className="teacher-editor-field"><span>Question Text *</span><textarea rows="4" value={question.prompt || ''} onChange={(event) => updateQuestion(index, { prompt: event.target.value })} placeholder="Enter question text" /></label>
                    <label className="teacher-editor-field"><span>Answer Type *</span><select value={question.type} onChange={(event) => changeType(index, event.target.value)}><option value="mcq">Multiple choice (MCQ)</option><option value="short">Short writing</option><option value="project">Project-style response</option></select></label>
                  </div>

                  {question.type === 'mcq' && (
                    <div className="teacher-quiz-options-editor">
                      <div className="teacher-quiz-options-heading"><div><span className="section-kicker">MCQ options</span><strong>Options + Correct Answer *</strong></div><button type="button" onClick={() => addOption(index)}>+ Add option</button></div>
                      {(question.options || []).map((option, optionIndex) => (
                        <div className="teacher-quiz-option-row" key={`${question.id}-option-${optionIndex}`}>
                          <label className="teacher-quiz-correct-radio" title="Mark as correct"><input type="radio" name={`correct-${question.id}`} checked={question.answer === option && option.trim() !== ''} onChange={() => updateQuestion(index, { answer: option })} disabled={!option.trim()} /><span>Correct</span></label>
                          <input value={option} onChange={(event) => updateOption(index, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`} />
                          <button type="button" onClick={() => removeOption(index, optionIndex)} disabled={(question.options || []).length <= 2}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type !== 'mcq' && <div className="teacher-quiz-writing-note"><strong>{typeLabels[question.type]}</strong><span>Learner response is required for submission but is not automatically scored.</span></div>}
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="teacher-quiz-side-stack">
          <section className="teacher-quiz-form-card">
            <span className="section-kicker">Quiz summary</span>
            <h2>{questions.length} question{questions.length === 1 ? '' : 's'}</h2>
            <div className="teacher-quiz-type-summary"><div><span>MCQ</span><strong>{questions.filter((question) => question.type === 'mcq').length}</strong></div><div><span>Short writing</span><strong>{questions.filter((question) => question.type === 'short').length}</strong></div><div><span>Project-style</span><strong>{questions.filter((question) => question.type === 'project').length}</strong></div></div>
            <p>MCQs are auto-scored. Written and project-style responses are collected without automatic scoring.</p>
          </section>

          <section className="teacher-quiz-form-card teacher-quiz-actions-card">
            <span className="section-kicker">Quiz actions</span>
            <h2>Save configuration</h2>
            <p>Saving replaces this course + unit quiz for the current browser session. Pilot Unit 1 changes then appear in the existing learner Quiz page.</p>
            {errors.length > 0 && <div className="teacher-editor-errors" role="alert"><strong>Check the quiz</strong>{errors.map((error) => <span key={error}>{error}</span>)}</div>}
            <div className="teacher-editor-actions"><button className="button button-primary" type="submit" disabled={!units.length}>Save Quiz</button><button className="button button-outline" type="button" onClick={onBack}>Cancel</button></div>
          </section>
        </aside>
      </form>
    </main>
  );
}
