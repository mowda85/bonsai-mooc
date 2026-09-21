import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
const json = async (path) => JSON.parse(await read('content/pilot-course/' + path));
const description = await json('flood-inundation-ai-description.json');
const source = (await read('src/courseArchitecture.js')).replace(/^import floodForecastingDescription[^\n]+;/, 'const floodForecastingDescription = ' + JSON.stringify(description) + ';');
const architecture = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const lessons = await json('lessons.json');
test('three units, one supplied reading in Unit 2, no invented duplicates', () => {
  assert.equal(architecture.PILOT_COURSE_UNITS.length, 3);
  assert.equal(architecture.PILOT_COURSE_UNITS[1].title, 'Flood Inundation Forecasting Using AI');
  assert.equal(architecture.PILOT_COURSE_UNITS[2].title, 'From Forecast to Crisis Decision');
  assert.equal(architecture.PILOT_COURSE_UNITS[1].lessons.length, 1);
  const reading = lessons.filter(l => l.unitNumber === 2);
  assert.equal(reading.length, 1);
  assert.equal(reading[0].body, description);
  assert.equal(reading[0].source, 'partner-supplied-description');
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
