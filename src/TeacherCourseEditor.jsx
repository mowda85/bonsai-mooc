import { useMemo, useState } from 'react';

export const teacherLearningAreas = [
  { name: 'Foundation', note: 'Required common core · not a specialization track' },
  { name: 'Dike Stability and Erosion', note: 'Specialization track' },
  { name: 'Animal Activities and Burrows', note: 'Specialization track' },
  { name: 'Vegetation and Nature-based Solutions', note: 'Specialization track' },
  { name: 'Flood Risk and Emergency Management', note: 'Specialization track' },
];

function initialForm(course, isNew) {
  if (isNew || !course) return { title: '', description: '', objectives: '', areas: [] };
  return {
    title: course.title || '',
    description: course.description || '',
    objectives: Array.isArray(course.objectives) ? course.objectives.join('\n') : '',
    areas: course.areas?.length ? course.areas : course.area ? [course.area] : [],
  };
}

function LearnerPreviewHandoff({ form, onBack }) {
  const objectives = form.objectives.split('\n').map((item) => item.trim()).filter(Boolean);
  return (
    <main className="teacher-course-preview-page">
      <section className="teacher-course-preview-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Course Editor</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><span>Course Editor</span><b>/</b><strong>Learner preview</strong></div>
        <div className="teacher-hero-badges"><span className="pill">Learner-view preview handoff</span><span className="teacher-kicker-badge">KAN-36</span></div>
        <h1>{form.title.trim() || 'Untitled course'}</h1>
        <p>This lightweight preview uses the current editor values, including unsaved changes. The full learner-view preview experience belongs to KAN-36.</p>
      </section>
      <section className="teacher-course-preview-body">
        <div className="teacher-preview-main-card">
          <span className="section-kicker">Current unsaved editor state</span>
          <h2>Course description</h2>
          <p>{form.description.trim() || 'No description entered yet.'}</p>
          <h2>Learning objectives</h2>
          {objectives.length ? <ol>{objectives.map((objective) => <li key={objective}>{objective}</li>)}</ol> : <p>No objectives entered yet.</p>}
        </div>
        <aside className="teacher-preview-side-card">
          <span className="section-kicker">Learning area assignment</span>
          {form.areas.length ? <div className="teacher-preview-tags">{form.areas.map((area) => <span key={area}>{area}</span>)}</div> : <p>No learning area selected yet.</p>}
          <div className="teacher-preview-note"><strong>Preview only</strong><span>Returning to the editor preserves these unsaved values.</span></div>
          <button className="button button-primary" type="button" onClick={onBack}>Return to editor</button>
        </aside>
      </section>
    </main>
  );
}

export default function TeacherCourseEditor({ course, isNew, onBack, onSave }) {
  const [form, setForm] = useState(() => initialForm(course, isNew));
  const [previewing, setPreviewing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [savedMessage, setSavedMessage] = useState('');
  const objectiveCount = useMemo(() => form.objectives.split('\n').map((item) => item.trim()).filter(Boolean).length, [form.objectives]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSavedMessage('');
  }

  function toggleArea(name) {
    setForm((current) => ({ ...current, areas: current.areas.includes(name) ? current.areas.filter((item) => item !== name) : [...current.areas, name] }));
    setSavedMessage('');
  }

  function save(event) {
    event.preventDefault();
    const nextErrors = [];
    if (!form.title.trim()) nextErrors.push('Course Title is required.');
    if (!form.description.trim()) nextErrors.push('Description is required.');
    if (!objectiveCount) nextErrors.push('Add at least one learning objective.');
    if (!form.areas.length) nextErrors.push('Assign the course to at least one learning area.');
    setErrors(nextErrors);
    if (nextErrors.length) return;
    const saved = onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      objectives: form.objectives.split('\n').map((item) => item.trim()).filter(Boolean),
      areas: form.areas,
    });
    setSavedMessage(`Saved as Draft${saved?.title ? ` · ${saved.title}` : ''}`);
  }

  if (previewing) return <LearnerPreviewHandoff form={form} onBack={() => setPreviewing(false)} />;

  return (
    <main className="teacher-course-editor-page">
      <section className="teacher-course-editor-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> {isNew ? 'Back to Teacher Dashboard' : 'Back to Assigned Course'}</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>{isNew ? 'Create Course' : 'Edit Course'}</strong></div>
        <div className="teacher-course-editor-heading">
          <div><div className="teacher-hero-badges"><span className="pill">Course Editor</span><span className="teacher-kicker-badge">KAN-32</span></div><h1>{isNew ? 'Create a new BONSAI course' : `Edit ${course?.title || 'course'}`}</h1><p>Define the course metadata, assign its learning area or specialization track, save it as Draft, or preview the current unsaved version.</p></div>
          <aside><span>Current status</span><strong>{course?.status || 'New course'}</strong><small>Save always sets status to Draft.</small></aside>
        </div>
      </section>

      <form className="teacher-course-editor-body" onSubmit={save}>
        <section className="teacher-editor-form-card">
          <div className="teacher-editor-card-heading"><div><span className="section-kicker">Course metadata</span><h2>Basic information</h2></div><span className="teacher-required-note">Required fields *</span></div>
          <label className="teacher-editor-field"><span>Course Title *</span><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Enter course title" /></label>
          <label className="teacher-editor-field"><span>Description *</span><textarea rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what learners will study in this course" /></label>
          <label className="teacher-editor-field"><span>Learning objectives *</span><small>Enter one objective per line.</small><textarea rows="6" value={form.objectives} onChange={(event) => update('objectives', event.target.value)} placeholder={'Objective 1\nObjective 2\nObjective 3'} /></label>
        </section>

        <aside className="teacher-editor-side-stack">
          <section className="teacher-editor-form-card teacher-area-card">
            <span className="section-kicker">Assignment</span><h2>Track / learning area *</h2><p>Select one or more. Foundation is the required common core and is not a specialization track.</p>
            <div className="teacher-area-options">{teacherLearningAreas.map((area) => <label key={area.name} className={`teacher-area-option ${form.areas.includes(area.name) ? 'teacher-area-option-selected' : ''}`}><input type="checkbox" checked={form.areas.includes(area.name)} onChange={() => toggleArea(area.name)} /><span><strong>{area.name}</strong><small>{area.note}</small></span></label>)}</div>
          </section>
          <section className="teacher-editor-form-card teacher-editor-actions-card">
            <span className="section-kicker">Course actions</span><h2>Save or preview</h2><p>Preview uses the current form values even when they have not been saved.</p>
            {errors.length > 0 && <div className="teacher-editor-errors" role="alert"><strong>Check the required fields</strong>{errors.map((error) => <span key={error}>{error}</span>)}</div>}
            {savedMessage && <div className="teacher-editor-saved" role="status">✓ {savedMessage}</div>}
            <div className="teacher-editor-actions"><button className="button button-primary" type="submit">Save as Draft</button><button className="button button-outline" type="button" onClick={() => { setErrors([]); setPreviewing(true); }}>Preview learner view</button></div>
          </section>
        </aside>
      </form>
    </main>
  );
}
