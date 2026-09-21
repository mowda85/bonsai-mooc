import floodForecastingDescription from '../content/pilot-course/flood-inundation-ai-description.json';

export const PILOT_COURSE_SLUG = 'flood-crisis-management-estuarine-areas';
export const PILOT_COURSE_TITLE = 'Flood Crisis Management in Estuarine Areas';
export const PILOT_COURSE_DESCRIPTION = 'Flood Crisis Management in Estuarine Areas connects crisis-management fundamentals with flood inundation forecasting and decision-making. The technical core, Flood Inundation Forecasting Using AI, introduces the different information needed for flood risk and crisis management, physics-based modelling, computational constraints, and AI-based forecasting approaches including CNN, ANN and PINNs. Learners then connect forecasts, their temporal sequence and uncertainty to communication, stakeholder coordination and scenario-based response, recovery and resilience.';
export const PILOT_COURSE_DURATION = 'To be confirmed';
export const PILOT_COURSE_OBJECTIVES = [
  'Explain the main phases and principles of flood crisis management in estuarine and flood-prone areas.',
  'Interpret flood-risk, situational-awareness and forecasting information to support crisis decisions.',
  'Distinguish maximum inundation maps from time-dependent forecasts and describe the role of physics-based models and AI in flood forecasting.',
  'Explain the roles of communication, stakeholder coordination, readiness and leadership during flood crises.',
  'Evaluate an evolving flood scenario and identify appropriate preparedness, response, recovery and resilience actions.',
];
export const PILOT_COURSE_UNITS = [
  {
    id: 'pilot-unit-1',
    title: 'Flood Crisis Management Fundamentals',
    lessons: [
      'Crisis Management and Emergency Response',
      'Preparedness, Readiness and Leadership',
      'Situational Awareness and Decision-Making',
    ],
  },
  {
    id: 'pilot-unit-2',
    title: 'Flood Inundation Forecasting Using AI',
    description: floodForecastingDescription,
    lessons: ['Flood Inundation Forecasting Using AI'],
  },
  {
    id: 'pilot-unit-3',
    title: 'From Forecast to Crisis Decision',
    lessons: [
      'Crisis Communication',
      'Stakeholder Coordination',
      'Interpreting Evolving Flood Situations',
      'Evaluating Impacts and Response Options',
      'Preparedness, Response, Recovery and Long-Term Resilience',
    ],
  },
];

export const BONSAI_CATEGORIES = [
  {
    slug: 'erosion',
    name: 'Erosion',
    description: 'Courses from the BONSAI erosion branch, covering dike stability, laboratory erosion assessment, clay erosion and numerical modelling.',
    specialistCertificate: 'BONSAI Specialist Certificate — Erosion',
    courses: [
      {
        slug: 'dike-stability-lagrangian-numerical-modelling',
        title: 'Dike Stability: Lagrangian Methods and Numerical Modeling',
        description: 'Dike stability approaches represented in the BONSAI course map.',
        topics: [
          'Modeling the Global Stability of Dikes: From Classical to Numerical Approaches',
          'Fundamentals of the Discrete Element Method (DEM)',
        ],
      },
      {
        slug: 'soil-erosion-assessment-laboratory',
        title: 'Soil Erosion Assessment in a Laboratory',
        description: 'Laboratory assessment of soil-surface erodibility and supporting measurement methods.',
        topics: [
          'Assessing Soil Surface Erodibility in the Laboratory',
          'Metrology and Sensor Technologies for Erosion Testing',
        ],
      },
      {
        slug: 'predicting-clay-erosion-wave-impact',
        title: 'Predicting Erosion Properties of Clay Due to Wave Impact',
        description: 'A BONSAI course topic focused on predicting clay erosion properties under wave impact.',
        topics: [],
      },
      {
        slug: 'numerical-modelling-flood-blind-exercise',
        title: 'Numerical Modelling Associated to Flood Modelling + Blind Exercise',
        description: 'Numerical modelling for flood and erosion problems, including modelling exercises represented in the BONSAI map.',
        topics: [
          'Flood Modelling — Shallow-Water Equations and Breach Modelling',
          'Application to a Real Case',
          'Modelling Erosion and Deposition Processes',
        ],
      },
    ],
  },
  {
    slug: 'animal-activities-burrows',
    name: 'Animal Activities / Burrows',
    description: 'Courses on burrowing animals, levee safety, monitoring, geophysical methods and flood-defence risk.',
    specialistCertificate: 'BONSAI Specialist Certificate — Animal Activities / Burrows',
    courses: [
      {
        slug: 'dealing-with-burrows-levee-management',
        title: 'Dealing with Burrows in Levee Management',
        description: 'Management of burrows in levees, including detection, inspection and monitoring techniques.',
        topics: ['Detection, Inspection and Monitoring Techniques'],
      },
      {
        slug: 'effect-burrows-levee-safety',
        title: 'Effect of Burrows on Levee Safety',
        description: 'Effects of animal burrows on levee safety and related animal-risk factors.',
        topics: ['Digging Capacity and Risk per Animal', 'Animal Behaviour'],
      },
      {
        slug: 'non-destructive-geophysical-methods-dikes',
        title: 'Non-destructive Geophysical Methods for the Stability of Dikes',
        description: 'Non-destructive methods for dike stability assessment represented in the BONSAI map.',
        topics: [
          'Introduction to Non-destructive Methods: Principles and Applications',
          'Data Acquisition and Processing (Frequency Analysis and Signal Processing)',
          'Comparative Study and Practical Application',
        ],
      },
      {
        slug: 'risk-digging-animal-flood-defence',
        title: 'What Is the Risk of a Digging Animal in Your Flood Defence?',
        description: 'A course topic on evaluating risk from digging animals in flood defences.',
        topics: [],
      },
    ],
  },
  {
    slug: 'information-systems-knowledge-dissemination',
    name: 'Information Systems & Knowledge Dissemination',
    description: 'The BONSAI information-systems and knowledge-dissemination category, covering data, information, knowledge, information systems and knowledge dissemination.',
    specialistCertificate: 'BONSAI Specialist Certificate — Information Systems & Knowledge Dissemination',
    courses: [
      {
        slug: 'information-systems-knowledge-dissemination',
        title: 'Information Systems and Knowledge Dissemination',
        description: 'Data, information, knowledge, the BONSAI information-system context and knowledge dissemination.',
        topics: [
          'Introduction to Data, Information and Knowledge',
          'Information Systems in BONSAI',
          'Knowledge Dissemination in BONSAI',
        ],
        objectives: [
          'Explain the relationship between data, information and knowledge.',
          'Describe methods for collecting, managing and transforming data.',
          'Analyze the role of information systems in the BONSAI project.',
          'Identify effective approaches for knowledge dissemination.',
        ],
      },
    ],
  },
  {
    slug: 'vegetation-biodiversity',
    name: 'Vegetation / Biodiversity',
    description: 'Courses on vegetation, biodiversity, dike safety, management, soil type and climate change.',
    specialistCertificate: 'BONSAI Specialist Certificate — Vegetation / Biodiversity',
    courses: [
      {
        slug: 'vegetation-erosion-resistance-dike-safety',
        title: 'Importance of Vegetation for Erosion Resistance / Dike Safety',
        description: 'The role of vegetation in erosion resistance and dike safety.',
        topics: [],
      },
      {
        slug: 'biodiversity-values-dike-vegetation',
        title: 'Biodiversity Values and Potential of Dike Vegetation',
        description: 'Biodiversity values and potential associated with dike vegetation.',
        topics: [],
      },
      {
        slug: 'vegetation-management',
        title: 'Vegetation and Management',
        description: 'Vegetation management in the BONSAI dike and flood-resilience context.',
        topics: [],
      },
      {
        slug: 'vegetation-soil-type',
        title: 'Vegetation and Soil Type',
        description: 'Relationships between vegetation and soil type represented in the BONSAI map.',
        topics: [],
      },
      {
        slug: 'dike-vegetation-climate-change',
        title: 'Dike Vegetation and Climate Change',
        description: 'Dike vegetation in relation to climate change.',
        topics: [],
      },
    ],
  },
  {
    slug: 'crisis-management',
    name: 'Crisis Management',
    description: 'Courses on flood-crisis management, preparedness, flood-risk management, emergency response, forecasting, crisisology and practical flood-event response.',
    specialistCertificate: 'BONSAI Specialist Certificate — Crisis Management',
    courses: [
      {
        slug: PILOT_COURSE_SLUG,
        title: PILOT_COURSE_TITLE,
        description: PILOT_COURSE_DESCRIPTION,
        pilot: true,
        duration: PILOT_COURSE_DURATION,
        objectives: PILOT_COURSE_OBJECTIVES,
        units: PILOT_COURSE_UNITS,
        topics: PILOT_COURSE_UNITS.flatMap((unit) => unit.lessons),
      },
      {
        slug: 'flood-risk-management-preparedness',
        title: 'Flood Risk Management / Preparedness',
        description: 'Preparedness-oriented flood-risk management represented in the BONSAI map.',
        topics: [
          'Flood Wave Propagation in Urban Areas',
          'Flood Risk Quantification',
          'Flood Inundation Forecasting with AI',
        ],
      },
      {
        slug: 'emergency-response',
        title: 'Emergency Response',
        description: 'Emergency response in the BONSAI crisis-management branch.',
        topics: ['Emergency Response and the Military'],
      },
      {
        slug: 'crisisology-hydraulic-warfare',
        title: 'Crisisology / Hydraulic Warfare',
        description: 'Crisisology content represented in the BONSAI course map.',
        topics: [],
      },
      {
        slug: 'prepared-respond-flood-risk-events',
        title: 'Be Prepared and Able to Respond to Flood Risk Events',
        description: 'A practical response course represented in the BONSAI map as a course programme with 15 lectures.',
        topics: [
          'Introduction to Flood Emergency Management',
          'Preparedness in Flood Emergency Management',
          'Response in Flood Emergency Management',
          'The Scope of Flood Risk Situations (Flood Threat and Flood Defences)',
          'Communicating for Flood Emergency',
          'Assessing and Inspecting Flood Defences Pre-, During and Post-Flood Situations',
          'Understanding the Problem',
          'Techniques for Emergency Measures',
          'Selecting and Designing Emergency Measures',
          'Logistics and Implementing Measures',
          'Health, Safety and Wellbeing During Flood Events',
          'Understanding Where It Can Go Wrong',
          'Sharing Knowledge and Collaboration',
          'Justifying the Required Funds',
          'Making It Work',
        ],
      },
    ],
  },
];

const LEGACY_CATEGORY_NAMES = {
  Foundation: 'Information Systems & Knowledge Dissemination',
  'Dike Stability and Erosion': 'Erosion',
  'Animal Activities and Burrows': 'Animal Activities / Burrows',
  'Vegetation and Nature-based Solutions': 'Vegetation / Biodiversity',
  'Flood Risk and Emergency Management': 'Crisis Management',
};

export const BONSAI_COURSES = BONSAI_CATEGORIES.flatMap((category) =>
  category.courses.map((course) => ({
    ...course,
    category: category.name,
    categorySlug: category.slug,
    externalPrerequisites: Array.isArray(course.externalPrerequisites) ? course.externalPrerequisites : [],
    internalDependencies: Array.isArray(course.internalDependencies) ? course.internalDependencies : [],
  })),
);

export function getCategoryBySlug(slug) {
  return BONSAI_CATEGORIES.find((category) => category.slug === slug) || null;
}

export function getCourseBySlug(slug) {
  return BONSAI_COURSES.find((course) => course.slug === slug) || null;
}

export function normalizeLegacyCategoryName(name) {
  return LEGACY_CATEGORY_NAMES[name] || name || '';
}

export function getCourseDependencyStatus(course, learnerState = {}) {
  const dependencies = Array.isArray(course?.internalDependencies) ? course.internalDependencies : [];
  const completedCourses = new Set(learnerState.completedCourseSlugs || []);
  const unmetRequired = dependencies.filter((dependency) => {
    if (dependency.required === false) return false;
    if (dependency.targetType !== 'course') return false;
    return !completedCourses.has(dependency.targetId);
  });
  return {
    locked: unmetRequired.length > 0,
    unmetRequired,
  };
}
