/**
 * Módulo de gamificación
 * Gestiona puntuación, rachas y retroalimentación
 */

const Gamification = {
    // Estado del juego
    state: {
        score: 0,
        streak: 0,
        correct: 0,
        total: 0,
        hintsUsed: 0,
        solutionsViewed: 0
    },

    /**
     * Inicializa el sistema de gamificación
     */
    init() {
        this.loadState();
        this.updateDisplay();
    },

    /**
     * Carga el estado desde localStorage
     */
    loadState() {
        const saved = localStorage.getItem('mathlearn_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('Error cargando estado:', e);
            }
        }
    },

    /**
     * Guarda el estado en localStorage
     */
    saveState() {
        localStorage.setItem('mathlearn_state', JSON.stringify(this.state));
    },

    /**
     * Actualiza la visualización de puntuación
     */
    updateDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        const streakDisplay = document.getElementById('streakDisplay');
        const correctDisplay = document.getElementById('correctDisplay');

        if (scoreDisplay) scoreDisplay.textContent = this.state.score;
        if (streakDisplay) streakDisplay.textContent = this.state.streak;
        if (correctDisplay) correctDisplay.textContent = this.state.correct;

        this.saveState();
    },

    /**
     * Procesa una respuesta correcta
     */
    correctAnswer() {
        this.state.correct++;
        this.state.total++;
        this.state.streak++;
        
        // Puntuación base
        let points = CONFIG.scoring.correctAnswer;
        
        // Bonus por racha
        if (this.state.streak >= 3) {
            points += CONFIG.scoring.streakBonus;
        }
        
        this.state.score += points;
        this.updateDisplay();
        
        // Animación de celebración
        this.celebrate();
        
        return {
            message: this.getRandomMessage('correct'),
            points: points,
            streakBonus: this.state.streak >= 3
        };
    },

    /**
     * Procesa una respuesta incorrecta
     */
    incorrectAnswer() {
        this.state.total++;
        this.state.streak = 0; // Reiniciar racha
        this.updateDisplay();
        
        // Animación de error
        this.shake();
        
        return {
            message: this.getRandomMessage('incorrect')
        };
    },

    /**
     * Procesa el uso de una pista
     */
    useHint() {
        this.state.hintsUsed++;
        this.state.score = Math.max(0, this.state.score - CONFIG.scoring.hintPenalty);
        this.updateDisplay();
    },

    /**
     * Procesa la visualización de la solución
     */
    viewSolution() {
        this.state.solutionsViewed++;
        this.state.score = Math.max(0, this.state.score - CONFIG.scoring.solutionPenalty);
        this.state.streak = 0; // Reiniciar racha
        this.updateDisplay();
    },

    /**
     * Obtiene un mensaje aleatorio de retroalimentación
     * @param {string} type - Tipo de mensaje (correct/incorrect)
     * @returns {string} Mensaje aleatorio
     */
    getRandomMessage(type) {
        const messages = CONFIG.messages[type];
        return messages[Math.floor(Math.random() * messages.length)];
    },

    /**
     * Animación de celebración
     */
    celebrate() {
        const scoreCard = document.querySelector('.score-card');
        if (scoreCard) {
            scoreCard.classList.add('celebrate');
            setTimeout(() => {
                scoreCard.classList.remove('celebrate');
            }, 500);
        }
    },

    /**
     * Animación de error
     */
    shake() {
        const exerciseCard = document.querySelector('.exercise-card');
        if (exerciseCard) {
            exerciseCard.classList.add('shake');
            setTimeout(() => {
                exerciseCard.classList.remove('shake');
            }, 500);
        }
    },

    /**
     * Reinicia las estadísticas
     */
    reset() {
        if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
            this.state = {
                score: 0,
                streak: 0,
                correct: 0,
                total: 0,
                hintsUsed: 0,
                solutionsViewed: 0
            };
            this.updateDisplay();
        }
    },

    /**
     * Obtiene estadísticas del jugador
     * @returns {object} Estadísticas
     */
    getStats() {
        return {
            score: this.state.score,
            streak: this.state.streak,
            correct: this.state.correct,
            total: this.state.total,
            accuracy: this.state.total > 0 
                ? Math.round((this.state.correct / this.state.total) * 100) 
                : 0,
            hintsUsed: this.state.hintsUsed,
            solutionsViewed: this.state.solutionsViewed
        };
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gamification;
}
