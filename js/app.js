/**
 * Archivo principal de la aplicación
 * Inicializa todos los módulos y gestiona el flujo de la aplicación
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 MathLearn - Aplicación iniciada');
    
    // Inicializar módulos
    initializeApp();
});

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    try {
        // Inicializar sistema de gamificación
        Gamification.init();
        console.log('✅ Sistema de gamificación inicializado');
        
        // Inicializar interfaz de usuario
        UI.init();
        console.log('✅ Interfaz de usuario inicializada');
        
        // Mostrar mensaje de bienvenida
        showWelcomeMessage();
        
        // Configurar accesibilidad adicional
        setupAccessibility();
        
        console.log('🚀 Aplicación lista para usar');
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        showErrorMessage();
    }
}

/**
 * Muestra mensaje de bienvenida
 */
function showWelcomeMessage() {
    const stats = Gamification.getStats();
    
    if (stats.total === 0) {
        // Primera vez
        console.log('👋 Bienvenido a MathLearn');
    } else {
        // Usuario que regresa
        console.log(`👋 Bienvenido de vuelta! Precisión: ${stats.accuracy}%`);
    }
}

/**
 * Muestra mensaje de error
 */
function showErrorMessage() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #FF6B6B;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 9999;
    `;
    errorDiv.textContent = '⚠️ Error al inicializar la aplicación. Por favor, recarga la página.';
    document.body.appendChild(errorDiv);
}

/**
 * Configura características adicionales de accesibilidad
 */
function setupAccessibility() {
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Alt + N: Nuevo ejercicio
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('newExerciseBtn').click();
        }
        
        // Alt + H: Pista
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            document.getElementById('hintBtn').click();
        }
        
        // Alt + S: Solución
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            document.getElementById('solutionBtn').click();
        }
    });
    
    console.log('⌨️ Atajos de teclado configurados (Alt+N, Alt+H, Alt+S)');
}

/**
 * Maneja errores globales
 */
window.addEventListener('error', (e) => {
    console.error('Error global capturado:', e.error);
});

/**
 * Maneja promesas rechazadas
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada:', e.reason);
});

// Exportar funciones si se necesitan en otros contextos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setupAccessibility
    };
}
