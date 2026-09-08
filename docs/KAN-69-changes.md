# KAN-69 — Reopen earned badges and Specialist Certificates

## Change

Earned achievements no longer become inaccessible after the learner leaves the completion screen.

On **Learner Dashboard → Badges & Specialist Certificates**:

- Every earned **Course Badge** can be opened again.
- Every earned **Specialist Certificate** can be opened again.
- The whole achievement card is clickable with a visible native **View badge** / **View certificate** button.
- The selected achievement opens in a BONSAI-styled dialog.

## Course Badge preview

The preview shows:

- BONSAI-MOOC branding.
- `Course Badge` recognition type.
- The matching completed course title.
- `Completed · Earned` course status.
- The stored achievement name.

A Course Badge continues to represent completion of one individual course. It does **not** create a course certificate.

## Specialist Certificate preview

The preview shows:

- BONSAI-MOOC branding.
- `Specialist Certificate` recognition type.
- The matching Category / specialist title.
- Confirmation that all courses in the Category are complete.

A Specialist Certificate continues to be awarded only when every course in its Category is completed.

## State and persistence

KAN-69 does not introduce a second achievement store. It reuses the existing KAN-64/KAN-68 completion state (`completedCourseSlugs`) and Category progress logic. This keeps award visibility synchronized with the same prototype-session achievement state already used by the dashboard, course cards and Specialist Certificate calculation.

## Accessibility and interaction

- Achievement cards provide a native `View badge` or `View certificate` button.
- The complete card remains mouse-clickable.
- The preview uses dialog semantics (`role="dialog"`, `aria-modal="true"`).
- The preview can be closed with the close button, footer button, backdrop click or `Escape`.
- Keyboard focus returns to the triggering achievement button after close.
- Responsive styles keep the preview usable on mobile screens.

## Regression expectations

The change must not alter:

- KAN-68 badge-only individual course completion.
- Specialist Certificate award rules.
- Existing Category progress calculations.
- Pilot quiz/activity/completion flows.
- Existing achievement persistence for the prototype session.
- BONSAI blue/green visual language.

## Manual review checklist

1. Log in with the learner prototype account.
2. Earn or seed more than one Course Badge.
3. Complete a Category so its Specialist Certificate is earned.
4. Open **Learner Dashboard → Badges & Specialist Certificates**.
5. Click each Course Badge and verify that its own title appears in the preview.
6. Click the Specialist Certificate and verify the correct specialist/Category title appears.
7. Close each preview and confirm the dashboard state remains unchanged.
8. Repeat using keyboard navigation and `Escape`.
9. Check the dialog at a mobile viewport width.
