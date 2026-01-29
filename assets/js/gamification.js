(function(){
  const monthNames = { 'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,'julio':6,'agosto':7,'septiembre':8,'octubre':9,'noviembre':10,'diciembre':11 };
  function parseBirthday(dateStr){ if (!dateStr) return null; const parts = dateStr.trim().toLowerCase().split(' de '); return { day: parseInt(parts[0],10), month: monthNames[parts[1]]||0 }; }
  window.parseBirthday = parseBirthday;
  window.nextOccurrence = function(dateStr, ref){ const d=parseBirthday(dateStr); if(!d) return null; const now = ref?new Date(ref):new Date(); let cand = new Date(now.getFullYear(), d.month, d.day); const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()); if (cand < todayOnly) cand = new Date(now.getFullYear()+1, d.month, d.day); return cand; };

  window.saveXP = function(key,val){ try{ localStorage.setItem('11-3:xp:'+key, String(val)); }catch(e){} };
  window.loadXP = function(key){ try{ return parseInt(localStorage.getItem('11-3:xp:'+key)||'0',10); }catch(e){return 0;} };

  window.updateBirthdayLeaderboard = function(leaderboardId){ const el = document.getElementById(leaderboardId); if(!el) return; const keys = Object.keys(localStorage).filter(k=>k.startsWith('11-3:xp:')); const arr = keys.map(k=>({ key:k.replace('11-3:xp:',''), xp: parseInt(localStorage.getItem(k)||'0',10) })); arr.sort((a,b)=>b.xp-a.xp); el.innerHTML = arr.length? arr.slice(0,6).map((a,i)=>`<div><strong>#${i+1}</strong> ${a.key} — <span class="badge bg-primary">${a.xp} XP</span></div>`).join('') : '<div class="small text-muted">Aún sin datos</div>'; };

  window.renderBirthdaysByMonth = async function(containerId, leaderboardId){
    const container = document.getElementById(containerId);
    if(!container) return;
    try{
      const r = await fetch('/11-3/data/birthdays.json');
      if(!r.ok){ container.innerHTML = '<div class="small text-muted">No se pudieron cargar cumpleaños</div>'; return; }
      const data = await r.json();
      // normalize
      data.forEach(b=>{ b.meta = parseBirthday(b.date); b.key = (b.last||'')+'|'+(b.name||''); b.xp = window.loadXP(b.key); b.next = window.nextOccurrence(b.date); });
      const groups = {};
      data.forEach(b=>{ const m = b.meta.month; if (!groups[m]) groups[m]=[]; groups[m].push(b); });
      const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      container.innerHTML = '';
      // Accessible accordion-like list by month
      Object.keys(groups).sort((a,b)=>a-b).forEach((m, idx)=>{
        const list = groups[m].sort((a,b)=> a.meta.day - b.meta.day || a.name.localeCompare(b.name));
        const monthId = `month-${m}`;
        const header = document.createElement('div'); header.className = 'month-header d-flex align-items-center justify-content-between p-2 rounded';
        header.innerHTML = `<div><strong>${months[m]}</strong> <small class="text-muted">(${list.length})</small></div><div class="d-flex gap-2"><button class="btn btn-sm btn-outline-primary month-wish-all" data-month="${m}" aria-label="Desear a todos en ${months[m]}">🎊 Deseo a todos</button><button class="btn btn-sm btn-outline-secondary month-toggle" aria-expanded="true" aria-controls="${monthId}">Ocultar</button></div>`;

        const panel = document.createElement('div'); panel.className = 'month-panel mt-2'; panel.id = monthId; panel.setAttribute('role','region'); panel.setAttribute('aria-labelledby', monthId+'-label');
        // render list
        const listEl = document.createElement('div'); listEl.className = 'list-group';
        list.forEach(b=>{
          const isToday = (new Date().toDateString() === b.next.toDateString());
          const item = document.createElement('div'); item.className = 'list-group-item d-flex align-items-center justify-content-between';
          item.setAttribute('role','listitem');
          item.innerHTML = `
            <div class="d-flex align-items-center" style="gap:0.75rem">
              <div class="avatar-sm" aria-hidden="true">${b.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
              <div>
                <div class="fw-bold">${b.name} ${b.last} ${isToday? '<span class="badge bg-success ms-2">Hoy 🎂</span>' : ''}</div>
                <div class="small text-muted">${b.date}</div>
              </div>
            </div>
            <div class="text-end d-flex align-items-center gap-2">
              <div class="small text-muted me-1"><span class="xp-badge" data-key="${b.key}">${b.xp} 🎉</span></div>
              <button class="btn btn-sm btn-outline-primary wish-btn" data-key="${b.key}" aria-label="Enviar deseo a ${b.name} ${b.last}">🎉 Deseo</button>
            </div>`;
          listEl.appendChild(item);
        });

        panel.appendChild(listEl);
        const wrapper = document.createElement('section'); wrapper.className = 'birthday-month mb-3';
        wrapper.appendChild(header);
        wrapper.appendChild(panel);
        container.appendChild(wrapper);

        // bind month toggle
        const toggle = header.querySelector('.month-toggle');
        toggle.addEventListener('click', function(){ const expanded = this.getAttribute('aria-expanded') === 'true'; this.setAttribute('aria-expanded', String(!expanded)); this.textContent = expanded ? 'Mostrar' : 'Ocultar'; panel.classList.toggle('d-none'); });

        // bind wish all
        const wishAllBtn = header.querySelector('.month-wish-all');
        wishAllBtn.addEventListener('click', ()=>{
          if (!confirm(`Enviar deseo a los ${list.length} estudiantes de ${months[m]}?`)) return;
          list.forEach(b=>{ const key=b.key; const next=(window.loadXP(key)||0)+1; window.saveXP(key,next); const el=document.querySelector(`.xp-badge[data-key="${key}"]`); if (el) el.textContent = next + ' 🎉'; });
          if (window.updateBirthdayLeaderboard) window.updateBirthdayLeaderboard(leaderboardId);
        });

      });

      // bind per-student wish buttons
      container.querySelectorAll('.wish-btn').forEach(btn=> btn.addEventListener('click', ()=>{ const k=btn.getAttribute('data-key'); const next=(window.loadXP(k)||0)+1; window.saveXP(k,next); const el=document.querySelector(`.xp-badge[data-key="${k}"]`); if (el) el.textContent = next + ' 🎉'; if (window.updateBirthdayLeaderboard) window.updateBirthdayLeaderboard(leaderboardId); }));

    }catch(e){ container.innerHTML = '<div class="small text-muted">Error cargando cumpleaños</div>'; }
  };

  // expose minimal points api
  window.loadStudentPoints = function(id){ try{ return parseInt(localStorage.getItem('11-3:student-points:'+id)||'0',10);}catch(e){return 0;} };
  window.saveStudentPoints = function(id,val){ try{ localStorage.setItem('11-3:student-points:'+id, String(val)); }catch(e){} };
  window.awardStudentPoints = function(id, val){ try{ const cur = window.loadStudentPoints(id)||0; const next = cur + Math.max(0,parseInt(val,10)||0); window.saveStudentPoints(id,next); return next; }catch(e){return 0;} };

})();