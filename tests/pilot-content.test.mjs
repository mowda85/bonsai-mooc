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
  assert.equal(reading[0].sections.length, 6);
  assert.match(reading[0].body, /Urban Flood Forecasting lecture/i);
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


test('Unit 2 companion handout is a real downloadable DOCX', async () => {
  const reading = lessons.find(l => l.unitNumber === 2 && l.lessonNumber === 1);
  assert.equal(reading.companionResource.downloadable, true);
  assert.equal(reading.companionResource.fileName, 'Flood_Inundation_Forecasting_Using_AI_BONSAI_handout.docx');
  assert.equal(reading.companionResource.mimeType, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.match(reading.companionResource.description, /three retained figures/i);
  assert.match(reading.companionResource.description, /Urban Flood Forecasting lecture/i);

  const bridge = await read('src/Epic5PilotContentBridge.jsx');
  assert.match(bridge, /Download handout/);
  assert.match(bridge, /downloadPilotHandout/);
  assert.doesNotMatch(bridge, /disabled>Companion handout<\/button>/);

  const generator = await read('src/pilotHandoutDownload.js');
  assert.match(generator, /Packer\.toBlob/);
  assert.match(generator, /Flood_Inundation_Forecasting_Using_AI_BONSAI_handout\.docx/);
  assert.match(generator, /figure-1-floodevac-workflow\.webp/);
  assert.match(generator, /figure-2-rainfall-uncertainty\.webp/);
  assert.match(generator, /figure-3-trebgast-uncertainty\.webp/);
  assert.doesNotMatch(generator, /figure-4-2d-uncertainty/);
});


test('Unit 2 includes the seven-question video-and-theory knowledge check', async () => {
  const quiz = await json('unit2-quiz.json');
  assert.equal(quiz.courseSlug, 'flood-crisis-management-estuarine-areas');
  assert.equal(quiz.unitId, 'pilot-unit-2');
  assert.equal(quiz.questions.length, 7);
  assert.ok(quiz.questions.every(question => question.type === 'mcq'));
  const prompts = quiz.questions.map(question => question.prompt).join(' ');
  assert.match(prompts, /lead time/i);
  assert.match(prompts, /input layer/i);
  assert.match(prompts, /backpropagation/i);
  assert.match(prompts, /training, validation and test/i);
  assert.match(prompts, /overfitting/i);
  assert.match(prompts, /weights and biases/i);

  const store = await read('src/prototypeQuizStore.js');
  assert.match(store, /pilot-unit-2/);
  assert.match(store, /unit2-quiz\.json/);

  const unitPage = await read('src/LearnerUnitPage.jsx');
  assert.match(unitPage, /Flood forecasting & ANN knowledge check/);
  assert.match(unitPage, /7 questions/);

  const quizPage = await read('src/LearnerQuizPage.jsx');
  assert.match(quizPage, /Practice assessment/);
  assert.match(quizPage, /Recommended Unit 2 practice/);
});

test('video-derived ANN concepts are present in Unit 2 theory and downloadable handout', async () => {
  const reading = lessons.find(l => l.unitNumber === 2 && l.lessonNumber === 1);
  const theory = reading.sections.map(section => section.heading + ' ' + section.body).join(' ');
  assert.match(theory, /input layer/i);
  assert.match(theory, /hidden layers/i);
  assert.match(theory, /weights/);
  assert.match(theory, /bias/);
  assert.match(theory, /activation/);
  assert.match(theory, /backpropagation/);
  assert.match(theory, /training, validation and test datasets/i);
  assert.match(theory, /underfitting/);
  assert.match(theory, /overfitting/);
  assert.match(theory, /hyperparameters/);

  const handout = await read('src/pilotHandoutDownload.js');
  assert.match(handout, /ANN foundations from the supplied Urban Flood Forecasting lecture/);
  assert.match(handout, /training, validation and test datasets/);
  assert.match(handout, /underfitting/);
  assert.match(handout, /overfitting/);
});
