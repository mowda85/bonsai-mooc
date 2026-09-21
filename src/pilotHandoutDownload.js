import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const FILE_NAME = 'Flood_Inundation_Forecasting_Using_AI_BONSAI_handout.docx';
const MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const figures = [
  {
    src: '/pilot/flood-ai/figure-1-floodevac-workflow.webp',
    width: 620,
    height: 248,
    caption: 'Figure 1. Supplied modelling workflow linking rainfall information and uncertainty, LARSIM hydrology, calibration and uncertainty analysis, and 1D/2D hydraulic modelling.',
    alt: 'FloodEvac-Tool workflow linking rainfall information, LARSIM hydrology, calibration, uncertainty analysis, and 1D/2D hydraulic modelling.',
  },
  {
    src: '/pilot/flood-ai/figure-2-rainfall-uncertainty.webp',
    width: 410,
    height: 412,
    caption: 'Figure 2. Spatial rainfall uncertainty used as an input to the flood-forecasting chain.',
    alt: 'Spatial rainfall uncertainty map used as an input to flood forecasting.',
  },
  {
    src: '/pilot/flood-ai/figure-3-trebgast-uncertainty.webp',
    width: 610,
    height: 414,
    caption: 'Figure 3. Trebgast hydrograph showing observed discharge, model results and the uncertainty band from 100 runs.',
    alt: 'Trebgast discharge hydrograph with observed discharge, model results and an uncertainty band from 100 runs.',
  },
];

async function imageAsPngBytes(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Could not load figure: ${src}`);
  const sourceBlob = await response.blob();
  const objectUrl = URL.createObjectURL(sourceBlob);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable.');
    context.drawImage(image, 0, 0);
    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not convert figure to PNG.'))), 'image/png', 1);
    });
    return new Uint8Array(await pngBlob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function body(text) {
  return new Paragraph({
    spacing: { after: 150, line: 300 },
    children: [new TextRun({ text, size: 20, font: 'Arial' })],
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, font: 'Arial' })],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 70, after: 170 },
    children: [new TextRun({ text, italics: true, size: 17, font: 'Arial' })],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 90 },
    children: [new TextRun({ text, size: 20, font: 'Arial' })],
  });
}

async function figureParagraph(figure) {
  const data = await imageAsPngBytes(figure.src);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new ImageRun({
          data,
          type: 'png',
          transformation: { width: figure.width, height: figure.height },
          altText: { title: figure.alt, description: figure.alt, name: figure.alt },
        }),
      ],
    }),
    caption(figure.caption),
  ];
}

export async function buildPilotHandoutBlob() {
  const figureBlocks = await Promise.all(figures.map(figureParagraph));

  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: 'Flood Inundation Forecasting Using AI', bold: true, font: 'Arial' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new TextRun({ text: 'BONSAI-MOOC pilot course — extended theoretical reading', italics: true, size: 20, font: 'Arial' })],
    }),
    body('Purpose. This short reading connects the pilot description with the supplied research material. It explains why flood-inundation forecasts matter for crisis management, how physics-based and data-driven methods produce them, and why speed, lead time and uncertainty are central to operational decision-making.'),

    heading('1. Why inundation forecasting matters'),
    body('Flood maps translate a hydrological event into spatial information: where water may spread, which areas may be exposed and how deep the water may become. For long-term flood-risk management, maximum inundation maps are valuable because they help identify vulnerable locations and support preparedness. Crisis management needs an additional dimension: time. Responders need to know not only the possible maximum extent, but also how the inundation may evolve over the next hours so that warning, coordination and protective actions can be taken before conditions worsen.'),
    body('Zhang et al. describe emergency management as a sequence that begins with observation, forecasting, risk assessment and decision-making, followed by warning, response, and evacuation or sheltering. The available prediction lead time therefore has practical value: it creates the window in which authorities can interpret information, issue warnings and organise action. In this sense, an inundation forecast is useful when it is both spatially informative and available early enough to support decisions.'),

    heading('2. From rainfall to flood maps'),
    body('Physics-based forecasting commonly links hydrological and hydraulic models. Rainfall information is converted into catchment runoff and river discharge by a hydrological model; the resulting flows are then propagated through one-dimensional (1D), two-dimensional (2D), or coupled hydraulic models to estimate water depth, velocity and inundation extent. Calibration and uncertainty analysis are important because rainfall, model parameters and boundary conditions are never known perfectly.'),
    ...figureBlocks[0],

    heading('3. The computational challenge: fast forecasts during a crisis'),
    body('Detailed 2D hydrodynamic models are well suited to producing high-resolution inundation maps, but they can be computationally demanding. Bhola et al. (2018) addressed this operational limitation with an offline forecasting framework. Instead of running the complete 2D model after every new forecast, they precomputed a large database of discharge scenarios and corresponding inundation maps. During an event, the real-time discharge forecast is compared with the database and the best-matching inundation scenario is retrieved.'),
    body('In the Kulmbach case study, 180 synthetic scenarios were generated. The framework produced a 12-hour inundation forecast and updated the selected maps every three hours. The authors reported that the offline selection could run in seconds, whereas the online hydrodynamic simulation and post-processing used in their comparison required substantially more time. The key lesson is not that physics-based modelling becomes unnecessary, but that expensive simulations can be moved to the preparation stage and then reused rapidly during an emergency.'),
    ...figureBlocks[1],
    ...figureBlocks[2],

    heading('4. AI as a rapid surrogate for inundation forecasting'),
    body('A second route to faster forecasts is to train data-driven models on the relationship between hydraulic inputs and inundation outputs. Lin et al. (2020) used artificial neural networks (ANNs) for high-resolution multistep flood-inundation forecasting in Kulmbach. Their model learned from synthetic events generated with a hydraulic model and mapped discharge inputs to inundation water-depth grids. The study used a 4 m × 4 m spatial resolution, trained on 120 synthetic events and tested on 60 additional synthetic events before application to historical floods.'),
    body('The motivation is operational speed: once trained, the ANN can produce inundation forecasts much faster than repeatedly running a full 2D model. In the study, short-horizon forecasts were generally the most reliable, while forecast accuracy tended to decrease as the lead time increased or the prediction moved further from the interval used for training. This is an important operational principle: AI can accelerate flood mapping, but forecast skill still needs to be evaluated by lead time, event type and location.'),

    heading('5. Uncertainty, lead time and crisis decisions'),
    body('Flood forecasts are not exact predictions of the future. Rainfall uncertainty, errors in discharge forecasts, simplified model physics, limited training scenarios and changing conditions all affect the result. A hydrograph uncertainty band, such as the one in Figure 3, is therefore as important as the central forecast because it shows that more than one future trajectory is plausible. Similarly, an inundation forecast should be interpreted as decision-support information rather than as a guaranteed boundary of where flooding will occur.'),
    body('For crisis management, the most useful forecast combines four qualities: enough spatial detail to identify potentially affected areas; enough temporal detail to show how conditions may evolve; enough speed to be available before key decisions must be made; and clear communication of uncertainty. This is where AI and precomputed approaches can complement physics-based modelling. Physics-based simulations provide the process-based reference and training data, while data-driven or database-retrieval methods can deliver fast operational estimates.'),

    heading('Key takeaways for the BONSAI pilot', HeadingLevel.HEADING_2),
    bullet('Risk management needs maximum inundation maps; crisis management also needs the temporal evolution of flooding.'),
    bullet('Physics-based 2D models give detailed maps, while precomputed and AI approaches can return operational forecasts much faster.'),
    bullet('Shorter lead times are generally easier to forecast accurately, and uncertainty should remain visible.'),
    bullet('Forecasts support earlier warning, coordination and response; they do not replace expert judgement.'),

    heading('References used for this synthesis', HeadingLevel.HEADING_2),
    body('Bhola, P. K., Leandro, J., & Disse, M. (2018). Framework for Offline Flood Inundation Forecasts for Two-Dimensional Hydrodynamic Models. Geosciences, 8, 346.'),
    body('Lin, Q., Leandro, J., Gerber, S., & Disse, M. (2020). Multistep Flood Inundation Forecasts with Resilient Backpropagation Neural Networks: Kulmbach Case Study. Water, 12, 3568.'),
    body('Zhang, L., Peng, M., Chang, D., & Xu, Y. (2016). Dam Failure Mechanisms and Risk Assessment. Chapter 13: Dam Failure Contingency Risk Management. Wiley.'),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20 },
          paragraph: { spacing: { line: 300 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export async function downloadPilotHandout() {
  const blob = await buildPilotHandoutBlob();
  const typedBlob = blob.type === MIME_TYPE ? blob : new Blob([blob], { type: MIME_TYPE });
  const url = URL.createObjectURL(typedBlob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export { FILE_NAME as PILOT_HANDOUT_FILENAME, MIME_TYPE as PILOT_HANDOUT_MIME_TYPE };
