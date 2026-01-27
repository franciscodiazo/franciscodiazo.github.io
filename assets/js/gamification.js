(function(){
  // Gamification helpers for 11-3
  const monthNames = { 'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,'julio':6,'agosto':7,'septiembre':8,'octubre':9,'noviembre':10,'diciembre':11 };

  function parseBirthday(dateStr){
    if (!dateStr) return null;
    const parts = dateStr.trim().toLowerCase().split(' de ');
    const day = parseInt(parts[0],10);
    const month = monthNames[parts[1]] ?? 0;
    return { day, month };
  }

  window.parseBirthday = parseBirthday; // expose

  window.keyFor = function(b){ return `${(b.last||'').trim()}|${(b.name||'').trim()}`; };

  window.saveXP = function(key, val){ try{ localStorage.setItem('11-3:xp:'+key, String(val)); }catch(e){ console.error('saveXP',e); } };
  window.loadXP = function(key){ try{ return parseInt(localStorage.getItem('11-3:xp:'+key)||'0',10); }catch(e){ return 0; } };

  window.nextOccurrence = function(dateStr, refDate){
    const d = parseBirthday(dateStr);
    if (!d) return null;
    const now = refDate ? new Date(refDate) : new Date();
    let cand = new Date(now.getFullYear(), d.month, d.day);
    // If birthday already happened this year, use next year
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (cand < todayOnly) cand = new Date(now.getFullYear()+1, d.month, d.day);
    return cand;
  };

  function daysUntil(date){ const now = new Date(); const diff = date - now; return Math.ceil(diff / (1000*60*60*24)); }

  window.updateBirthdayLeaderboard = function(leaderboardId){
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('11-3:xp:'));
    const arr = keys.map(k=>({ key: k.replace('11-3:xp:',''), xp: parseInt(localStorage.getItem(k)||'0',10) }));
    arr.sort((a,b)=>b.xp - a.xp);
    const el = document.getElementById(leaderboardId);
    if (!el) return;
    if (!arr.length) { el.innerHTML = '<div class="small text-muted">Sin datos aún</div>'; return; }
    el.innerHTML = arr.slice(0,8).map((a,i)=>`<div><strong>#${i+1}</strong> ${a.key} — <span class="badge bg-primary">${a.xp} XP</span></div>`).join('');
  };

  window.renderBirthdayWidget = async function(containerId, leaderboardId, config){
    const container = document.getElementById(containerId);
    if (!container) return;
    try{
      const r = await fetch('/11-3/data/birthdays.json');
      if (!r.ok){ container.innerHTML = '<div class="text-muted small">No se pudieron cargar cumpleaños.</div>'; return; }
      const data = await r.json();
      const today = new Date();
      data.forEach(b=>{ b.next = window.nextOccurrence(b.date, today); b.key = window.keyFor(b); b.xp = window.loadXP(b.key); });
      data.sort((a,b)=> a.next - b.next);
      container.innerHTML = '';
      data.forEach(b=>{
        const diffDays = Math.ceil((b.next - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / (1000*60*60*24));
        const d = window.parseBirthday(b.date);
        const hasPassed = (new Date(today.getFullYear(), d.month, d.day) < new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        const card = document.createElement('div'); card.className = 'col-12 mb-2';
        card.innerHTML = `
          <div class="resource-card d-flex align-items-center justify-content-between ${hasPassed? 'bg-success bg-opacity-10':''}">
            <div>
              <div class="fw-bold">${b.name}</div>
              <div class="small text-muted">${b.last} • ${b.date} • ${hasPassed? '<span class="text-success">Cumplió</span>':'<span class="text-warning text-dark">Pendiente</span>'}</div>
            </div>
            <div class="text-end">
              <div class="mb-1"><span class="xp-badge" data-key="${b.key}">${b.xp} 🎉</span></div>
              <button class="btn btn-sm btn-outline-primary wish-btn" data-key="${b.key}">🎉 Deseo +1</button>
              <div class="small text-muted mt-1">${hasPassed? '—':'En ' + diffDays + ' días'}</div>
            </div>
          </div>
        `;
        container.appendChild(card);
        const btn = card.querySelector('.wish-btn');
        btn.addEventListener('click', ()=>{ 
          const k = btn.getAttribute('data-key'); const xp = window.loadXP(k) + 1; window.saveXP(k,xp); 
          const xpEl = card.querySelector('.xp-badge'); if (xpEl) xpEl.textContent = xp + ' 🎉';
          if (window.giveBirthdayWish){ window.giveBirthdayWish({ name: b.name, last: b.last, date: b.date }, card); } else { window.launchConfetti(card); }
          window.updateBirthdayLeaderboard(leaderboardId);
        });
      });
      window.updateBirthdayLeaderboard(leaderboardId);
    }catch(e){ container.innerHTML = '<div class="text-muted small">Error cargando cumpleaños.</div>'; }
  };

  window.renderGradoCountdown = async function(countdownId, recessInfoId, config){
    const el = document.getElementById(countdownId);
    const info = document.getElementById(recessInfoId);
    try{
      const cfg = config || (await (await fetch('/11-3/data/config.json')).json());
      const grad = new Date(cfg.graduationDate + 'T00:00:00');
      function update(){
        const now = new Date(); const diff = grad - now;
        if (diff <= 0){ el.textContent = '¡Día de grado! 🎓'; if (info) info.textContent = ''; return; }
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff / (1000*60*60)) % 24);
        const minutes = Math.floor((diff / (1000*60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        // show nearest receso upcoming or whether we are in one
        if (info){
          const nowDate = new Date();
          const recess = (cfg.recesses || []).find(r=>{ const s = new Date(r.start); const e = new Date(r.end); return nowDate >= s && nowDate <= e; });
          if (recess) info.textContent = `Actualmente en: ${recess.name} — Bonificación activada`; else {
            // find upcoming
            const upcoming = (cfg.recesses || []).map(r=>({ ...r, startDate: new Date(r.start)})).filter(r=> r.startDate > nowDate).sort((a,b)=>a.startDate - b.startDate)[0];
            if (upcoming){ info.textContent = `Próximo receso: ${upcoming.name} (${upcoming.start} → ${upcoming.end})`; } else { info.textContent = ''; }
          }
        }
      }
      update(); setInterval(update,1000);
    }catch(e){ if (el) el.textContent = ''; if (info) info.textContent = ''; }
  };

  // Theme picker
  window.initThemePicker = function(pickerId){
    const root = document.getElementById(pickerId); if (!root) return;
    const applyTheme = (name)=>{
      document.body.classList.remove('theme-neon','theme-pastel','theme-retro','theme-space');
      document.body.classList.add('theme-'+name);
      localStorage.setItem('11-3:theme', name);
      root.querySelectorAll('.theme-btn').forEach(b=>b.setAttribute('aria-pressed', b.getAttribute('data-theme')===name ? 'true' : 'false'));
    };
    root.querySelectorAll('.theme-btn').forEach(b=>{
      b.addEventListener('click', ()=> applyTheme(b.getAttribute('data-theme')));
    });
    const stored = localStorage.getItem('11-3:theme') || 'neon'; applyTheme(stored);
  };

  // Student points persistence (per-student XP/points)
  window.loadStudentPoints = function(id){ try{ return parseInt(localStorage.getItem('11-3:student-points:'+id)||'0',10); }catch(e){ return 0; } };
  window.saveStudentPoints = function(id, val){ try{ localStorage.setItem('11-3:student-points:'+id, String(val)); }catch(e){ console.error('saveStudentPoints',e); } };
  window.awardStudentPoints = function(id, val){ try{ const current = window.loadStudentPoints(id) || 0; const next = current + Math.max(0, parseInt(val,10)||0); window.saveStudentPoints(id, next); return next; }catch(e){ console.error('awardStudentPoints',e); return 0; } };

  // Auto init
  document.addEventListener('DOMContentLoaded', function(){
    try{ window.renderBirthdayWidget && window.renderBirthdayWidget('birthday-grid','birthday-leaderboard-list'); }catch(e){}
    try{ window.renderGradoCountdown && window.renderGradoCountdown('grado-countdown','recess-info'); }catch(e){}
    try{ window.updateBirthdayLeaderboard && window.updateBirthdayLeaderboard('birthday-leaderboard-list'); }catch(e){}
    try{ window.initThemePicker && window.initThemePicker('theme-picker'); }catch(e){}
  });

})();
