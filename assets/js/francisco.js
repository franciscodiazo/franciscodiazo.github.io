// Shared JS helpers (safe: define only if not already present)
(function(){
  // generateWeekGrid
  if (typeof window.generateWeekGrid === 'undefined') {
    window.generateWeekGrid = function() {
      const grid = document.getElementById('week-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const totalWeeks = 40;
      const currentWeek = window.getCurrentWeek ? window.getCurrentWeek() : 1;

      for (let i = 1; i <= totalWeeks; i++) {
        const week = document.createElement('div');
        week.className = 'week-item';
        week.textContent = i;
        week.title = `Semana ${i}`;
        if (i === currentWeek) {
          week.classList.add('active');
        } else if (i >= 21 && i <= 23) {
          week.classList.add('vacation');
        } else if (i === 24) {
          week.classList.add('icfes');
        }
        week.onclick = () => window.showWeekDetails ? window.showWeekDetails(i) : null;
        grid.appendChild(week);
      }
    };
  }

  // getCurrentWeek
  if (typeof window.getCurrentWeek === 'undefined') {
    window.getCurrentWeek = function() {
      // Start date for the 2026 academic year (26 Ene 2026)
      const startDate = new Date('2026-01-26');
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - startDate);
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      return Math.min(Math.max(diffWeeks, 1), 40);
    };
  }

  // showWeekDetails
  if (typeof window.showWeekDetails === 'undefined') {
    window.showWeekDetails = function(week) {
      if (!document.getElementById('infoModal')) return;
      const modal = new bootstrap.Modal(document.getElementById('infoModal'));
      if (document.getElementById('modalTitle')) document.getElementById('modalTitle').textContent = `Semana ${week} - Misión`;
      let content = '';
      if (week <= 14) content = `<div class="alert alert-primary">Primer periodo (14 semanas): Fundamentos y diagnóstico ICFES</div>`;
      else if (week <= 27) content = `<div class="alert alert-info">Segundo periodo (13 semanas): Profundización y simulacros</div>`;
      else content = `<div class="alert alert-warning">Tercer periodo (13 semanas): Consolidación y cierre SENA</div>`;
      // Vacaciones y ICFES
      if ((week >= 20 && week <= 22) || (week >= 21 && week <= 23)) content += `<div class="alert alert-warning"><strong>¡Vacaciones!</strong> Descanso estratégico</div>`;
      if (week === 24) content += `<div class="alert alert-danger"><strong>SEMANA ICFES</strong> ¡Todo el poder!</div>`;
      if (document.getElementById('modalBody')) document.getElementById('modalBody').innerHTML = content;
      modal.show();
    };
  }

  // generateStudentProfiles (if students array present)
  if (typeof window.generateStudentProfiles === 'undefined') {
    window.generateStudentProfiles = function(studentsArray){
      const container = document.getElementById('student-grid');
      if (!container || !Array.isArray(studentsArray)) return;
      container.innerHTML = '';
      studentsArray.sort((a,b)=>b.xp-a.xp).forEach((student,index)=>{
        const card = document.createElement('div');
        card.className = 'col-md-3 col-6';
        card.innerHTML = `
          <div class="student-card">
            <div class="student-avatar">${student.avatar||student.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <h6 class="fw-bold mb-1">${student.name}</h6>
            <span class="badge bg-primary mb-2">${student.level||''}</span>
            <div class="progress" style="height:10px;"><div class="progress-bar bg-warning" style="width:${(student.xp/2000)*100}%"></div></div>
            <small class="text-muted">${student.xp} XP</small>
            ${index<3?'<div class="mt-2">🏆</div>':''}
          </div>`;
        container.appendChild(card);
      });
    };
  }

  // updateCountdown
  if (typeof window.updateCountdown === 'undefined') {
    window.updateCountdown = function() {
      if (!document.getElementById('days')) return;
      const icfesDate = new Date('2025-07-15');
      const now = new Date();
      const diff = icfesDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      document.getElementById('days').textContent = days > 0 ? days : 0;
      if (document.getElementById('current-week')) document.getElementById('current-week').textContent = window.getCurrentWeek();
      const progress = Math.min((window.getCurrentWeek() / 40) * 100, 100);
      if (document.getElementById('progress-total')) document.getElementById('progress-total').textContent = Math.round(progress) + '%';
      if (document.getElementById('xp-progress')){ document.getElementById('xp-progress').style.width = progress + '%'; document.getElementById('xp-progress').textContent = Math.round(progress) + '%'; }
    };
  }

  // Generic helpers
  if (typeof window.showSection === 'undefined'){
    window.showSection = function(section){
      const unad = document.getElementById('unad-section');
      const inma = document.getElementById('inmaculada-section');
      if (unad) unad.style.display='none';
      if (inma) inma.style.display='none';
      if (section === 'unad' && unad){ unad.style.display='block'; unad.scrollIntoView({behavior:'smooth'}); }
      if (section === 'inmaculada' && inma){ inma.style.display='block'; inma.scrollIntoView({behavior:'smooth'}); }
      if (section === 'grado11-3'){ const el=document.getElementById('grado11-3'); if (el) el.scrollIntoView({behavior:'smooth'}); }
    };
  }

  if (typeof window.hideSections === 'undefined'){
    window.hideSections = function(){ const unad=document.getElementById('unad-section'); const inma=document.getElementById('inmaculada-section'); if(unad)unad.style.display='none'; if(inma)inma.style.display='none'; };
  }

  if (typeof window.showModal === 'undefined'){
    window.showModal = function(type){ if(!document.getElementById('infoModal')) return; const modal=new bootstrap.Modal(document.getElementById('infoModal')); const titles={ 'bd':'Bases de Datos Multimedia - Plan de Clase','seguridad':'Seguridad Informática - Plan de Clase','gestion':'Gestión del Desarrollo Multimedia','plan-area':'Plan de Área - Tecnología','plan-clase':'Plan de Clase Semanal','simuladores':'Simuladores ICFES Interactivos','gamificacion':'Sistema de Gamificación 11-3','rubricas':'Rúbricas de Evaluación','recursos':'Material de Apoyo y Biblioteca'}; const contents={'bd':'<p><strong>Unidad 1:</strong> Modelado de datos multimedia<br><strong>Unidad 2:</strong> Bases de datos NoSQL para contenido digital<br><strong>Unidad 3:</strong> Optimización y consultas avanzadas</p><div class="alert alert-info">Próxima clase: Normalización de bases de datos audiovisuales</div>','seguridad':'<p><strong>Módulo 1:</strong> Principios de seguridad de la información<br><strong>Módulo 2:</strong> Criptografía aplicada<br><strong>Módulo 3:</strong> Ethical Hacking básico</p>','simuladores':'<div class="list-group"><a href="#" class="list-group-item list-group-item-action">Simulacro Matemáticas - Semana 5</a><a href="#" class="list-group-item list-group-item-action">Simulacro Lectura Crítica - Semana 8</a><a href="#" class="list-group-item list-group-item-action">Simulacro Completo - Semana 20</a></div>','gamificacion':'<h6>Sistema de Puntos:</h6><ul><li>Asistencia: +10 XP</li><li>Tareas: +50 XP</li><li>Participación: +20 XP</li><li>Simulacros: +100 XP</li><li>Bonus ICFES: +500 XP</li></ul><div class="alert alert-warning">Niveles: Explorador → Guerrero → Maestro → Leyenda</div>'}; document.getElementById('modalTitle').textContent=titles[type]||'Información'; document.getElementById('modalBody').innerHTML=contents[type]||'<p>Contenido en desarrollo...</p>'; modal.show(); };
  }

  if (typeof window.scrollToTop === 'undefined'){
    window.scrollToTop = function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); };
  }

  // Auto init on pages where elements exist
  document.addEventListener('DOMContentLoaded', function(){
    try{ if (document.getElementById('week-grid')) window.generateWeekGrid(); }catch(e){}
    try{ if (window.students && document.getElementById('student-grid')) window.generateStudentProfiles(window.students); }catch(e){}
    try{ if (document.getElementById('days')) { window.updateCountdown(); setInterval(window.updateCountdown, 86400000); } }catch(e){}
    try{ const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate__animated','animate__fadeInUp'); }); }); document.querySelectorAll('.resource-card, .student-card').forEach((el)=>observer.observe(el)); }catch(e){}

    // Fetch and render next birthdays in 11-3 index
    try{
      async function renderNextBirthdays(){
        const el = document.getElementById('next-birthdays');
        if (!el) return;
        try{
          const r = await fetch('/11-3/data/birthdays.json');
          if (!r.ok) { el.textContent = 'No se pudieron cargar.'; return; }
          const data = await r.json();
          const today = new Date();
          function parseDateStr(dateStr){
            const parts = dateStr.trim().toLowerCase().split(' de ');
            const day = parseInt(parts[0],10);
            const months = { 'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,'julio':6,'agosto':7,'septiembre':8,'octubre':9,'noviembre':10,'diciembre':11 };
            return { day, month: months[parts[1]] ?? 0 };
          }
          function nextOcc(dateStr){
            const d = parseDateStr(dateStr);
            const cur = new Date();
            let cand = new Date(cur.getFullYear(), d.month, d.day);
            if (cand < new Date(cur.getFullYear(), cur.getMonth(), cur.getDate())) cand = new Date(cur.getFullYear()+1, d.month, d.day);
            return cand;
          }
          const withNext = data.map(b=>({ ...b, next: nextOcc(b.date) }));
          withNext.sort((a,b)=> a.next - b.next);
          const top = withNext.slice(0,3);
          el.innerHTML = top.map(t=>`<div><strong>${t.name}</strong> <span class="text-muted">${t.date}</span></div>`).join('');
        }catch(e){ el.textContent='Error'; }
      }
      renderNextBirthdays();
    }catch(e){}
  });
})();