function PreviewFrame({ breadcrumb, title, subtitle, onBack, onSave, errors, children }) {
  return (
    <main className="teacher-learner-preview-page">
      <div className="teacher-preview-mode-bar">
        <div><strong>Preview mode</strong><span>Teacher-only simulation · nothing here is published</span></div>
        <div><button className="button button-outline" type="button" onClick={onBack}>← Back to Edit</button><button className="button button-primary" type="button" onClick={onSave}>Save</button></div>
      </div>
      <section className="teacher-learner-preview-hero">
        <div className="teacher-learner-preview-breadcrumb" aria-label="Preview breadcrumb">{breadcrumb.map((item, index) => <span key={`${item}-${index}`}>{index > 0 && <b>/</b>}{item}</span>)}</div>
        <span className="teacher-preview-kicker">Learner view · KAN-36</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      {errors?.length > 0 && <div className="teacher-preview-errors" role="alert"><strong>Save needs attention</strong>{errors.map((error) => <span key={error}>{error}</span>)}<button type="button" onClick={onBack}>Return to editor to correct →</button></div>}
      {children}
    </main>
  );
}

export function CourseLearnerPreview({ form, course, onBack, onSave, errors }) {
  const objectives = form.objectives.split('\n').map((item) => item.trim()).filter(Boolean);
  const areas = form.areas?.length ? form.areas : ['Unassigned Draft'];
  const units = course?.units || [];

  return (
    <PreviewFrame
      breadcrumb={[areas[0], form.title.trim() || 'Untitled course']}
      title={form.title.trim() || 'Untitled course'}
      subtitle={form.description.trim() || 'No course description has been entered yet.'}
      onBack={onBack}
      onSave={onSave}
      errors={errors}
    >
      <section className="teacher-learner-course-preview-body">
        <div className="teacher-learner-preview-main">
          <section className="teacher-learner-preview-card">
            <span className="section-kicker">About this course</span>
            <h2>What you will learn</h2>
            {objectives.length ? <ol className="teacher-preview-objectives">{objectives.map((objective, index) => <li key={`${objective}-${index}`}><span>{index + 1}</span><p>{objective}</p></li>)}</ol> : <div className="teacher-preview-empty">No learning objectives entered yet.</div>}
          </section>

          <section className="teacher-learner-preview-card">
            <div className="teacher-preview-section-heading"><div><span className="section-kicker">Course structure</span><h2>Units</h2></div><span>{units.length} unit{units.length === 1 ? '' : 's'}</span></div>
            {units.length ? <div className="teacher-preview-unit-list">{units.map((unit, index) => <article key={unit.id || `${unit.title}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>Unit {index + 1}</small><strong>{unit.title}</strong><p>{unit.description || (unit.source === 'pilot' ? 'Established pilot unit.' : 'Teacher-created unit.')}</p></div><b>Preview</b></article>)}</div> : <div className="teacher-preview-empty teacher-preview-empty-large"><strong>No units yet</strong><span>A learner would see the course overview, but there are no units to open yet.</span></div>}
          </section>
        </div>

        <aside className="teacher-learner-preview-side">
          <section className="teacher-learner-preview-card">
            <span className="section-kicker">Course details</span>
            <div className="teacher-preview-detail"><span>Track / learning area</span><strong>{areas.join(' · ')}</strong></div>
            <div className="teacher-preview-detail"><span>Primary author</span><strong>{form.author.trim() || 'Not set'}</strong></div>
            <div className="teacher-preview-detail"><span>Co-authors</span><strong>{form.coAuthors?.length ? form.coAuthors.join(', ') : 'None'}</strong></div>
            <div className="teacher-preview-detail"><span>Status</span><strong>Preview only · not published</strong></div>
          </section>
        </aside>
      </section>
    </PreviewFrame>
  );
}

export function UnitLearnerPreview({ form, portfolio, onBack, onSave, errors }) {
  const course = portfolio.find((item) => item.slug === form.assignedCourseSlugs?.[0]);
  const courseName = course?.title || 'Unassigned course';
  const area = course?.areas?.[0] || course?.area || 'Unassigned Draft';
  const title = form.title.trim() || 'Untitled unit';
  const lessonContent = form.description.trim();

  return (
    <PreviewFrame
      breadcrumb={[area, courseName, title]}
      title={title}
      subtitle={form.description.trim() || 'No unit description has been entered yet.'}
      onBack={onBack}
      onSave={onSave}
      errors={errors}
    >
      <section className="teacher-learner-unit-preview-body">
        <div className="teacher-learner-preview-main">
          <section className="teacher-learner-preview-card">
            <div className="teacher-preview-section-heading"><div><span className="section-kicker">Lesson selector</span><h2>Unit content</h2></div><span>1 lesson preview</span></div>
            <button className="teacher-preview-lesson-selector active" type="button"><span>01</span><div><small>Lesson 1</small><strong>{title}</strong></div><b>Selected</b></button>
          </section>

          <section className="teacher-learner-preview-card teacher-preview-lesson-content">
            <span className="section-kicker">Lesson 1</span>
            <h2>{title}</h2>
            {lessonContent ? <p>{lessonContent}</p> : <div className="teacher-preview-empty"><strong>No lesson content yet</strong><span>Return to edit and add unit instructional text. No teaching content is invented in preview.</span></div>}
          </section>

          {form.exercise.trim() && <section className="teacher-learner-preview-card teacher-preview-activity-block"><span className="section-kicker">Activity</span><h2>Learner activity</h2><p>{form.exercise.trim()}</p><div className="teacher-preview-response-shell">Learner response area would appear here.</div></section>}
        </div>

        <aside className="teacher-learner-preview-side">
          <section className="teacher-learner-preview-card">
            <span className="section-kicker">Unit details</span>
            <div className="teacher-preview-detail"><span>Course</span><strong>{courseName}</strong></div>
            <div className="teacher-preview-detail"><span>Preview assignment</span><strong>{form.assignedCourseSlugs?.length > 1 ? `First of ${form.assignedCourseSlugs.length} assigned courses` : 'Assigned course'}</strong></div>
            <div className="teacher-preview-detail"><span>Resource</span><strong>{form.file?.name || 'No attached file'}</strong></div>
            <div className="teacher-preview-detail"><span>Status</span><strong>Preview only · not published</strong></div>
          </section>
          {form.file && <section className="teacher-learner-preview-card teacher-preview-resource-card"><span className="section-kicker">Learner resource</span><h2>{form.file.name}</h2><p>{form.file.type || 'File'} · metadata preview only</p><button className="button button-outline" type="button" disabled>Download unavailable in preview</button></section>}
        </aside>
      </section>
    </PreviewFrame>
  );
}
