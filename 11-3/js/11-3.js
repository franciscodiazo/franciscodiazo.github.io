document.addEventListener('DOMContentLoaded', function(){
  // Basic academic year and periods (configurable)
  const config={
    yearStart: '2026-02-26',
    yearEnd: '2026-11-30',
    periods: [ {name:'Periodo 1', weeks:14}, {name:'Periodo 2', weeks:13}, {name:'Periodo 3', weeks:13} ],
    vacationsStart: '2026-06-26', vacationsWeeks:3
  }
  document.getElementById('year-start').textContent = config.yearStart;
  document.getElementById('year-end').textContent = config.yearEnd;

  // Load activities and students
  Promise.all([fetch('/11-3/data/activities.json').then(r=>r.json()), fetch('/11-3/data/students.json').then(r=>r.json())]).then(([activities, students])=>{
    // leaderboard
    const lb = document.getElementById('leaderboard');
    const sorted = students.slice().sort((a,b)=>b.points-a.points);
    lb.innerHTML = '<ol class="mb-0">'+sorted.map(s=>`<li>${s.name} <small class="text-muted">(${s.points} pts)</small></li>`).join('')+'</ol>';

    // upcoming
    const up = document.getElementById('upcoming');
    const upcoming = activities.filter(a=>new Date(a.due) >= new Date()).sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,6);
    up.innerHTML = upcoming.map(a=>`<div class="col-md-6"><div class="card p-3"><strong>${a.title}</strong><p class="mb-0">Entrega: ${a.due}</p></div></div>`).join('');

    // Next birthdays widget (interactive)
    try{
      const birthdaysEl = document.getElementById('next-birthdays');
      if (birthdaysEl){
        birthdaysEl.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true"></div> Cargando...';
        fetch('/11-3/data/birthdays.json').then(r=>r.json()).then(list=>{
          const today = new Date();
          list.forEach(b=>{ b.next = window.nextOccurrence(b.date); b.key = window.keyFor(b); b.xp = window.loadXP ? window.loadXP(b.key) : 0; });
          list.sort((a,b)=>a.next - b.next);
          const slice = list.slice(0,6);
          birthdaysEl.innerHTML = '';
          slice.forEach(b=>{
            const days = Math.ceil((b.next - new Date(today.getFullYear(), today.getMonth(), today.getDate()))/(1000*60*60*24));
            const isToday = (new Date().toDateString() === b.next.toDateString());
            const item = document.createElement('div'); item.className = 'd-flex align-items-center justify-content-between py-2 birthday-item';
            item.innerHTML = `
              <div class="d-flex align-items-center">
                <div class="me-3 avatar-sm">${b.avatar? `<img src="${b.avatar}" alt="${b.name}" class="rounded-circle" width="44" height="44">` : b.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div>
                  <div class="fw-bold">${b.name} ${b.last}</div>
                  <div class="small text-muted">${b.date} • ${isToday? 'Hoy 🎂' : 'En '+days+' días'}</div>
                </div>
              </div>
              <div class="text-end">
                <div class="small mb-1"><span class="xp-badge">${b.xp} 🎉</span></div>
                <button class="btn btn-sm btn-outline-primary send-wish" data-key="${b.key}">🎉 Deseo</button>
              </div>
            `;
            birthdaysEl.appendChild(item);
            const btn = item.querySelector('.send-wish');
            btn.addEventListener('click', function(){
              try{ window.giveBirthdayWish && window.giveBirthdayWish(b, item); window.updateBirthdayLeaderboard && window.updateBirthdayLeaderboard('leaderboard'); btn.setAttribute('disabled',''); btn.textContent='Enviado'; setTimeout(()=>{ btn.removeAttribute('disabled'); btn.textContent='🎉 Deseo'; },1200); }catch(e){console.error(e);} 
            });
          });
          // update leaderboard summary
          if (window.updateBirthdayLeaderboard) window.updateBirthdayLeaderboard('leaderboard');
        }).catch(e=>{ birthdaysEl.innerHTML = '<div class="small text-muted">No se pudieron cargar cumpleaños.</div>'; });
      }
    }catch(e){ console.error('birthdays widget error', e); }

    // refresh button
    const rbtn = document.getElementById('refresh-birthdays'); if (rbtn){ rbtn.addEventListener('click', ()=>{ document.getElementById('next-birthdays').innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div> Cargando...'; setTimeout(()=> location.reload(),800); }); }

    // update course xp in hero
    try{ const xpEl = document.getElementById('course-xp'); if (xpEl){ const keys = Object.keys(localStorage).filter(k=>k.startsWith('11-3:student-points:')); const total = keys.reduce((acc,k)=> acc + parseInt(localStorage.getItem(k)||'0',10),0); xpEl.textContent = total; } }catch(e){}

    // hero days update to keep it consistent with other countdown routines
    try{ const daysHero = document.getElementById('days-to-graduation-hero'); if (daysHero){ const grad = new Date('2026-12-04T00:00:00'); function u(){ const diff=Math.ceil((grad - new Date())/(1000*60*60*24)); daysHero.textContent = diff>0?diff:0; } u(); setInterval(u, 60*60*1000); } }catch(e){}

    // Calendar
    const calendarEl = document.getElementById('calendar');
    const events = activities.map(a=>({title:a.title,start:a.due}));
    const calendar = new FullCalendar.Calendar(calendarEl,{
      initialView:'dayGridMonth',
      height:600,
      headerToolbar: { left:'prev,next today', center:'title', right:'dayGridMonth,dayGridWeek' },
      events
    });
    calendar.render();
  })
});