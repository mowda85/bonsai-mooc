import { prototypePublicationDefaults, prototypePublicationTitles } from './coursePublicationStore.js';
import { PILOT_COURSE_SLUG, PILOT_COURSE_TITLE } from './courseArchitecture.js';

// Keep the publication workflow aligned with the current mapped course architecture.
// The objects are exported by reference, so updating them here also updates the
// Admin and Review/Publication bridges that consume them later in the app startup.
delete prototypePublicationDefaults['dike-stability'];
delete prototypePublicationDefaults['flood-risk-management'];
delete prototypePublicationTitles['dike-stability'];
delete prototypePublicationTitles['flood-risk-management'];

prototypePublicationDefaults[PILOT_COURSE_SLUG] = 'Published';
prototypePublicationTitles[PILOT_COURSE_SLUG] = PILOT_COURSE_TITLE;

prototypePublicationDefaults['dike-stability-lagrangian-numerical-modelling'] = 'Under Review';
prototypePublicationTitles['dike-stability-lagrangian-numerical-modelling'] = 'Dike Stability: Lagrangian Methods and Numerical Modeling';

prototypePublicationDefaults['vegetation-management'] = 'Draft';
prototypePublicationTitles['vegetation-management'] = 'Vegetation and Management';

prototypePublicationDefaults['flood-risk-management-preparedness'] = 'Approved';
prototypePublicationTitles['flood-risk-management-preparedness'] = 'Flood Risk Management / Preparedness';

// Information Systems and Knowledge Dissemination remains a normal Published
// course in its Category; it is no longer the functional pilot.
prototypePublicationDefaults['information-systems-knowledge-dissemination'] = 'Published';
prototypePublicationTitles['information-systems-knowledge-dissemination'] = 'Information Systems and Knowledge Dissemination';
