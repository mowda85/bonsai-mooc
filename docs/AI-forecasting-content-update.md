# Flood inundation forecasting content update

Follow-up to the pilot restructuring work. Keep the existing pilot course identity, five open categories, configurable prerequisites, earned course badges and Specialist Certificates.

## Current pilot structure

1. **Flood Crisis Management Fundamentals** — existing introductory lessons and required quiz.
2. **Flood Inundation Forecasting Using AI** — one source-based reading combining the partner-supplied description, Lin et al. (2020), Bhola et al. (2018), Zhang et al. (2016), and concepts extracted from the supplied 10:37 *Urban Flood Forecasting* lecture.
3. **From Forecast to Crisis Decision** — existing communication, coordination, interpretation, impact and recovery lessons plus required scenario activity.

## KAN-72 lesson update

The Unit 2 reading is intentionally short in the learner UI. It now explains the chain from hydrological information to physics-based inundation modelling, the real-time computational constraint, precomputed/offline forecasting, ANN-based rapid inundation prediction, uncertainty/lead time, and the use of forecasts in crisis decisions.

KAN-74 adds the newly supplied figures back into the learner-facing Unit 2 lesson, placed directly beside the theory they support:

- **From rainfall to flood maps** — FloodEvac-Tool workflow.
- **Precomputed scenarios, inputs and uncertainty** — Rainfall Uncertainty map, followed by the Trebgast discharge-uncertainty hydrograph.
Each retained figure uses a concise caption and accessible alt text. KAN-76 removes the final 2D uncertainty figure from the learner-facing Unit 2 lesson while keeping Figures 1–3 unchanged.

A downloadable DOCX companion reading is available directly from the Unit 2 learner lesson. KAN-77 turns the former disabled companion-handout button into a working **Download handout** action. The Word document is generated in the learner's browser from the extended source-based reading and the three retained figures, then saved as `Flood_Inundation_Forecasting_Using_AI_BONSAI_handout.docx`.

KAN-79 integrates the supplied lecture into the **theory and assessment**. The learner reading and downloadable DOCX now introduce ANN input/hidden/output layers, weighted inputs, biases, activation functions, backpropagation, training/validation/test datasets, underfitting/overfitting, and hyperparameters versus learned parameters.

KAN-79 also adds a visible **Unit 2 practice knowledge check** with seven multiple-choice questions based jointly on the written theory and the supplied lecture. It is intentionally separate from the required Unit 1 quiz, so it does not alter the Unit 1 completion gate or the Unit 3 scenario requirement.

The playable-video binary is tracked separately in KAN-78; KAN-79 does not claim that the video player is complete.

## Sources used

- Bhola, P. K., Leandro, J., & Disse, M. (2018). *Framework for Offline Flood Inundation Forecasts for Two-Dimensional Hydrodynamic Models*. Geosciences, 8, 346.
- Lin, Q., Leandro, J., Gerber, S., & Disse, M. (2020). *Multistep Flood Inundation Forecasts with Resilient Backpropagation Neural Networks: Kulmbach Case Study*. Water, 12, 3568.
- Zhang, L., Peng, M., Chang, D., & Xu, Y. (2016). *Dam Failure Mechanisms and Risk Assessment*. Chapter 13: Dam Failure Contingency Risk Management. Wiley.
- Supplied lecture video: *Urban Flood Forecasting*, Univ.-Prof. Jorge Leandro, Universität Siegen.

## Verification

Run `node --test tests/pilot-content.test.mjs` and `npm run build`.

Manual check: open the pilot course, enter Unit 2, verify the expanded ANN theory and the three retained figures. Open the **Flood forecasting & ANN knowledge check**, answer and submit all seven questions, and verify it is labelled as a practice assessment. Click **Download handout** and confirm the generated DOCX contains the new ANN training/evaluation section. Then verify the required Unit 1 quiz, Unit 3 scenario and achievement behavior remain intact.
