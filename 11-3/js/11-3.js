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