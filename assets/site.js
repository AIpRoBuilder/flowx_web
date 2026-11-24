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

// Signal panels: quote carousel
document.querySelectorAll('[data-quote-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('[data-quote-slide]')];
  const counter = carousel.querySelector('[data-quote-counter]');
  const previous = carousel.querySelector('[data-quote-prev]');
  const next = carousel.querySelector('[data-quote-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, slides.findIndex((slide) => !slide.hidden));
  let timer;

  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.hidden = position !== index;
    });
    if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function stop() {
    clearInterval(timer);
  }

  function start() {
    stop();
    if (reducedMotion.matches || slides.length < 2) return;
    timer = setInterval(() => show(index + 1), 8000);
  }

  previous?.addEventListener('click', () => { show(index - 1); start(); });
  next?.addEventListener('click', () => { show(index + 1); start(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) start();
  });
  show(index);
  start();
});

// Tools registry: group filter and full-text search
document.querySelectorAll('[data-registry]').forEach((registry) => {
  const input = document.querySelector('[data-tool-search]');
  const chips = [...document.querySelectorAll('[data-tool-filter]')];
  const rows = [...registry.querySelectorAll('[data-tool-row]')];
  const count = document.querySelector('[data-tool-count]');
  const empty = document.querySelector('[data-registry-empty]');
  let group = 'all';

  function apply() {
    const query = (input?.value || '').trim().toLowerCase();
    let visible = 0;
    rows.forEach((row) => {
      const inGroup = group === 'all' || row.dataset.group === group;
      const matches = !query || row.textContent.toLowerCase().includes(query);
      row.hidden = !(inGroup && matches);
      if (!row.hidden) visible += 1;
    });
    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible > 0;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      group = chip.dataset.toolFilter || 'all';
      chips.forEach((item) => item.setAttribute('aria-pressed', String(item === chip)));
      apply();
    });
  });

  input?.addEventListener('input', apply);
  apply();
});

// Manual: highlight the section currently in view
document.querySelectorAll('[data-manual-nav]').forEach((nav) => {
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px' });

  sections.forEach((section) => observer.observe(section));
});

// Live repository numbers where the page shows GitHub stats
const liveStats = document.querySelectorAll('[data-github-stat]');
if (liveStats.length > 0) {
  fetch('https://api.github.com/repos/AIpRoBuilder/FlowX', {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error('GitHub API unavailable'))))
    .then((repo) => {
      liveStats.forEach((element) => {
        const value = repo[element.dataset.githubStat];
        if (Number.isFinite(value)) element.textContent = value.toLocaleString('en-US');
      });
    })
    .catch(() => {
      // Static fallbacks in the HTML remain visible.
    });
}