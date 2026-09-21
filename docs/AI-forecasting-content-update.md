# Flood inundation forecasting content update

Follow-up to the pilot restructuring work. Keep the existing pilot course identity, five open categories, configurable prerequisites, earned course badges and Specialist Certificates.

## Current pilot structure

1. **Flood Crisis Management Fundamentals** — existing introductory lessons and required quiz.
2. **Flood Inundation Forecasting Using AI** — one source-based reading combining the partner-supplied description with the supplied Lin et al. (2020), Bhola et al. (2018) and Zhang et al. (2016) material.
3. **From Forecast to Crisis Decision** — existing communication, coordination, interpretation, impact and recovery lessons plus required scenario activity.

## KAN-72 lesson update

The Unit 2 reading is intentionally short in the learner UI. It now explains the chain from hydrological information to physics-based inundation modelling, the real-time computational constraint, precomputed/offline forecasting, ANN-based rapid inundation prediction, uncertainty/lead time, and the use of forecasts in crisis decisions.

The four figures added in KAN-72 were subsequently removed from the learner-facing Unit 2 lesson in KAN-73. The MOOC lesson now presents the concise source-based theory as text only.

A separate three-page DOCX companion reading was produced from the same source base with a longer pedagogical explanation and all four figures. The prototype identifies this as a companion handout but does not host the binary file in the repository.

No unsupplied video, dataset, technical exercise or partner lesson sequence is claimed. The optional video area remains a prototype slot.

## Sources used

- Bhola, P. K., Leandro, J., & Disse, M. (2018). *Framework for Offline Flood Inundation Forecasts for Two-Dimensional Hydrodynamic Models*. Geosciences, 8, 346.
- Lin, Q., Leandro, J., Gerber, S., & Disse, M. (2020). *Multistep Flood Inundation Forecasts with Resilient Backpropagation Neural Networks: Kulmbach Case Study*. Water, 12, 3568.
- Zhang, L., Peng, M., Chang, D., & Xu, Y. (2016). *Dam Failure Mechanisms and Risk Assessment*. Chapter 13: Dam Failure Contingency Risk Management. Wiley.

## Verification

Run `node --test tests/pilot-content.test.mjs` and `npm run build`.

Manual check: open the pilot course, enter Unit 2, verify the concise theory sections render without embedded figures, check the source basis and companion-reading card, then verify Unit 1 quiz, Unit 3 scenario and achievement behavior remain intact.
