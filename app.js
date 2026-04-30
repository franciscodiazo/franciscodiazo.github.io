// app.js
// Lógica para microinteracciones, comportamiento UI y GAMIFICACIÓN de ingfranciscodiaz.com

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       1. EFECTOS UI BÁSICOS 
       ========================================================= */
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Menú Móvil Simple
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navLinks.classList.contains('active')) {
                mobileBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Smooth Scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                if (window.innerWidth <= 1200 && navLinks) {
                    navLinks.classList.remove('active');
                    if (mobileBtn) mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =========================================================
       2. SISTEMA DE GAMIFICACIÓN (Heutagogía interactiva)
       ========================================================= */

    const achievements = {
        'visit_index': { id: 'visit_index', title: 'Explorador Inicial', icon: '🚀', desc: 'Has iniciado tu ruta en la página principal.' },
        'visit_dua': { id: 'visit_dua', title: 'Visión Inclusiva', icon: '🧠', desc: 'Has explorado la propuesta DUA.' },
        'visit_recursos': { id: 'visit_recursos', title: 'Fiebre STEM', icon: '🧪', desc: 'Descubriste el laboratorio de recursos.' },
        'visit_ia': { id: 'visit_ia', title: 'Futurista', icon: '🤖', desc: 'Te adentraste en el directorio de IA.' },
        'visit_portafolio': { id: 'visit_portafolio', title: 'Pico y Pala', icon: '💻', desc: 'Analizaste el portafolio de desarrollo.' },
        'visit_blog': { id: 'visit_blog', title: 'Reflexivo', icon: '📝', desc: 'Entraste a la bitácora del mediador.' },
        'all_pages': { id: 'all_pages', title: 'Maestro de Rutas', icon: '🏆', desc: 'Has explorado todo el PLE de Francisco Díaz.' }
    };

    // Inicializar progreso en LocalStorage
    let userProgress = JSON.parse(localStorage.getItem('fdiaz_progress')) || { unlocked: [] };

    function unlockAchievement(achievementId) {
        if (!userProgress.unlocked.includes(achievementId)) {
            userProgress.unlocked.push(achievementId);
            localStorage.setItem('fdiaz_progress', JSON.stringify(userProgress));
            showToast(achievements[achievementId]);
            updateGamificationUI();
        }
    }

    function showToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-icon">${achievement.icon}</div>
            <div class="toast-content">
                <h4>¡Insignia Desbloqueada!</h4>
                <p><strong>${achievement.title}</strong></p>
                <small>${achievement.desc}</small>
            </div>
        `;
        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 100);
        // Desaparecer después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function updateGamificationUI() {
        const badgeContainer = document.getElementById('gamification-badges');
        if (!badgeContainer) return;

        badgeContainer.innerHTML = '';
        userProgress.unlocked.forEach(id => {
            const badge = document.createElement('div');
            badge.className = 'badge-icon';
            badge.title = achievements[id].title + ": " + achievements[id].desc;
            badge.innerHTML = achievements[id].icon;
            badgeContainer.appendChild(badge);
        });
    }

    // Comprobar página actual (usando window.location.pathname)
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/')) {
        unlockAchievement('visit_index');
    } else if (path.includes('dua.html')) {
        unlockAchievement('visit_dua');
    } else if (path.includes('recursos.html')) {
        unlockAchievement('visit_recursos');
    } else if (path.includes('directorio-ia.html')) {
        unlockAchievement('visit_ia');
    } else if (path.includes('portafolio.html')) {
        unlockAchievement('visit_portafolio');
    } else if (path.includes('blog.html')) {
        unlockAchievement('visit_blog');
    }

    // Comprobar si desbloqueó todo
    if (userProgress.unlocked.length >= 6 && !userProgress.unlocked.includes('all_pages')) {
        setTimeout(() => unlockAchievement('all_pages'), 1500);
    }

    // Inicializar UI si existe el contenedor en la navbar
    updateGamificationUI();

    // Easter egg de consola
    console.log("%c¡Hola Explorador! %c🚀", "color: #06B6D4; font-size: 20px; font-weight: bold;", "");
    console.log("Sistema de gamificación activo. ¿Podrás encontrar todas las insignias?");
});
