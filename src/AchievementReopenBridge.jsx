import { useEffect } from 'react';

const CARD_SELECTOR = '.category-v2-achievement-list article, .learner-certificate-grid .learner-certificate-card';
const MODAL_ID = 'bonsai-achievement-preview';

function achievementKind(card) {
  const label = card.querySelector(':scope > span')?.textContent?.trim().toLowerCase() || '';
  return card.classList.contains('specialist') || label.includes('specialist') ? 'specialist' : 'badge';
}

function achievementDetails(card) {
  const kind = achievementKind(card);
  const strong = card.querySelector(':scope > strong')?.textContent?.trim() || '';
  const context = card.querySelector(':scope > p')?.textContent?.trim() || '';
  const title = kind === 'specialist'
    ? strong.replace(/^BONSAI\s+Specialist\s+Certificate\s+[—-]\s*/i, '')
    : strong.replace(/^BONSAI\s+Course\s+(?:Badge|Certificate)\s+[—-]\s*/i, '');

  return {
    kind,
    title: title || (kind === 'specialist' ? 'BONSAI Specialist' : 'BONSAI Course'),
    fullName: strong || (kind === 'specialist' ? 'BONSAI Specialist Certificate' : 'BONSAI Course Badge'),
    context,
  };
}

function closePreview() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  const returnFocus = modal._returnFocus;
  const previousOverflow = modal.dataset.previousOverflow || '';
  modal.remove();
  document.body.style.overflow = previousOverflow;
  if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function openPreview(card) {
  const details = achievementDetails(card);
  closePreview();

  const backdrop = document.createElement('div');
  backdrop.id = MODAL_ID;
  backdrop.className = 'achievement-preview-backdrop';
  backdrop.setAttribute('role', 'presentation');
  backdrop.dataset.previousOverflow = document.body.style.overflow || '';
  backdrop._returnFocus = document.activeElement;

  const dialog = document.createElement('section');
  dialog.className = `achievement-preview-dialog ${details.kind === 'specialist' ? 'is-specialist' : 'is-badge'}`;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'achievement-preview-title');

  const close = document.createElement('button');
  close.className = 'achievement-preview-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close achievement preview');
  close.textContent = '×';
  close.addEventListener('click', closePreview);

  const cardPreview = document.createElement('div');
  cardPreview.className = 'achievement-preview-card';

  const brand = document.createElement('div');
  brand.className = 'achievement-preview-brand';
  const logo = document.createElement('img');
  logo.src = '/bonsai-logo.webp';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  const brandCopy = document.createElement('div');
  brandCopy.append(
    createTextElement('strong', '', 'BONSAI-MOOC'),
    createTextElement('span', '', details.kind === 'specialist' ? 'Specialist recognition' : 'Course achievement'),
  );
  brand.append(logo, brandCopy);

  const kicker = createTextElement('span', 'achievement-preview-kicker', details.kind === 'specialist' ? 'Specialist Certificate' : 'Course Badge');
  const title = createTextElement('h2', '', details.title);
  title.id = 'achievement-preview-title';
  const description = createTextElement(
    'p',
    'achievement-preview-description',
    details.kind === 'specialist'
      ? 'Awarded after completing every course in this BONSAI Category.'
      : 'Awarded for completing this BONSAI course.',
  );

  const status = document.createElement('div');
  status.className = 'achievement-preview-status';
  status.append(
    createTextElement('span', '', details.kind === 'specialist' ? 'Category status' : 'Course status'),
    createTextElement('strong', '', details.kind === 'specialist' ? 'All courses completed · Earned' : 'Completed · Earned'),
  );

  const record = createTextElement('small', 'achievement-preview-record', details.fullName);
  cardPreview.append(brand, kicker, title, description);
  if (details.context) cardPreview.append(createTextElement('p', 'achievement-preview-context', details.context));
  cardPreview.append(status, record);

  const footer = document.createElement('div');
  footer.className = 'achievement-preview-footer';
  footer.append(
    createTextElement('span', '', 'This achievement remains available from your learner dashboard.'),
  );
  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'button button-primary';
  done.textContent = 'Close';
  done.addEventListener('click', closePreview);
  footer.append(done);

  dialog.append(close, cardPreview, footer);
  backdrop.append(dialog);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closePreview();
  });
  document.body.append(backdrop);
  document.body.style.overflow = 'hidden';
  close.focus();
}

function patchCard(card) {
  if (card.dataset.achievementReopen === 'true') return;
  const kind = achievementKind(card);
  card.dataset.achievementReopen = 'true';
  card.classList.add('achievement-reopen-control');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${kind === 'specialist' ? 'View Specialist Certificate' : 'View Course Badge'}: ${card.querySelector(':scope > strong')?.textContent?.trim() || 'earned achievement'}`);

  let action = card.querySelector(':scope > .achievement-reopen-button');
  if (!action) {
    action = document.createElement('button');
    action.type = 'button';
    action.className = 'achievement-reopen-button';
    action.textContent = kind === 'specialist' ? 'View certificate →' : 'View badge →';
    action.setAttribute('aria-hidden', 'true');
    action.tabIndex = -1;
    card.append(action);
  }
}

function patchCards() {
  document.querySelectorAll(CARD_SELECTOR).forEach(patchCard);
}

export default function AchievementReopenBridge() {
  useEffect(() => {
    let queued = false;
    const scan = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        patchCards();
      });
    };

    function handleClick(event) {
      const card = event.target.closest?.(CARD_SELECTOR);
      if (!card) return;
      if (event.target.closest('a')) return;
      event.preventDefault();
      event.stopPropagation();
      openPreview(card);
    }

    function handleKeydown(event) {
      if (event.key === 'Escape' && document.getElementById(MODAL_ID)) {
        event.preventDefault();
        closePreview();
        return;
      }
      const card = event.target.closest?.(CARD_SELECTOR);
      if (!card || event.target !== card) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openPreview(card);
    }

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('popstate', scan);
    window.addEventListener('bonsai:category-achievements-changed', scan);
    scan();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeydown, true);
      window.removeEventListener('popstate', scan);
      window.removeEventListener('bonsai:category-achievements-changed', scan);
      closePreview();
    };
  }, []);

  return null;
}
