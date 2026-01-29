(function(){
  async function loadJSON(path){ try{ const r=await fetch(path); return r.ok?await r.json():null; }catch(e){return null;} }
  async function init(){
    // render students
    const students = await loadJSON('/11-3/data/students.json')||[];
    const container = document.getElementById('students-list');
    if (container){ container.innerHTML = ''; students.forEach(s=>{ const col=document.createElement('div'); col.className='col-md-6'; col.innerHTML=`<div class="card p-3"><div class="d-flex align-items-center"><div class="avatar-sm me-3">${s.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>${s.name} ${s.last}</strong><div class="small text-muted">ID: ${s.id}</div></div></div><p class="mt-2">Puntos: <strong id="student-points-${s.id}">${s.points}</strong></p></div>`; container.appendChild(col); }); }

    // upcoming activities
    const acts = await loadJSON('/11-3/data/activities.json')||[]; const up = document.getElementById('upcoming'); if(up){ up.innerHTML = acts.slice(0,6).map(a=>`<div class="mb-2">${a.title} • <small class="text-muted">${a.due}</small></div>`).join(''); }

    // init calendar
    try{
      const calendarEl = document.getElementById('calendar');
      if (calendarEl && window.FullCalendar){
        const cal = new FullCalendar.Calendar(calendarEl, {initialView:'dayGridMonth',height:360,events: acts.map((a)=>({ title:a.title,start:a.due }))});
        cal.render();
      }
    }catch(e){console.error(e);}    

    // birthdays
    try{ if (window.renderBirthdaysByMonth) window.renderBirthdaysByMonth('birthdays-by-month','leaderboard'); }catch(e){console.error(e);}    

    // leaderboard
    if (window.updateBirthdayLeaderboard) window.updateBirthdayLeaderboard('leaderboard');

    // helper: simple toast notifications
    window.showToast = function(message, opts){ try{ const container = document.getElementById('toast-container'); if (!container) return; const id = 't-'+Date.now(); const el = document.createElement('div'); el.className = 'app-toast show ' + (opts && opts.type ? opts.type : 'info'); el.id = id; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); el.innerHTML = `<div class="d-flex align-items-start justify-content-between"><div><div class="toast-title">${message}</div></div><div><button class="toast-close" aria-label="Cerrar">✕</button></div></div>`; container.appendChild(el); // close handler
      el.querySelector('.toast-close').addEventListener('click', ()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),280); }); setTimeout(()=>{ if (document.getElementById(id)) { el.classList.remove('show'); setTimeout(()=>{ el.remove(); },280); } }, 4200); }catch(e){ console.error('toast',e); } };

    // refresh button
    const btn = document.getElementById('refresh-birthdays-index'); if (btn) btn.addEventListener('click', ()=>{ try{ if (window.renderBirthdaysByMonth) window.renderBirthdaysByMonth('birthdays-by-month','leaderboard'); window.showToast && window.showToast('Cumpleaños actualizados', { type: 'info' }); }catch(e){} });

    // search birthdays
    const search = document.getElementById('birthday-search'); if (search){ let timer=null; search.addEventListener('input', function(e){ clearTimeout(timer); timer=setTimeout(()=>{ try{ window.filterBirthdaysByQuery && window.filterBirthdaysByQuery(e.target.value, 'birthdays-by-month'); }catch(err){} }, 200); }); }

    // export points (copy to clipboard)
    const expBtn = document.getElementById('export-birthdays-btn'); if (expBtn){ expBtn.addEventListener('click', async function(){ try{ const payload = window.exportBirthdaysPoints(); const txt = JSON.stringify(payload,null,2); await navigator.clipboard.writeText(txt); window.showToast && window.showToast('Puntos copiados al portapapeles', { type: 'success' }); }catch(e){ console.error(e); window.showToast && window.showToast('Error copiando puntos', { type: 'info' }); } }); }

    // download points
    const dlBtn = document.getElementById('download-birthdays-btn'); if (dlBtn){ dlBtn.addEventListener('click', function(){ try{ window.downloadBirthdaysPoints(); window.showToast && window.showToast('Archivo descargado: 11-3-points.json', { type: 'success' }); }catch(e){ console.error(e); window.showToast && window.showToast('Error descargando puntos', { type: 'info' }); } }); }

    // sync button
    const syncBtn = document.getElementById('sync-points-btn'); if (syncBtn) syncBtn.addEventListener('click', ()=>{ if (window.triggerPointsSync) { window.showToast && window.showToast('Iniciando sincronización...', { type: 'info' }); window.triggerPointsSync(); } else { window.showToast && window.showToast('Sin servicio de sincronización configurado', { type: 'info' }); } });
  }
  document.addEventListener('DOMContentLoaded', init);
})();