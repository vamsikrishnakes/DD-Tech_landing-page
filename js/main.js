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

function validateEnrollForm() {
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
  else { hide('err-terms',null); }

  if (!valid) return false;
  const btn = get('submitBtn');
  if (btn) { btn.disabled=true; btn.textContent='⏳ Sending…'; }
  return true;
}

/* ── DOMContentLoaded ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Set FormSubmit _next redirect URL */
  const ni = document.getElementById('f-next');
  if (ni) ni.value = window.location.origin + window.location.pathname + '?enrolled=true';

  /* Show success modal after FormSubmit redirect */
  if (window.location.search.includes('enrolled=true')) {
    history.replaceState({}, '', window.location.pathname);
    openEnrollModal();
    setTimeout(() => {
      const l=document.getElementById('modalLeft'), fp=document.getElementById('modalForm');
      if (l)  l.style.display  = 'none';
      if (fp) fp.style.display = 'none';
      const s = document.getElementById('modalSuccess');
      if (s)  s.classList.add('show');
    }, 100);
  }

  /* Hash-based tab activation (for links from other pages like courses.html#tab-azure) */
  if (window.location.hash.startsWith('#tab-')) {
    openTab(window.location.hash.replace('#tab-',''));
  }

  /* Scroll-reveal animation */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity    = '1';
        e.target.style.transform  = 'translateY(0)';
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

/* Escape key closes modal */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEnrollModal(); });
