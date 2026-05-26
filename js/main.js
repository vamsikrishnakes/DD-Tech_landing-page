/* ─────────────────────────────────────────────────────────────────────────
   DD Tech Academy — Shared JavaScript  (js/main.js)
───────────────────────────────────────────────────────────────────────── */

/* ── Tab System ─────────────────────────────────────────────────────────── */
function openTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('tab-' + id);
  if (panel) panel.classList.add('active');
  const labelMap = {
    'data-analyst':'data analyst','sql':'sql','power-bi':'power bi',
    'etl':'etl concepts','snowflake':'snowflake','azure':'azure de',
    'databricks':'databricks','it-audit':'it audit'
  };
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.textContent.trim().toLowerCase() === (labelMap[id] || id))
      btn.classList.add('active');
  });
  const s = document.getElementById('curriculum');
  if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
}

/* ── Mobile Nav ─────────────────────────────────────────────────────────── */
function toggleNav() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('open');
}

/* ── Enroll Modal ───────────────────────────────────────────────────────── */
function openEnrollModal(course) {
  const modal = document.getElementById('enrollModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (course) {
    const sel = document.getElementById('f-course');
    if (sel) {
      for (let o of sel.options) {
        if (o.text === course) { sel.value = o.value; break; }
      }
    }
  }
}

function closeEnrollModal() {
  const modal = document.getElementById('enrollModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  resetModal();
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('enrollModal')) closeEnrollModal();
}

function resetModal() {
  const f = document.getElementById('enrollForm');   if (f) f.reset();
  const s = document.getElementById('modalSuccess'); if (s) s.classList.remove('show');
  const l = document.getElementById('modalLeft');    if (l) l.style.display = '';
  const fp= document.getElementById('modalForm');    if (fp) fp.style.display = '';
  document.querySelectorAll('.err-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.form-group input,.form-group select').forEach(el => el.classList.remove('error'));
}

/* ── Validation ─────────────────────────────────────────────────────────── */
function validateFields() {
  let valid = true;
  const get = id => document.getElementById(id);
  const name=get('f-name'), email=get('f-email'), phone=get('f-phone'),
        course=get('f-course'), exp=get('f-exp'), terms=get('f-terms');
  const show=(id,el)=>{ get(id).classList.add('show'); if(el) el.classList.add('error'); valid=false; };
  const hide=(id,el)=>{ get(id).classList.remove('show'); if(el) el.classList.remove('error'); };

  name.value.trim().length < 2
    ? show('err-name',name)   : hide('err-name',name);
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
    ? show('err-email',email) : hide('err-email',email);
  !/^\d{7,15}$/.test(phone.value.replace(/\D/g,''))
    ? show('err-phone',phone) : hide('err-phone',phone);
  !course.value ? show('err-course',course) : hide('err-course',course);
  !exp.value    ? show('err-exp',exp)       : hide('err-exp',exp);
  if (!terms.checked) { show('err-terms',null); }
  else                { hide('err-terms',null); }

  return valid;
}

/* ── AJAX Form Submission ────────────────────────────────────────────────── */
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateFields()) return;

  const form = e.target;
  const btn  = document.getElementById('submitBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Sending…'; }

  try {
    /* FormSubmit AJAX endpoint — CORS-enabled, returns JSON, no page redirect */
    const res = await Promise.race([
      fetch('https://formsubmit.co/ajax/vamsikrishnakesari@gmail.com', {
        method : 'POST',
        headers: { 'Accept': 'application/json' },
        body   : new FormData(form)
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 12000))
    ]);

    const json = await res.json();

    if (json.success === 'true' || json.success === true) {
      /* ── Decide which success UI to show ── */
      const overlay = document.getElementById('enrollModal');
      const isModalOpen = overlay && overlay.classList.contains('open');

      if (isModalOpen) {
        /* Modal form → reveal modal success panel */
        const l  = document.getElementById('modalLeft');
        const fp = document.getElementById('modalForm');
        const s  = document.getElementById('modalSuccess');
        if (l)  l.style.display  = 'none';
        if (fp) fp.style.display = 'none';
        if (s)  s.classList.add('show');
      } else {
        /* Inline / contact-page form → replace card with success message */
        showInlineSuccess(form);
      }
    } else {
      throw new Error('Server returned failure');
    }

  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Enroll for Free'; }
    const msg = err.message === 'timeout'
      ? 'Request timed out. Please call us directly at 8688563751.'
      : 'Something went wrong. Please try again or call 8688563751.';
    alert(msg);
  }
}

/* ── Inline success (contact page) ──────────────────────────────────────── */
function showInlineSuccess(form) {
  const card = form.closest('.form-card') || form.parentElement;
  if (!card) return;
  card.innerHTML = `
    <div style="text-align:center;padding:48px 20px;">
      <div style="width:90px;height:90px;border-radius:50%;
           background:linear-gradient(135deg,#22c55e,#16a34a);
           display:flex;align-items:center;justify-content:center;
           margin:0 auto 24px;font-size:40px;
           animation:popIn .4s cubic-bezier(.175,.885,.32,1.275)">✓</div>
      <h3 style="font-size:24px;font-weight:900;color:#1a2a5e;margin-bottom:10px;">
        You're All Set! 🎉</h3>
      <p style="font-size:14px;color:#6b7280;line-height:1.7;margin-bottom:28px;">
        Thank you for enrolling with <strong>DD Tech Academy</strong>.<br>
        Our team will reach out within <strong>24 hours</strong> to confirm your seat.</p>
      <a href="index.html"
         style="display:inline-block;background:#f5a623;color:#fff;border-radius:10px;
                padding:13px 32px;font-weight:700;font-size:14px;text-decoration:none;">
        Back to Home</a>
    </div>`;
}

/* ── DOMContentLoaded ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Hash-based tab activation (links like courses.html#tab-azure) */
  if (window.location.hash.startsWith('#tab-')) {
    openTab(window.location.hash.replace('#tab-', ''));
  }

  /* Scroll-reveal */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.prog-card,.why-item,.join-card,.contact-card,.stat-item,.curr-item'
  ).forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition= 'opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });

});

/* Escape closes modal */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEnrollModal(); });
