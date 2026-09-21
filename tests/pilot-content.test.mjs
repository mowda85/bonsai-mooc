import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const json = async (path) => JSON.parse(await read('content/pilot-course/' + path));
const description = await json('flood-inundation-ai-description.json');
const source = (await read('src/courseArchitecture.js')).replace(/^import floodForecastingDescription[^\n]+;/, 'const floodForecastingDescription = ' + JSON.stringify(description) + ';');
const architecture = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const lessons = await json('lessons.json');
test('three units, one source-based reading in Unit 2, no invented duplicates', () => {
  assert.equal(architecture.PILOT_COURSE_UNITS.length, 3);
  assert.equal(architecture.PILOT_COURSE_UNITS[1].title, 'Flood Inundation Forecasting Using AI');
  assert.equal(architecture.PILOT_COURSE_UNITS[2].title, 'From Forecast to Crisis Decision');
  assert.equal(architecture.PILOT_COURSE_UNITS[1].lessons.length, 1);
  const reading = lessons.filter(l => l.unitNumber === 2);
  assert.equal(reading.length, 1);
  assert.equal(reading[0].source, 'source-based-synthesis');
  assert.equal(reading[0].sections.length, 4);
  assert.match(reading[0].body, /temporal sequence/i);
  assert.match(reading[0].sections.map(section => section.body).join(' '), /Bhola et al\. \(2018\)/);
  assert.match(reading[0].sections.map(section => section.body).join(' '), /Lin et al\. \(2020\)/);
  assert.match(reading[0].sections.map(section => section.body).join(' '), /Zhang et al\. \(2016\)/);
  assert.match(description, /CNN/);
  assert.match(description, /PINNs/);
});
test('all lesson positions and titles match navigation', () => {
  architecture.PILOT_COURSE_UNITS.forEach((unit, index) => {
    const unitLessons = lessons.filter(l => l.unitNumber === index + 1);
    assert.deepEqual(unit.lessons, unitLessons.map(l => l.title));
    unitLessons.forEach((l, i) => {
      assert.equal(l.unitId, unit.id);
      assert.equal(l.lessonNumber, i + 1);
    });
  });
});
test('public metadata and teacher source agree', async () => {
  const meta = await json('course-metadata.json');
  assert.equal(meta.description, architecture.PILOT_COURSE_DESCRIPTION);
  assert.deepEqual(meta.learningObjectives, architecture.PILOT_COURSE_OBJECTIVES);
  const units = await json('units.json');
  assert.deepEqual(units.units.map(u => u.title), architecture.PILOT_COURSE_UNITS.map(u => u.title));
  assert.equal(units.units[1].description, description);
  assert.match(await read('src/TeacherDashboard.jsx'), /\.\.\.unit, source: 'pilot'/);
});
test('category, pilot identity, prerequisites and assessment links preserved', async () => {
  assert.equal(architecture.BONSAI_CATEGORIES.length, 5);
  const pilots = architecture.BONSAI_COURSES.filter(c => c.pilot);
  assert.equal(pilots.length, 1);
  assert.equal(pilots[0].slug, 'flood-crisis-management-estuarine-areas');
  assert.equal(pilots[0].categorySlug, 'crisis-management');
  assert.equal(architecture.getCourseDependencyStatus(pilots[0]).locked, false);
  assert.equal((await json('quiz.json')).unitId, 'pilot-unit-1');
  assert.equal((await json('activity.json')).unitId, 'pilot-unit-3');
});

test('Unit 2 has three contextual figures in the intended sections', async () => {
  const reading = lessons.find(l => l.unitNumber === 2 && l.lessonNumber === 1);
  assert.equal(reading.sections[0].figures.length, 1);
  assert.equal(reading.sections[1].figures.length, 2);
  assert.equal(reading.sections[2].figures, undefined);
  assert.equal(reading.sections[3].figures, undefined);

  const figures = reading.sections.flatMap(section => section.figures || []);
  assert.equal(figures.length, 3);
  assert.deepEqual(figures.map(figure => figure.src), [
    '/pilot/flood-ai/figure-1-floodevac-workflow.webp',
    '/pilot/flood-ai/figure-2-rainfall-uncertainty.webp',
    '/pilot/flood-ai/figure-3-trebgast-uncertainty.webp',
  ]);

  for (const figure of figures) {
    assert.ok(figure.alt.length > 20);
    assert.match(figure.caption, /^Figure [1-4]\./);
    const info = await stat(new URL('../public' + figure.src, import.meta.url));
    assert.ok(info.size > 0, figure.src);
  }

  assert.equal(reading.companionResource.title, 'Extended theoretical reading');
  assert.match(reading.companionResource.meta, /DOCX/);
});
