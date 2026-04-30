/**
 * Módulo de interfaz de usuario
 * Gestiona la interacción con el DOM y la presentación de contenido
 */

const UI = {
    // Referencias a elementos del DOM
    elements: {},
    
    // Ejercicio actual
    currentExercise: null,

    /**
     * Inicializa las referencias a elementos del DOM
     */
    init() {
        this.elements = {
            // Controles del docente
            difficultyLevel: document.getElementById('difficultyLevel'),
            topicSelect: document.getElementById('topicSelect'),
            newExerciseBtn: document.getElementById('newExerciseBtn'),
            togglePanelBtn: document.getElementById('togglePanelBtn'),
            teacherPanel: document.getElementById('teacherPanel'),
            
            // Área de ejercicios
            questionText: document.getElementById('questionText'),
            conceptContent: document.getElementById('conceptContent'),
            userAnswer: document.getElementById('userAnswer'),
            submitBtn: document.getElementById('submitBtn'),
            hintBtn: document.getElementById('hintBtn'),
            solutionBtn: document.getElementById('solutionBtn'),
            
            // Retroalimentación
            feedbackArea: document.getElementById('feedbackArea'),
            solutionSteps: document.getElementById('solutionSteps')
        };
        
        this.attachEventListeners();
    },

    /**
     * Adjunta event listeners a los elementos
     */
    attachEventListeners() {
        // Botón nuevo ejercicio
        this.elements.newExerciseBtn.addEventListener('click', () => {
            this.generateNewExercise();
        });

        // Botón toggle panel
        this.elements.togglePanelBtn.addEventListener('click', () => {
            this.toggleTeacherPanel();
        });

        // Botón verificar respuesta
        this.elements.submitBtn.addEventListener('click', () => {
            this.checkAnswer();
        });

        // Botón pista
        this.elements.hintBtn.addEventListener('click', () => {
            this.showHint();
        });

        // Botón solución
        this.elements.solutionBtn.addEventListener('click', () => {
            this.showSolution();
        });

        // Enter en el input de respuesta
        this.elements.userAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Cambio de configuración
        this.elements.difficultyLevel.addEventListener('change', () => {
            this.clearExercise();
        });

        this.elements.topicSelect.addEventListener('change', () => {
            this.clearExercise();
        });
    },

    /**
     * Genera un nuevo ejercicio
     */
    generateNewExercise() {
        const topic = this.elements.topicSelect.value;
        const difficulty = this.elements.difficultyLevel.value;
        
        // Generar ejercicio
        this.currentExercise = ExerciseGenerator.generate(topic, difficulty);
        
        // Limpiar estado anterior
        this.clearFeedback();
        this.elements.userAnswer.value = '';
        this.elements.userAnswer.disabled = false;
        this.elements.submitBtn.disabled = false;
        
        // Mostrar ejercicio
        this.displayExercise();
        
        // Enfocar en el input
        this.elements.userAnswer.focus();
    },

    /**
     * Muestra el ejercicio en pantalla
     */
    displayExercise() {
        if (!this.currentExercise) return;
        
        // Mostrar pregunta
        this.elements.questionText.textContent = this.currentExercise.question;
        
        // Mostrar concepto
        this.elements.conceptContent.textContent = this.currentExercise.concept;
    },

    /**
     * Verifica la respuesta del usuario
     */
    checkAnswer() {
        if (!this.currentExercise) {
            this.showFeedback('Primero genera un ejercicio', 'hint');
            return;
        }

        const userAnswer = parseFloat(this.elements.userAnswer.value.trim());
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Por favor, ingresa un número válido', 'hint');
            return;
        }

        const correctAnswer = this.currentExercise.answer;
        const tolerance = 0.1; // Tolerancia para respuestas decimales
        
        if (Math.abs(userAnswer - correctAnswer) <= tolerance) {
            // Respuesta correcta
            const result = Gamification.correctAnswer();
            let message = `${result.message} La respuesta correcta es ${correctAnswer}.`;
            
            if (result.streakBonus) {
                message += ` ¡Bonus por racha de ${Gamification.state.streak}! 🔥`;
            }
            
            this.showFeedback(message, 'correct');
            this.elements.userAnswer.disabled = true;
            this.elements.submitBtn.disabled = true;
        } else {
            // Respuesta incorrecta
            const result = Gamification.incorrectAnswer();
            this.showFeedback(`${result.message} Intenta de nuevo o usa una pista.`, 'incorrect');
            this.elements.userAnswer.value = '';
            this.elements.userAnswer.focus();
        }
    },

    /**
     * Muestra una pista al usuario
     */
    showHint() {
        if (!this.currentExercise) {
            this.showFeedback('Primero genera un ejercicio', 'hint');
            return;
        }

        const topic = this.elements.topicSelect.value;
        const hint = CONFIG.messages.hints[topic] || 'Revisa los pasos necesarios para resolver este tipo de problema.';
        
        Gamification.useHint();
        this.showFeedback(`💡 Pista: ${hint}`, 'hint');
    },

    /**
     * Muestra la solución paso a paso
     */
    showSolution() {
        if (!this.currentExercise) {
            this.showFeedback('Primero genera un ejercicio', 'hint');
            return;
        }

        Gamification.viewSolution();
        
        // Mostrar retroalimentación
        this.showFeedback(`La respuesta correcta es: ${this.currentExercise.answer}`, 'correct');
        
        // Mostrar pasos
        this.displaySolutionSteps();
        
        // Deshabilitar input
        this.elements.userAnswer.disabled = true;
        this.elements.submitBtn.disabled = true;
    },

    /**
     * Muestra los pasos de la solución
     */
    displaySolutionSteps() {
        if (!this.currentExercise || !this.currentExercise.steps) return;
        
        const stepsHTML = this.currentExercise.steps.map((step, index) => `
            <div class="step">
                <span class="step-number">${index + 1}</span>
                <span class="step-content">${step}</span>
            </div>
        `).join('');
        
        this.elements.solutionSteps.innerHTML = `
            <h3>📝 Solución paso a paso:</h3>
            ${stepsHTML}
        `;
        
        this.elements.solutionSteps.classList.add('show');
    },

    /**
     * Muestra retroalimentación al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de retroalimentación (correct/incorrect/hint)
     */
    showFeedback(message, type) {
        this.elements.feedbackArea.textContent = message;
        this.elements.feedbackArea.className = 'feedback-area show ' + type;
    },

    /**
     * Limpia la retroalimentación
     */
    clearFeedback() {
        this.elements.feedbackArea.classList.remove('show');
        this.elements.solutionSteps.classList.remove('show');
    },

    /**
     * Limpia el ejercicio actual
     */
    clearExercise() {
        this.currentExercise = null;
        this.elements.questionText.textContent = 'Presiona "Nuevo Ejercicio" para comenzar';
        this.elements.conceptContent.textContent = 'Selecciona un tema y nivel para comenzar';
        this.elements.userAnswer.value = '';
        this.clearFeedback();
    },

    /**
     * Toggle del panel del docente
     */
    toggleTeacherPanel() {
        this.elements.teacherPanel.classList.toggle('hidden');
        
        if (this.elements.teacherPanel.classList.contains('hidden')) {
            this.elements.togglePanelBtn.textContent = '👁️ Mostrar Panel';
            this.elements.togglePanelBtn.setAttribute('aria-label', 'Mostrar panel de docente');
        } else {
            this.elements.togglePanelBtn.textContent = '👁️ Ocultar Panel';
            this.elements.togglePanelBtn.setAttribute('aria-label', 'Ocultar panel de docente');
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
