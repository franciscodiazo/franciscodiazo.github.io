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

    // refresh button
    const btn = document.getElementById('refresh-birthdays-index'); if (btn) btn.addEventListener('click', ()=>{ try{ if (window.renderBirthdaysByMonth) window.renderBirthdaysByMonth('birthdays-by-month','leaderboard'); }catch(e){} });

    // sync button
    const syncBtn = document.getElementById('sync-points-btn'); if (syncBtn) syncBtn.addEventListener('click', ()=>{ if (window.triggerPointsSync) window.triggerPointsSync(); else alert('Sin servicio de sincronización configurado.'); });
  }
  document.addEventListener('DOMContentLoaded', init);
})();