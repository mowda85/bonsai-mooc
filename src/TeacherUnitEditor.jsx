import { useMemo, useState } from 'react';
import { UnitLearnerPreview } from './TeacherLearnerPreview.jsx';

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TeacherUnitEditor({ portfolio, initialCourseSlug, onBack, onSave }) {
  const [form, setForm] = useState(() => ({
    title: '',
    description: '',
    exercise: '',
    assignedCourseSlugs: initialCourseSlug ? [initialCourseSlug] : [],
    file: null,
  }));
  const [courseSearch, setCourseSearch] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [errors, setErrors] = useState([]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return portfolio;
    return portfolio.filter((course) => `${course.title} ${course.area || ''} ${(course.areas || []).join(' ')}`.toLowerCase().includes(query));
  }, [courseSearch, portfolio]);

  const publishedAssignments = useMemo(
    () => form.assignedCourseSlugs.map((slug) => portfolio.find((course) => course.slug === slug)).filter((course) => course?.status === 'Published'),
    [form.assignedCourseSlugs, portfolio],
  );
  const publishedUpdate = publishedAssignments.length > 0;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors([]);
  }

  function toggleCourse(slug) {
    setForm((current) => ({
      ...current,
      assignedCourseSlugs: current.assignedCourseSlugs.includes(slug)
        ? current.assignedCourseSlugs.filter((item) => item !== slug)
        : [...current.assignedCourseSlugs, slug],
    }));
    setErrors([]);
  }

  function validateAndSave() {
    const nextErrors = [];
    if (!form.title.trim()) nextErrors.push('Unit Title is required.');
    if (!form.description.trim()) nextErrors.push('Description / Lesson 1 content is required.');
    if (!form.assignedCourseSlugs.length) nextErrors.push('Assign the unit to at least one course.');
    setErrors(nextErrors);
    if (nextErrors.length) return false;
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      exercise: form.exercise.trim(),
      assignedCourseSlugs: form.assignedCourseSlugs,
      file: form.file,
    });
    return true;
  }

  function submit(event) {
    event.preventDefault();
    validateAndSave();
  }

  if (previewing) {
    return <UnitLearnerPreview form={form} portfolio={portfolio} errors={errors} onBack={() => { setPreviewing(false); setErrors([]); }} onSave={validateAndSave} />;
  }

  return (
    <main className="teacher-unit-editor-page">
      <section className="teacher-unit-editor-hero">
        <button className="back-link" type="button" onClick={onBack}><span aria-hidden="true">←</span> Back to Assigned Course</button>
        <div className="teacher-breadcrumb"><span>Teacher Dashboard</span><b>/</b><strong>Unit / Content Editor</strong></div>
        <div className="teacher-unit-editor-heading">
          <div>
            <div className="teacher-hero-badges"><span className="pill">Unit / Content Editor</span><span className="teacher-kicker-badge">KAN-33</span></div>
            <h1>Create or update course content</h1>
            <p>Draft unit and Lesson 1 content, assign it to one or more courses, attach a prototype file, save it, or preview the current unsaved version.</p>
          </div>
          <aside><span>Prototype storage</span><strong>{publishedUpdate ? 'Draft update' : 'Same session'}</strong><small>{publishedUpdate ? 'Content assigned to a Published course must complete the review process before it replaces the learner-visible version.' : 'Selected files are represented by metadata only; no backend file storage is connected yet.'}</small></aside>
        </div>
      </section>

      <form className="teacher-unit-editor-body" onSubmit={submit}>
        <section className="teacher-unit-form-card">
          {publishedUpdate && <div className="teacher-unassigned-note"><strong>Published content update</strong><span>Saving this Unit / Lesson content creates a Draft update. The current Published version stays live until Lead Author + Admin approval and final publication.</span></div>}
          <div className="teacher-editor-card-heading"><div><span className="section-kicker">Unit & lesson content</span><h2>Basic information</h2></div><span className="teacher-required-note">Required fields *</span></div>
          <label className="teacher-editor-field"><span>Unit Title *</span><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Enter unit title" /></label>
          <label className="teacher-editor-field"><span>Unit description / Lesson 1 content *</span><small>For this prototype, the unit instructional text is also the Lesson 1 learner-content shell. Updating it is treated as a Lesson-content revision.</small><textarea rows="6" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe the unit and add the Lesson 1 instructional content" /></label>
          <label className="teacher-editor-field"><span>Exercise / activity instructions</span><small>Optional for the prototype.</small><textarea rows="6" value={form.exercise} onChange={(event) => update('exercise', event.target.value)} placeholder="Add an exercise, activity or learner task" /></label>
        </section>

        <aside className="teacher-unit-side-stack">
          <section className="teacher-unit-form-card">
            <span className="section-kicker">Course assignment</span>
            <h2>Assign to course *</h2>
            <p>Search and select one or more courses. The course you opened this editor from is selected automatically.</p>
            {form.assignedCourseSlugs.length > 0 && <div className="teacher-unit-selected-courses">{form.assignedCourseSlugs.map((slug) => { const course = portfolio.find((item) => item.slug === slug); return course ? <button type="button" key={slug} onClick={() => toggleCourse(slug)}>{course.title}<span>×</span></button> : null; })}</div>}
            <input className="teacher-unit-course-search" value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search courses…" aria-label="Search teacher courses" />
            <div className="teacher-unit-course-options">{filteredCourses.map((course) => {
              const selected = form.assignedCourseSlugs.includes(course.slug);
              return <button className={selected ? 'teacher-unit-course-option selected' : 'teacher-unit-course-option'} type="button" key={course.slug} onClick={() => toggleCourse(course.slug)}><span><strong>{course.title}</strong><small>{course.area || course.draftFolder || 'Unassigned draft'}{course.status === 'Published' ? ' · Published' : ''}</small></span><b>{selected ? '✓' : '+'}</b></button>;
            })}</div>
          </section>

          <section className="teacher-unit-form-card">
            <span className="section-kicker">Resource</span>
            <h2>Upload file</h2>
            <p>Optional. The prototype stores file metadata only.</p>
            <label className="teacher-unit-upload"><input type="file" onChange={(event) => { const file = event.target.files?.[0]; update('file', file ? { name: file.name, type: file.type || 'Unknown type', size: file.size } : null); }} /><span>Choose file</span><small>Documents, slides, images or other course resources</small></label>
            {form.file && <div className="teacher-unit-file-summary"><strong>{form.file.name}</strong><span>{form.file.type} · {formatBytes(form.file.size)}</span><button type="button" onClick={() => update('file', null)}>Remove</button></div>}
          </section>

          <section className="teacher-unit-form-card teacher-unit-actions-card">
            <span className="section-kicker">Unit actions</span>
            <h2>Save or preview</h2>
            <p>{publishedUpdate ? 'Saving creates a Draft Unit / Lesson update that must go through Review & Publication.' : 'Save this content to the assigned course, then continue through the normal course review process before first publication.'}</p>
            {errors.length > 0 && <div className="teacher-editor-errors" role="alert"><strong>Check the required fields</strong>{errors.map((error) => <span key={error}>{error}</span>)}</div>}
            <div className="teacher-editor-actions"><button className="button button-primary" type="submit">{publishedUpdate ? 'Save Draft Update' : 'Save Unit'}</button><button className="button button-outline" type="button" onClick={() => { setErrors([]); setPreviewing(true); }}>Preview learner view</button></div>
          </section>
        </aside>
      </form>
    </main>
  );
}
