/**
 * Configuración global de la aplicación
 * Define los niveles de dificultad y los temas matemáticos disponibles
 */

const CONFIG = {
    // Niveles de dificultad
    difficulty: {
        basico: {
            name: 'Básico',
            rangeMin: 1,
            rangeMax: 20,
            operations: ['+', '-'],
            description: 'Operaciones básicas con números pequeños'
        },
        intermedio: {
            name: 'Intermedio',
            rangeMin: 10,
            rangeMax: 100,
            operations: ['+', '-', '*'],
            description: 'Operaciones con números medianos'
        },
        avanzado: {
            name: 'Avanzado',
            rangeMin: 20,
            rangeMax: 200,
            operations: ['+', '-', '*', '/'],
            description: 'Operaciones complejas con números grandes'
        }
    },

    // Temas matemáticos disponibles
    topics: {
        algebra: {
            name: 'Álgebra',
            description: 'Operaciones algebraicas básicas',
            icon: '🔢'
        },
        ecuaciones: {
            name: 'Ecuaciones Lineales',
            description: 'Resolución de ecuaciones de primer grado',
            icon: '⚖️'
        },
        geometria: {
            name: 'Geometría',
            description: 'Áreas, perímetros y volúmenes',
            icon: '📐'
        },
        trigonometria: {
            name: 'Trigonometría',
            description: 'Razones trigonométricas básicas',
            icon: '📊'
        },
        funciones: {
            name: 'Funciones',
            description: 'Evaluación de funciones lineales',
            icon: '📈'
        }
    },

    // Puntuación
    scoring: {
        correctAnswer: 10,
        hintPenalty: 2,
        solutionPenalty: 5,
        streakBonus: 5
    },

    // Mensajes de retroalimentación
    messages: {
        correct: [
            '¡Excelente! 🎉',
            '¡Muy bien! ⭐',
            '¡Correcto! 👏',
            '¡Perfecto! 🌟',
            '¡Impresionante! 🚀'
        ],
        incorrect: [
            'Intenta nuevamente 💪',
            'No te rindas, revisa tu procedimiento 🤔',
            'Casi lo tienes, verifica tus cálculos 📝',
            'Revisa los pasos y vuelve a intentar 🔍'
        ],
        hints: {
            algebra: 'Recuerda seguir el orden de operaciones: paréntesis, exponentes, multiplicación/división, suma/resta',
            ecuaciones: 'Para despejar la variable, realiza la misma operación en ambos lados de la ecuación',
            geometria: 'Identifica qué fórmula necesitas usar según la figura geométrica',
            trigonometria: 'Recuerda: sen = opuesto/hipotenusa, cos = adyacente/hipotenusa, tan = opuesto/adyacente',
            funciones: 'Sustituye el valor de x en la función y realiza las operaciones'
        }
    }
};

// Exportar configuración para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
