const mobileMenu = document.querySelector('.mobile-menu');

mobileMenu.addEventListener('click', (event) => {
  if (event.target.closest('a')) mobileMenu.open = false;
});

mobileMenu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.open) {
    mobileMenu.open = false;
    mobileMenu.querySelector('summary').focus();
  }
});

function copyWithSelection(text, button) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
    button.focus({ preventScroll: true });
  }
}

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  const label = button.querySelector('.copy-label');
  const defaultLabel = label.textContent;
  const status = button.closest('.agent-prompt, .code-window').querySelector('.copy-result');
  let resetTimer;

  button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copyTarget).textContent.trim();
    let copied = false;

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // Fall back to selection when clipboard permission is unavailable.
      }
    }

    if (!copied) {
      try {
        copied = copyWithSelection(text, button);
      } catch {
        copied = false;
      }
    }

    label.textContent = copied ? button.dataset.copied : button.dataset.failed;
    status.textContent = label.textContent;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      label.textContent = defaultLabel;
      status.textContent = '';
    }, 3000);
  });
});