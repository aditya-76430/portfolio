/* ── Shared JS for all pages ──────────────────────────────────────────────── */

// ── Active nav link ──────────────────────────────────────────────────────────
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });
})();

// ── Sticky header ────────────────────────────────────────────────────────────
(function () {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Mobile nav toggle ────────────────────────────────────────────────────────
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;
  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '☰';
  });
  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.textContent = '☰';
    });
  });
})();

// ── Fade-up on scroll ────────────────────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── Big name letter stagger ───────────────────────────────────────────────────
(function () {
  const bigName = document.querySelector('.big-name');
  if (!bigName) return;
  const letters = bigName.querySelectorAll('span');
  letters.forEach((span, i) => {
    span.style.transitionDelay = `${i * 0.07}s`;
    setTimeout(() => span.classList.add('in'), 100 + i * 70);
  });
})();

// ── Skill bars animate on scroll ─────────────────────────────────────────────
(function () {
  const fills = document.querySelectorAll('.sb-fill');
  if (!fills.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.pct + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => io.observe(f));
})();

// ── Project filter ────────────────────────────────────────────────────────────
(function () {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.closest('.card').style.display = show ? '' : 'none';
      });
    });
  });
})();

// ── Contact form ──────────────────────────────────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Chip selection
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot check
    if (form._gotcha && form._gotcha.value) return;

    const name    = form.name_field.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const inquiry = document.querySelector('.chip.selected')?.textContent?.trim() || 'Not specified';

    if (!name || !email || !message) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const errorBox  = document.getElementById('form-error');
    const successBox = document.getElementById('form-success');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending…';
    if (errorBox) errorBox.style.display = 'none';

    try {
      const res = await fetch('/api/contact/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation: {
            messages_attributes: [{ body: message }],
            data: {
              __gd_contact_form_title: 'Contact',
              'Inquiry type': inquiry,
            },
          },
          user: { email, name },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Something went wrong');

      form.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = '⚠ ' + (err.message || 'Something went wrong. Please try again.');
        errorBox.style.display = 'flex';
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = '&#9658; Send message';
    }
  });

  // Reset button
  const resetBtn = document.getElementById('reset-form');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      document.getElementById('form-success').style.display = 'none';
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    });
  }
})();
