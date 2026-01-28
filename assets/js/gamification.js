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

  // Group birthdays by month and render an accessible month-list view
  window.renderBirthdaysByMonth = async function(containerId, leaderboardId){
    const container = document.getElementById(containerId);
    if (!container) return;
    try{
      const r = await fetch('/11-3/data/birthdays.json');
      if (!r.ok){ container.innerHTML = '<div class="text-muted small">No se pudieron cargar cumpleaños.</div>'; return; }
      const data = await r.json();
      // Normalize entries
      data.forEach(b=>{ b.meta = window.parseBirthday(b.date); b.key = window.keyFor(b); b.xp = window.loadXP ? window.loadXP(b.key) : 0; b.next = window.nextOccurrence(b.date); });
      // Group by month number
      const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const groups = {};
      data.forEach(b=>{
        const m = (b.meta && typeof b.meta.month === 'number') ? b.meta.month : 0;
        if (!groups[m]) groups[m] = [];
        groups[m].push(b);
      });
      // expose last computed groups for bulk operations (used by wishAllForMonth)
      window.lastBirthdaysGroups = groups;

      // Bulk wish: give +1 XP to every student in a month, update badges and leaderboard
      window.wishAllForMonth = async function(monthIndex, containerEl, leaderboardId){
        try{
          const groupsLocal = window.lastBirthdaysGroups || {};
          const list = groupsLocal[monthIndex] || [];
          if (!list.length) return;
          // apply +1 XP per person
          for (const b of list){
            try{
              const key = b.key || window.keyFor(b);
              const prev = window.loadXP ? window.loadXP(key) : 0;
              const next = (prev || 0) + 1;
              if (window.saveXP) window.saveXP(key, next);
              // update any visible xp badges
              const xpEl = document.querySelector(`.xp-badge[data-key="${key}"]`);
              if (xpEl) xpEl.textContent = next + ' 🎉';
            }catch(e){ console.error('wishAll single', e); }
          }
          // announce
          const ann = document.getElementById('birthday-announce'); if (ann){ ann.textContent = `Se enviaron deseos a ${list.length} estudiantes de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][monthIndex]}.`; }
          if (window.launchConfetti) window.launchConfetti(containerEl || document.body);
          if (window.updateBirthdayLeaderboard) window.updateBirthdayLeaderboard(leaderboardId);
          // offer to sync immediately
          try{
            if (confirm('¿Deseas sincronizar ahora los puntos al repositorio (disparar workflow)?')){
              if (window.triggerPointsSync) await window.triggerPointsSync();
            }
          }catch(e){}
        }catch(e){ console.error('wishAllForMonth', e); }
      };

      // Trigger points sync: gathers local student points and calls configured serverless endpoint
      window.SYNC_ENDPOINT = window.SYNC_ENDPOINT || '/.netlify/functions/trigger-sync';
      window.triggerPointsSync = async function(endpoint, opts){
        const url = endpoint || window.SYNC_ENDPOINT;
        const keys = Object.keys(localStorage).filter(k=>k.startsWith('11-3:student-points:'));
        const payload = {};
        keys.forEach(k=>{ const id = k.replace('11-3:student-points:',''); payload[id] = parseInt(localStorage.getItem(k)||'0',10); });
        if (!Object.keys(payload).length) { alert('No hay puntos locales para sincronizar.'); return; }
        try{
          const headers = { 'Content-Type': 'application/json' };
          if (opts && opts.syncSecret) headers['x-sync-secret'] = opts.syncSecret;
          const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ points: payload }) });
          if (!res.ok) { const txt = await res.text(); throw new Error(txt || res.statusText); }
          alert('Solicitud enviada al servicio de sincronización. Revisa la ejecución en GitHub Actions.');
        }catch(e){ console.error('triggerPointsSync', e); alert('Error sincronizando: ' + (e.message||e)); }
      };
      // Sort months by next occurrence from today (so upcoming months first)
      const now = new Date();
      const monthOrder = Object.keys(groups).map(n=>parseInt(n,10)).sort((a,b)=>{
        // compare by first upcoming date in that month
        const dateA = groups[a].reduce((min,x)=> x.next < min ? x.next : min, groups[a][0].next);
        const dateB = groups[b].reduce((min,x)=> x.next < min ? x.next : min, groups[b][0].next);
        return dateA - dateB;
      });

      container.innerHTML = '';
      monthOrder.forEach((m, idx)=>{
        const monthDiv = document.createElement('section'); monthDiv.className = 'birthday-month mb-3';
        const header = document.createElement('div'); header.className = 'month-header d-flex align-items-center justify-content-between p-2 rounded';
        header.innerHTML = `<div><strong>${months[m]}</strong> <small class="text-muted">(${groups[m].length})</small></div><div><button class="btn btn-sm btn-outline-danger month-wish-all me-2" title="Desear feliz cumpleaños a todo el mes">🎊 Deseo a todos</button><button class="btn btn-sm btn-outline-secondary month-toggle" aria-expanded="true">Ocultar</button></div>`;
        monthDiv.appendChild(header);
        const grid = document.createElement('div'); grid.className = 'month-grid mt-2 row g-2';
        // bind "Deseo a todos" action
        const wishBtn = header.querySelector('.month-wish-all');
        if (wishBtn){
          wishBtn.addEventListener('click', async function(){
            try{
              this.setAttribute('disabled','');
              const confirmMsg = `¿Deseas enviar un deseo a los ${groups[m].length} estudiantes de ${months[m]}? Esto otorgará +1 XP a cada uno.`;
              if (!confirm(confirmMsg)){ this.removeAttribute('disabled'); return; }
              await window.wishAllForMonth(m, grid, leaderboardId);
            }catch(e){ console.error(e); } finally { this.removeAttribute('disabled'); }
          });
        }
        groups[m].sort((a,b)=> a.meta.day - b.meta.day).forEach(b=>{
          const col = document.createElement('div'); col.className = 'col-12';
          const isToday = (new Date().toDateString() === b.next.toDateString());
          col.innerHTML = `
            <div class="resource-card d-flex align-items-center justify-content-between ${isToday? 'birthday-today':''}">
              <div class="d-flex align-items-center">
                <div class="me-3 avatar-sm">${b.avatar? `<img src="${b.avatar}" alt="${b.name}" class="rounded-circle" width="44" height="44">` : b.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div>
                  <div class="fw-bold">${b.name} ${b.last}</div>
                  <div class="small text-muted">${b.date} • ${isToday? 'Hoy 🎂' : 'En ' + Math.ceil((b.next - new Date(now.getFullYear(), now.getMonth(), now.getDate()))/(1000*60*60*24)) + ' días'}</div>
                </div>
              </div>
              <div class="text-end">
                <div class="mb-1"><span class="xp-badge" data-key="${b.key}">${b.xp} 🎉</span></div>
                <button class="btn btn-sm btn-outline-primary wish-btn" data-key="${b.key}">🎉 Deseo</button>
              </div>
            </div>
          `;
          grid.appendChild(col);
          // bind wish button
          const btn = col.querySelector('.wish-btn');
          btn.addEventListener('click', ()=>{ try{ window.giveBirthdayWish && window.giveBirthdayWish(b, col); window.updateBirthdayLeaderboard && window.updateBirthdayLeaderboard(leaderboardId); btn.setAttribute('disabled',''); btn.textContent='Enviado'; setTimeout(()=>{ btn.removeAttribute('disabled'); btn.textContent='🎉 Deseo'; },1200);}catch(e){console.error(e);} });
        });
        monthDiv.appendChild(grid);
        // collapse behavior
        header.querySelector('.month-toggle').addEventListener('click', function(){ const expanded = this.getAttribute('aria-expanded') === 'true'; this.setAttribute('aria-expanded', String(!expanded)); this.textContent = expanded ? 'Mostrar' : 'Ocultar'; grid.classList.toggle('d-none'); });
        container.appendChild(monthDiv);
      });
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
