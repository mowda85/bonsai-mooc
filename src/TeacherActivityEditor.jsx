import { useMemo, useState } from 'react';
import { getPrototypeActivity } from './prototypeActivityStore.js';

function buildInitialForm(courseSlug, unitId) {
  const existing = getPrototypeActivity(courseSlug, unitId);
  return {
    unitId: unitId || '',
    title: existing?.title || '',
    instructions: existing?.instructions || '',
  };
}

export default function TeacherActivityEditor({ portfolio, initialCourseSlug, initialUnitId, onBack, onSave }) {
  const course = useMemo(() => portfolio.find((item) => item.slug === initialCourseSlug) || null, [initialCourseSlug, portfolio]);
  const units = course?.units || [];
  const resolvedInitialUnitId = units.some((unit) => unit.id === initialUnitId) ? initialUnitId : units[0]?.id || '';
  const [form, setForm] = useState(() => buildInitialForm(initialCourseSlug, resolvedInitialUnitId));
  const [errors, setErrors] = useState([]);
  const selectedUnit = units.find((unit) => unit.id === form.unitId) || null;
  const existingActivity = form.unitId ? getPrototypeActivity(initialCourseSlug, form.unitId) : null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeUnit(unitId) {
    const existing = getPrototypeActivity(initialCourseSlug, unitId);
    setForm({
      unitId,
      title: existing?.title || '',
      instructions: existing?.instructions || '',
    });
    setErrors([]);
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = [];
    if (!form.title.trim()) nextErrors.push('Activity Title is required.');
    if (!form.instructions.trim()) nextErrors.push('Instructions are required.');
    if (!form.unitId) nextErrors.push('Assign the activity to a unit.');
    setErrors(nextErrors);
    if (nextErrors.length) return;
    onSave({
      courseSlug: initialCourseSlug,
      unitId: form.unitId,
      title: form.title.trim(),
      instructions: form.instructions.trim(),
    });
  }

  return (
    <main className="teacher-activity-editor-page">
      <section className="teacher-activity-editor-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>{course?.title || 'Assigned Course'}</span><b>/</b><strong>Activity Editor</strong></div>
        <div className="teacher-activity-editor-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Activity Editor</span><span className="teacher-kicker-badge">KAN-34</span></div>
            <h1>{existingActivity ? 'Edit learner activity' : 'Create learner activity'}</h1>
            <p>Set the activity title and instructions, assign the activity to one unit, and save it to the current browser session for the learner handoff.</p>
          </div>
          <aside><span>Prototype storage</span><strong>Browser session</strong><small>No backend, grading workflow or final scientific activity content is introduced in this task.</small></aside>
        </div>
      </section>

      <form className="teacher-activity-editor-body" onSubmit={submit}>
        <section className="teacher-activity-form-card">
          <div className="teacher-editor-card-heading"><div><span className="section-kicker">Activity content</span><h2>Activity details</h2></div><span className="teacher-required-note">Required fields *</span></div>
          <label className="teacher-editor-field"><span>Activity Title *</span><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Enter activity title" /></label>
          <label className="teacher-editor-field"><span>Instructions *</span><small>Describe what the learner should do. Final scientific content remains a later content task.</small><textarea rows="11" value={form.instructions} onChange={(event) => update('instructions', event.target.value)} placeholder="Enter learner activity instructions" /></label>
        </section>

        <aside className="teacher-activity-side-stack">
          <section className="teacher-activity-form-card">
            <span className="section-kicker">Unit assignment</span>
            <h2>Assign to Unit *</h2>
            <p>The originating course is fixed for this editor. Select one of its units.</p>
            <div className="teacher-activity-course-context"><span>Course</span><strong>{course?.title || 'Course unavailable'}</strong></div>
            <label className="teacher-editor-field teacher-activity-unit-select"><span>Unit *</span><select value={form.unitId} onChange={(event) => changeUnit(event.target.value)} disabled={!units.length}><option value="">Select a unit</option>{units.map((unit, index) => <option key={unit.id} value={unit.id}>Unit {index + 1} · {unit.title}</option>)}</select></label>
            {selectedUnit && <div className="teacher-activity-unit-context"><span>Selected unit</span><strong>{selectedUnit.title}</strong><small>{selectedUnit.source === 'pilot' ? 'Established pilot structure' : 'Teacher-created unit'}</small></div>}
            {!units.length && <div className="teacher-activity-empty">This course has no units yet. Add a unit before creating an activity.</div>}
          </section>

          <section className="teacher-activity-form-card teacher-activity-actions-card">
            <span className="section-kicker">Activity actions</span>
            <h2>Save activity</h2>
            <p>Saving updates this course + unit pair and makes the configured title and instructions available to the learner Activity page in this browser session.</p>
            {errors.length > 0 && <div className="teacher-editor-errors" role="alert"><strong>Check the required fields</strong>{errors.map((error) => <span key={error}>{error}</span>)}</div>}
            <div className="teacher-editor-actions"><button className="button button-primary" type="submit" disabled={!units.length}>Save Activity</button><button className="button button-outline" type="button" onClick={onBack}>Cancel</button></div>
          </section>
        </aside>
      </form>
    </main>
  );
}
