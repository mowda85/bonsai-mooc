import { useMemo, useState } from 'react';

export const teacherLearningAreas = [
  { name: 'Foundation', note: 'Required common core · not a specialization track' },
  { name: 'Dike Stability and Erosion', note: 'Specialization track' },
  { name: 'Animal Activities and Burrows', note: 'Specialization track' },
  { name: 'Vegetation and Nature-based Solutions', note: 'Specialization track' },
  { name: 'Flood Risk and Emergency Management', note: 'Specialization track' },
];

function initialForm(course, isNew, authorName) {
  if (isNew || !course) {
    return {
      title: '',
      description: '',
      objectives: '',
      areas: [],
      draftFolder: '',
      author: authorName || '',
      coAuthors: [],
    };
  }

  return {
    title: course.title || '',
    description: course.description || '',
    objectives: Array.isArray(course.objectives) ? course.objectives.join('\n') : '',
    areas: course.areas?.length ? course.areas : course.area ? [course.area] : [],
    draftFolder: course.draftFolder || '',
    author: course.author || authorName || '',
    coAuthors: Array.isArray(course.coAuthors) ? course.coAuthors : [],
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
          <h2>Authors</h2>
          <p><strong>Primary author:</strong> {form.author.trim() || 'Not set'}</p>
          <p><strong>Co-authors:</strong> {form.coAuthors.length ? form.coAuthors.join(', ') : 'None added yet'}</p>
        </div>

        <aside className="teacher-preview-side-card">
          <span className="section-kicker">Course organization</span>
          <h2>Official track assignment</h2>
          {form.areas.length ? <div className="teacher-preview-tags">{form.areas.map((area) => <span key={area}>{area}</span>)}</div> : <p>Unassigned Draft — no official track selected yet.</p>}
          <h2>Draft folder</h2>
          <p>{form.draftFolder.trim() || 'No personal Draft folder selected.'}</p>
          <div className="teacher-preview-note"><strong>Preview only</strong><span>Returning to the editor preserves these unsaved values.</span></div>
          <button className="button button-primary" type="button" onClick={onBack}>Return to editor</button>
        </aside>
      </section>
    </main>
  );
}

export default function TeacherCourseEditor({ course, isNew, onBack, onSave, authorName }) {
  const [form, setForm] = useState(() => initialForm(course, isNew, authorName));
  const [previewing, setPreviewing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [savedMessage, setSavedMessage] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [areaOpen, setAreaOpen] = useState(false);
  const [coAuthorInput, setCoAuthorInput] = useState('');

  const objectiveCount = useMemo(
    () => form.objectives.split('\n').map((item) => item.trim()).filter(Boolean).length,
    [form.objectives],
  );

  const filteredAreas = useMemo(() => {
    const query = areaSearch.trim().toLowerCase();
    return teacherLearningAreas.filter((area) => !form.areas.includes(area.name) && (!query || `${area.name} ${area.note}`.toLowerCase().includes(query)));
  }, [areaSearch, form.areas]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setSavedMessage('');
  }

  function addArea(name) {
    setForm((current) => ({ ...current, areas: current.areas.includes(name) ? current.areas : [...current.areas, name] }));
    setAreaSearch('');
    setAreaOpen(false);
    setSavedMessage('');
  }

  function removeArea(name) {
    setForm((current) => ({ ...current, areas: current.areas.filter((area) => area !== name) }));
    setSavedMessage('');
  }

  function addCoAuthor() {
    const value = coAuthorInput.trim();
    if (!value) return;
    if (value.toLowerCase() === form.author.trim().toLowerCase()) {
      setCoAuthorInput('');
      return;
    }
    setForm((current) => ({ ...current, coAuthors: current.coAuthors.some((item) => item.toLowerCase() === value.toLowerCase()) ? current.coAuthors : [...current.coAuthors, value] }));
    setCoAuthorInput('');
    setSavedMessage('');
  }

  function removeCoAuthor(name) {
    setForm((current) => ({ ...current, coAuthors: current.coAuthors.filter((item) => item !== name) }));
    setSavedMessage('');
  }

  function save(event) {
    event.preventDefault();
    const nextErrors = [];
    if (!form.title.trim()) nextErrors.push('Course Title is required.');
    if (!form.description.trim()) nextErrors.push('Description is required.');
    if (!objectiveCount) nextErrors.push('Add at least one learning objective.');
    if (!form.author.trim()) nextErrors.push('Primary Author is required.');
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const saved = onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      objectives: form.objectives.split('\n').map((item) => item.trim()).filter(Boolean),
      areas: form.areas,
      draftFolder: form.draftFolder.trim(),
      author: form.author.trim(),
      coAuthors: form.coAuthors,
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
          <div>
            <div className="teacher-hero-badges"><span className="pill">Course Editor</span><span className="teacher-kicker-badge">KAN-32</span></div>
            <h1>{isNew ? 'Create a new BONSAI course' : `Edit ${course?.title || 'course'}`}</h1>
            <p>Draft freely, organize your work, add co-authors, and connect the course to official BONSAI tracks when it is ready.</p>
          </div>
          <aside><span>Current status</span><strong>{course?.status || 'New course'}</strong><small>Save always sets status to Draft.</small></aside>
        </div>
      </section>

      <form className="teacher-course-editor-body" onSubmit={save}>
        <div className="teacher-editor-main-stack">
          <section className="teacher-editor-form-card">
            <div className="teacher-editor-card-heading"><div><span className="section-kicker">Course metadata</span><h2>Basic information</h2></div><span className="teacher-required-note">Required fields *</span></div>
            <label className="teacher-editor-field"><span>Course Title *</span><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Enter course title" /></label>
            <label className="teacher-editor-field"><span>Description *</span><textarea rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what learners will study in this course" /></label>
            <label className="teacher-editor-field"><span>Learning objectives *</span><small>Enter one objective per line.</small><textarea rows="6" value={form.objectives} onChange={(event) => update('objectives', event.target.value)} placeholder={'Objective 1\nObjective 2\nObjective 3'} /></label>
          </section>

          <section className="teacher-editor-form-card teacher-authors-card">
            <span className="section-kicker">Collaboration</span><h2>Authors</h2><p>One teacher is the Primary Author. Add as many co-authors as the course needs.</p>
            <label className="teacher-editor-field"><span>Primary Author *</span><input value={form.author} onChange={(event) => update('author', event.target.value)} placeholder="Teacher name or BONSAI ID" /></label>
            <div className="teacher-editor-field">
              <span>Co-authors</span><small>Search or enter a teacher name / BONSAI ID, then add them.</small>
              <div className="teacher-coauthor-entry"><input value={coAuthorInput} onChange={(event) => setCoAuthorInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCoAuthor(); } }} placeholder="Add a co-author" /><button className="button button-outline" type="button" onClick={addCoAuthor}>Add</button></div>
              {form.coAuthors.length > 0 && <div className="teacher-selected-chips">{form.coAuthors.map((name) => <span key={name}>{name}<button type="button" onClick={() => removeCoAuthor(name)} aria-label={`Remove ${name}`}>×</button></span>)}</div>}
            </div>
          </section>
        </div>

        <aside className="teacher-editor-side-stack">
          <section className="teacher-editor-form-card teacher-area-card">
            <span className="section-kicker">Official structure</span><h2>Track / learning area</h2><p>Optional while Draft. Search the official list and add one or more when appropriate. Official tracks are created and governed by Admin.</p>
            {form.areas.length > 0 && <div className="teacher-selected-chips teacher-area-chips">{form.areas.map((area) => <span key={area}>{area}<button type="button" onClick={() => removeArea(area)} aria-label={`Remove ${area}`}>×</button></span>)}</div>}
            <div className="teacher-area-combobox">
              <input value={areaSearch} onFocus={() => setAreaOpen(true)} onChange={(event) => { setAreaSearch(event.target.value); setAreaOpen(true); }} placeholder="Search official tracks…" aria-label="Search official tracks" />
              <button type="button" className="teacher-area-toggle" onClick={() => setAreaOpen((current) => !current)} aria-label="Open track list">⌄</button>
              {areaOpen && <div className="teacher-area-dropdown">{filteredAreas.length ? filteredAreas.map((area) => <button type="button" key={area.name} onClick={() => addArea(area.name)}><strong>{area.name}</strong><small>{area.note}</small></button>) : <div className="teacher-area-empty">No matching official track.</div>}</div>}
            </div>
            {!form.areas.length && <div className="teacher-unassigned-note"><strong>Unassigned Draft</strong><span>You can save now and connect the course to an official track later.</span></div>}
          </section>

          <section className="teacher-editor-form-card teacher-draft-folder-card">
            <span className="section-kicker">Personal organization</span><h2>Draft folder / category</h2><p>Organize your own drafts however you want. This does not create an official BONSAI track.</p>
            <label className="teacher-editor-field"><span>Folder name</span><input value={form.draftFolder} onChange={(event) => update('draftFolder', event.target.value)} placeholder="e.g. Future modelling courses" /></label>
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
