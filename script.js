/* =========================================================
   NexaWeb — interactions
   JavaScript natif, aucune dépendance.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  };

  /* ---------- Thème ---------- */
  const metaTheme = $('meta[name="theme-color"]');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    metaTheme.setAttribute('content', t === 'dark' ? '#0f0f0e' : '#f4f1ea');
  };
  applyTheme(root.dataset.theme);
  $('.theme-toggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('nexa-theme', next);
    toast(next === 'dark' ? 'Mode sombre activé 🌙' : 'Mode clair activé ☀️');
  });

  /* ---------- Navigation ---------- */
  const nav = $('.nav');
  const burger = $('.burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Lien actif selon la section visible
  const navLinks = $$('.nav__links a[href^="#"]:not(.nav__cta-mobile)');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.hash); if (s) spy.observe(s); });

  /* ---------- Scroll : progression, nav, retour en haut ---------- */
  const progress = $('.progress span');
  const toTop = $('.to-top');
  let ticking = false;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    const y = scrollY;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle('is-scrolled', y > 10);
    toTop.classList.toggle('is-visible', y > innerHeight);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Apparition au scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => {
    // décalage en cascade entre éléments frères
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 5) * 80}ms`);
    revealObs.observe(el);
  });

  /* ---------- Compteurs ---------- */
  const formatNum = (n, decimals) => n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();
      const step = (now) => {
        const t = duration ? Math.min((now - start) / duration, 1) : 1;
        const eased = 1 - Math.pow(1 - t, 4);
        el.innerHTML = formatNum(target * eased, decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- Playground du hero ---------- */
  const pg = $('.playground');
  const codeView = $('#code-view');
  const ctl = { hue: $('#ctl-hue'), radius: $('#ctl-radius'), space: $('#ctl-space') };
  let tab = 'html';
  let clicks = 0;
  let changed = '';

  const sp = (cls, txt) => `<span class="${cls}">${txt}</span>`;
  const val = (key, txt) => (changed === key ? `<span class="hl">${txt}</span>` : txt);
  const views = {
    html: () => [
      sp('c', '&lt;!-- Une carte, rien de plus --&gt;'),
      `${sp('t', '&lt;article')} ${sp('a', 'class')}=${sp('s', '"card"')}${sp('t', '&gt;')}`,
      `  ${sp('t', '&lt;span')} ${sp('a', 'class')}=${sp('s', '"tag"')}${sp('t', '&gt;')}Nouveau${sp('t', '&lt;/span&gt;')}`,
      `  ${sp('t', '&lt;h3&gt;')}Votre marque, en ligne.${sp('t', '&lt;/h3&gt;')}`,
      `  ${sp('t', '&lt;p&gt;')}Rapide. Lisible.${sp('t', '&lt;/p&gt;')}`,
      `  ${sp('t', '&lt;button')} ${sp('a', 'id')}=${sp('s', '"btn"')}${sp('t', '&gt;')}`,
      `    Cliquez-moi`,
      `  ${sp('t', '&lt;/button&gt;')}`,
      `${sp('t', '&lt;/article&gt;')}`,
    ],
    css: () => [
      `${sp('k', ':root')} {`,
      `  ${sp('a', '--hue')}: ${sp('n', val('hue', ctl.hue.value))};`,
      `  ${sp('a', '--radius')}: ${sp('n', val('radius', ctl.radius.value + 'px'))};`,
      `  ${sp('a', '--space')}: ${sp('n', val('space', ctl.space.value + 'px'))};`,
      `}`,
      `${sp('t', '.card')} {`,
      `  ${sp('a', 'padding')}: ${sp('k', 'var')}(--space);`,
      `  ${sp('a', 'border-radius')}: ${sp('k', 'var')}(--radius);`,
      `}`,
      `${sp('t', '.card button')} {`,
      `  ${sp('a', 'background')}: ${sp('k', 'hsl')}(${sp('k', 'var')}(--hue) 90% 55%);`,
      `}`,
    ],
    js: () => [
      sp('c', '// Zéro dépendance. Zéro build.'),
      `${sp('k', 'const')} btn = document.${sp('n', 'querySelector')}(${sp('s', "'#btn'")});`,
      `${sp('k', 'let')} count = ${sp('n', '0')};`,
      ``,
      `btn.${sp('n', 'addEventListener')}(${sp('s', "'click'")}, () =&gt; {`,
      `  btn.dataset.count = ++count;`,
      `});`,
      ``,
      sp('c', `// clics enregistrés : ${val('clicks', String(clicks))}`),
    ],
  };
  const renderCode = () => { codeView.innerHTML = views[tab]().join('\n'); };
  const applyVars = () => {
    pg.style.setProperty('--h', ctl.hue.value);
    pg.style.setProperty('--r', ctl.radius.value + 'px');
    pg.style.setProperty('--s', ctl.space.value + 'px');
  };

  $$('.tabs button', pg).forEach((btn) => {
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      changed = '';
      $$('.tabs button', pg).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      renderCode();
    });
  });
  Object.entries(ctl).forEach(([key, input]) => {
    input.addEventListener('input', () => {
      changed = key;
      applyVars();
      if (tab !== 'css') {
        tab = 'css';
        $$('.tabs button', pg).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === 'css')));
      }
      renderCode();
    });
  });
  const pvCount = $('#pv-count');
  $('#pv-btn').addEventListener('click', () => {
    clicks += 1;
    pvCount.textContent = clicks;
    pvCount.classList.remove('bump');
    void pvCount.offsetWidth;
    pvCount.classList.add('bump');
    changed = 'clicks';
    if (tab !== 'js') {
      tab = 'js';
      $$('.tabs button', pg).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === 'js')));
    }
    renderCode();
  });
  applyVars();
  renderCode();

  /* ---------- Survol des services (position du curseur) ---------- */
  $$('.service').forEach((card) => {
    card.addEventListener('pointerenter', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Comparateur de poids ---------- */
  const meter = $('#meter');
  const sw = $('.switch');
  const totals = { framework: '1,6 Mo', nexa: '42 Ko' };
  const setStack = (stack) => {
    meter.dataset.state = stack;
    sw.dataset.state = stack;
    $$('button', sw).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.stack === stack)));
    $$('.bar i', meter).forEach((bar) => {
      bar.style.transform = `scaleX(${(stack === 'nexa' ? bar.dataset.nx : bar.dataset.fw) / 100})`;
    });
    $$('b', meter).forEach((b) => { b.textContent = stack === 'nexa' ? b.dataset.nx : b.dataset.fw; });
    $('#meter-total').textContent = totals[stack];
  };
  $$('button', sw).forEach((b) => b.addEventListener('click', () => setStack(b.dataset.stack)));
  // On démarre côté framework, puis on bascule quand la section devient visible
  setStack('framework');
  const meterObs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setTimeout(() => setStack('nexa'), reduceMotion ? 0 : 900);
      meterObs.disconnect();
    }
  }, { threshold: 0.5 });
  meterObs.observe(meter);

  /* ---------- Réalisations ---------- */
  const projects = [
    { title: 'Atelier Ndiaye', cat: 'vitrine', catLabel: 'Site vitrine', year: '2026', bg: '#c8553d', fg: '#2b1d17', h: 'Le bois, <em>travaillé</em> à la main.', desc: "Site vitrine pour une menuiserie artisanale de Thiès : galerie de meubles sur-mesure, prise de rendez-vous et demande de devis par WhatsApp.", stats: [['+112 %', 'demandes de devis'], ['0,4 s', 'chargement'], ['100', 'Lighthouse']], size: 'is-wide' },
    { title: 'Festival Saint-Louis Jazz', cat: 'landing', catLabel: 'Landing page', year: '2026', bg: '#3d5afe', fg: '#0d1440', h: 'Quatre nuits de <em>jazz</em>.', desc: "Landing page événementielle avec compte à rebours, programmation filtrable et billetterie intégrée pour un festival de musique à Saint-Louis.", stats: [['18 k', 'visiteurs / jour'], ['31 Ko', 'poids total'], ['8,7 %', 'conversion']], size: 'is-narrow' },
    { title: 'Teranga Couture', cat: 'vitrine', catLabel: 'Site vitrine', year: '2025', bg: '#2f7a5b', fg: '#0f2a1f', h: 'Le wax, <em>sur-mesure</em>.', desc: "Site vitrine d'un atelier de couture à Dakar : lookbook des collections en wax et bazin, prise de mesures en ligne et mode sombre.", stats: [['6', 'pages'], ['0,5 s', 'chargement'], ['AA', 'accessibilité']], size: 'is-narrow' },
    { title: 'Boulangerie Médina', cat: 'refonte', catLabel: 'Refonte', year: '2025', bg: '#e9b44c', fg: '#3a2a06', h: 'Le pain <em>du quartier</em>.', desc: "Refonte complète du site d'une boulangerie-pâtisserie de la Médina : passage d'un WordPress de 3 Mo à un site statique de 48 Ko, deux fois plus visité.", stats: [['−98 %', 'de poids'], ['×2', 'trafic'], ['A', 'éco-index']], size: 'is-wide' },
    { title: 'Casamance Anacarde', cat: 'landing', catLabel: 'Landing page', year: '2025', bg: '#141414', fg: '#ff5a1f', h: "L'anacarde, <em>de Ziguinchor</em>.", desc: "Page de lancement pour une coopérative de noix de cajou de Casamance : catalogue export, calculateur de commande en JavaScript natif et précommande.", stats: [['1 200', 'précommandes'], ['22 Ko', 'de JS'], ['99', 'Lighthouse']], size: 'is-wide' },
    { title: 'Cabinet Diallo', cat: 'refonte', catLabel: 'Refonte', year: '2024', bg: '#8e6c8a', fg: '#2a1b29', h: 'Le droit, <em>clairement</em>.', desc: "Refonte du site d'un cabinet d'avocats du Plateau à Dakar : contenus réécrits, prise de contact simplifiée, référencement local renforcé.", stats: [['+64 %', 'appels'], ['Top 3', 'Google local'], ['0,6 s', 'chargement']], size: 'is-narrow' },
  ];

  const mockHTML = (p) => `
    <span class="mock" style="--fg:${p.fg};--bg:${p.bg}">
      <span class="mock__bar"><span class="mock__logo"></span><span class="mock__links"><i></i><i></i><i></i></span></span>
      <span class="mock__h">${p.h}</span>
      <span class="mock__row"><i></i><i></i><i></i></span>
    </span>`;

  const grid = $('#work-grid');
  const empty = $('#work-empty');
  const renderProjects = (filter) => {
    const list = projects.filter((p) => filter === 'all' || p.cat === filter);
    grid.innerHTML = list.map((p, i) => `
      <button type="button" class="project ${filter === 'all' ? p.size : ''}" style="--i:${i}" data-id="${projects.indexOf(p)}" aria-label="Voir le projet ${p.title}">
        <span class="project__visual" style="--bg:${p.bg}">${mockHTML(p)}<span class="project__cta">Voir le projet ↗</span></span>
        <span class="project__meta"><strong>${p.title}</strong><span>${p.catLabel} · ${p.year}</span></span>
      </button>`).join('');
    empty.hidden = list.length > 0;
  };
  $$('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filters button').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderProjects(btn.dataset.filter);
    });
  });
  renderProjects('all');

  const modal = $('#project-modal');
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.project');
    if (!card) return;
    const p = projects[card.dataset.id];
    $('#modal-visual').style.setProperty('--bg', p.bg);
    $('#modal-visual').innerHTML = mockHTML(p);
    $('#modal-cat').textContent = `${p.catLabel} · ${p.year}`;
    $('#modal-title').textContent = p.title;
    $('#modal-desc').textContent = p.desc;
    $('#modal-stats').innerHTML = p.stats.map(([v, l]) => `<li><strong>${v}</strong><span>${l}</span></li>`).join('');
    modal.showModal();
  });
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === modal) modal.close();
  });

  /* ---------- Témoignages ---------- */
  const stage = $('.quotes__stage');
  const quotes = $$('.quote', stage);
  const dotsWrap = $('.quotes__dots', stage);
  const DURATION = 7000;
  let current = 0;
  let timer;
  quotes.forEach((q, i) => {
    q.setAttribute('aria-hidden', String(i !== 0));
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Témoignage ${i + 1}`);
    d.setAttribute('aria-selected', String(i === 0));
    d.style.setProperty('--dur', `${DURATION}ms`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  const dots = $$('button', dotsWrap);
  const goTo = (i) => {
    const next = (i + quotes.length) % quotes.length;
    if (next === current) return;
    const prev = quotes[current];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('aria-hidden', 'true');
    setTimeout(() => prev.classList.remove('is-leaving'), 600);
    quotes[next].classList.add('is-active');
    quotes[next].setAttribute('aria-hidden', 'false');
    dots.forEach((d, j) => d.setAttribute('aria-selected', String(j === next)));
    current = next;
    restart();
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => goTo(current + 1), DURATION);
  };
  $$('[data-dir]', stage).forEach((b) => b.addEventListener('click', () => goTo(current + Number(b.dataset.dir))));
  stage.addEventListener('pointerenter', () => { clearInterval(timer); stage.classList.add('is-paused'); });
  stage.addEventListener('pointerleave', () => { stage.classList.remove('is-paused'); restart(); });
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });
  restart();

  /* ---------- Tarifs ---------- */
  const billing = $('#billing-toggle');
  billing.addEventListener('click', () => {
    const monthly = billing.getAttribute('aria-checked') !== 'true';
    billing.setAttribute('aria-checked', String(monthly));
    $('#lbl-once').classList.toggle('is-on', !monthly);
    $('#lbl-monthly').classList.toggle('is-on', monthly);
    $$('.plan__price').forEach((price) => {
      const amount = $('.amount', price);
      const unit = $('.unit', price);
      const key = monthly ? 'monthly' : 'once';
      amount.classList.remove('flip');
      void amount.offsetWidth;
      amount.classList.add('flip');
      setTimeout(() => {
        amount.textContent = amount.dataset[key];
        unit.textContent = unit.dataset[key];
      }, reduceMotion ? 0 : 200);
    });
  });
  // Pré-sélection de la formule dans le formulaire
  $$('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const radio = $(`input[name="plan"][value="${btn.dataset.plan}"]`);
      if (radio) radio.checked = true;
      toast(`Formule ${btn.dataset.plan} sélectionnée`);
    });
  });

  /* ---------- Formulaire de contact (Netlify Forms) ---------- */
  const form = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const statusEl = $('#form-status');
  const success = $('#form-success');
  const msg = $('#f-message');
  const msgCount = $('#msg-count');

  msg.addEventListener('input', () => { msgCount.textContent = msg.value.length; });

  const messages = {
    name: { valueMissing: 'Indiquez votre nom.', tooShort: 'Votre nom semble un peu court.' },
    email: { valueMissing: 'Indiquez votre adresse email.', typeMismatch: "Cette adresse email n'est pas valide." },
    message: { valueMissing: 'Dites-nous quelques mots sur votre projet.', tooShort: 'Encore un petit effort : 20 caractères minimum.' },
  };
  const validateField = (input) => {
    const field = input.closest('.field');
    const err = $('.field__error', field);
    const rules = messages[input.name] || {};
    let text = '';
    if (input.validity.valueMissing) text = rules.valueMissing;
    else if (input.validity.typeMismatch) text = rules.typeMismatch;
    else if (input.validity.tooShort) text = rules.tooShort;
    err.textContent = text || '';
    field.classList.toggle('is-invalid', Boolean(text));
    field.classList.toggle('is-valid', !text && input.value.trim() !== '');
    input.setAttribute('aria-invalid', String(Boolean(text)));
    return !text;
  };
  const validated = ['name', 'email', 'message'].map((n) => form.elements[n]);
  validated.forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('is-invalid')) validateField(input); });
  });
  const consent = form.elements.consent;
  const consentErr = $('.field__error--consent');
  consent.addEventListener('change', () => { if (consent.checked) consentErr.textContent = ''; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    const results = validated.map(validateField);
    const consentOk = consent.checked;
    consentErr.textContent = consentOk ? '' : 'Merci de cocher cette case pour que nous puissions vous répondre.';
    if (results.includes(false) || !consentOk) {
      const firstBad = validated[results.indexOf(false)] || consent;
      firstBad.focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    $('.btn__label', submitBtn).textContent = 'Envoi en cours…';
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      $('#success-name').textContent = form.elements.name.value.trim().split(' ')[0];
      success.hidden = false;
      success.focus();
    } catch (err) {
      statusEl.textContent = "Oups, l'envoi a échoué. Vérifiez votre connexion ou écrivez-nous à bonjour@nexaweb.com.";
    } finally {
      submitBtn.classList.remove('is-loading');
      $('.btn__label', submitBtn).textContent = 'Envoyer ma demande';
    }
  });

  $('#form-reset').addEventListener('click', () => {
    form.reset();
    msgCount.textContent = '0';
    $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
    success.hidden = true;
    form.elements.name.focus();
  });

  /* ---------- Divers ---------- */
  $('#year').textContent = new Date().getFullYear();
})();