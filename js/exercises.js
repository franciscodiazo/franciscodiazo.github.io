/**
 * Módulo de generación de ejercicios matemáticos
 * Genera ejercicios según el tema y nivel de dificultad seleccionado
 */

const ExerciseGenerator = {
    
    /**
     * Genera un número aleatorio dentro de un rango
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Número aleatorio
     */
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Genera un ejercicio de álgebra
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Objeto con pregunta, respuesta y solución
     */
    generateAlgebra(difficulty) {
        const config = CONFIG.difficulty[difficulty];
        const a = this.randomNumber(config.rangeMin, config.rangeMax);
        const b = this.randomNumber(config.rangeMin, config.rangeMax);
        const operations = config.operations;
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        let answer, question;
        const steps = [];
        
        switch(op) {
            case '+':
                answer = a + b;
                question = `${a} + ${b}`;
                steps.push(`Suma los números: ${a} + ${b}`);
                steps.push(`Resultado: ${answer}`);
                break;
            case '-':
                answer = a - b;
                question = `${a} - ${b}`;
                steps.push(`Resta los números: ${a} - ${b}`);
                steps.push(`Resultado: ${answer}`);
                break;
            case '*':
                answer = a * b;
                question = `${a} × ${b}`;
                steps.push(`Multiplica los números: ${a} × ${b}`);
                steps.push(`Resultado: ${answer}`);
                break;
            case '/':
                // Asegurar división exacta
                const divisor = this.randomNumber(2, 10);
                const quotient = this.randomNumber(config.rangeMin, Math.floor(config.rangeMax / divisor));
                const dividend = divisor * quotient;
                answer = quotient;
                question = `${dividend} ÷ ${divisor}`;
                steps.push(`Divide: ${dividend} ÷ ${divisor}`);
                steps.push(`¿Cuántas veces cabe ${divisor} en ${dividend}?`);
                steps.push(`Resultado: ${answer}`);
                break;
        }
        
        return {
            question: `Calcula: ${question}`,
            answer: answer,
            steps: steps,
            concept: `Las operaciones aritméticas básicas son fundamentales en matemáticas. Recuerda el orden de operaciones: paréntesis, exponentes, multiplicación/división (de izquierda a derecha), suma/resta (de izquierda a derecha).`
        };
    },

    /**
     * Genera un ejercicio de ecuaciones lineales
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Objeto con pregunta, respuesta y solución
     */
    generateEcuaciones(difficulty) {
        const config = CONFIG.difficulty[difficulty];
        const x = this.randomNumber(1, 20); // Valor de x (respuesta)
        const a = this.randomNumber(2, 10); // Coeficiente
        const b = this.randomNumber(config.rangeMin, config.rangeMax); // Término independiente
        const result = a * x + b;
        
        const steps = [];
        steps.push(`Ecuación: ${a}x + ${b} = ${result}`);
        steps.push(`Resta ${b} de ambos lados: ${a}x = ${result - b}`);
        steps.push(`Divide ambos lados entre ${a}: x = ${(result - b) / a}`);
        steps.push(`Verificación: ${a}(${x}) + ${b} = ${a * x} + ${b} = ${result} ✓`);
        
        return {
            question: `Resuelve la ecuación: ${a}x + ${b} = ${result}`,
            answer: x,
            steps: steps,
            concept: `Para resolver ecuaciones lineales, el objetivo es aislar la variable. Usa operaciones inversas: si algo está sumando, réstalo; si está multiplicando, divídelo. Recuerda hacer lo mismo en ambos lados de la ecuación.`
        };
    },

    /**
     * Genera un ejercicio de geometría
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Objeto con pregunta, respuesta y solución
     */
    generateGeometria(difficulty) {
        const config = CONFIG.difficulty[difficulty];
        const shapes = ['rectangulo', 'circulo', 'triangulo'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const steps = [];
        let question, answer, concept;
        
        switch(shape) {
            case 'rectangulo':
                const largo = this.randomNumber(config.rangeMin, config.rangeMax);
                const ancho = this.randomNumber(config.rangeMin, config.rangeMax);
                answer = Math.round(largo * ancho);
                question = `Calcula el área de un rectángulo con largo ${largo} cm y ancho ${ancho} cm`;
                steps.push(`Fórmula del área: A = largo × ancho`);
                steps.push(`Sustituir valores: A = ${largo} × ${ancho}`);
                steps.push(`Calcular: A = ${answer} cm²`);
                concept = `El área de un rectángulo se calcula multiplicando su largo por su ancho. La unidad es cuadrada (cm², m², etc.).`;
                break;
                
            case 'circulo':
                const radio = this.randomNumber(config.rangeMin, Math.min(config.rangeMax, 20));
                answer = Math.round(Math.PI * radio * radio * 100) / 100;
                question = `Calcula el área de un círculo con radio ${radio} cm (usa π ≈ 3.14)`;
                steps.push(`Fórmula del área: A = πr²`);
                steps.push(`Sustituir valores: A = π × ${radio}²`);
                steps.push(`Calcular: A = 3.14 × ${radio * radio}`);
                steps.push(`Resultado: A ≈ ${answer} cm²`);
                concept = `El área de un círculo se calcula con la fórmula A = πr², donde r es el radio. π (pi) es aproximadamente 3.14159.`;
                break;
                
            case 'triangulo':
                const base = this.randomNumber(config.rangeMin, config.rangeMax);
                const altura = this.randomNumber(config.rangeMin, config.rangeMax);
                answer = Math.round((base * altura) / 2);
                question = `Calcula el área de un triángulo con base ${base} cm y altura ${altura} cm`;
                steps.push(`Fórmula del área: A = (base × altura) / 2`);
                steps.push(`Sustituir valores: A = (${base} × ${altura}) / 2`);
                steps.push(`Calcular: A = ${base * altura} / 2`);
                steps.push(`Resultado: A = ${answer} cm²`);
                concept = `El área de un triángulo es la mitad del producto de su base por su altura: A = (b × h) / 2.`;
                break;
        }
        
        return {
            question: question,
            answer: answer,
            steps: steps,
            concept: concept
        };
    },

    /**
     * Genera un ejercicio de trigonometría
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Objeto con pregunta, respuesta y solución
     */
    generateTrigonometria(difficulty) {
        const config = CONFIG.difficulty[difficulty];
        const angles = [30, 45, 60, 90];
        const angle = angles[Math.floor(Math.random() * angles.length)];
        const functions = ['seno', 'coseno'];
        const func = functions[Math.floor(Math.random() * functions.length)];
        
        const values = {
            seno: { 30: 0.5, 45: 0.71, 60: 0.87, 90: 1 },
            coseno: { 30: 0.87, 45: 0.71, 60: 0.5, 90: 0 }
        };
        
        const answer = values[func][angle];
        const steps = [];
        
        if (func === 'seno') {
            steps.push(`El seno de ${angle}° es un valor conocido`);
            steps.push(`sen(${angle}°) = ${answer}`);
            steps.push(`Valor aproximado: ${answer}`);
        } else {
            steps.push(`El coseno de ${angle}° es un valor conocido`);
            steps.push(`cos(${angle}°) = ${answer}`);
            steps.push(`Valor aproximado: ${answer}`);
        }
        
        return {
            question: `¿Cuál es el valor aproximado del ${func} de ${angle}°? (redondea a 2 decimales)`,
            answer: answer,
            steps: steps,
            concept: `Las razones trigonométricas relacionan los ángulos de un triángulo rectángulo con las longitudes de sus lados. Seno = cateto opuesto / hipotenusa, Coseno = cateto adyacente / hipotenusa.`
        };
    },

    /**
     * Genera un ejercicio de funciones
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Objeto con pregunta, respuesta y solución
     */
    generateFunciones(difficulty) {
        const config = CONFIG.difficulty[difficulty];
        const m = this.randomNumber(2, 10); // Pendiente
        const b = this.randomNumber(-20, 20); // Intercepto
        const x = this.randomNumber(config.rangeMin, Math.min(config.rangeMax, 20));
        const answer = m * x + b;
        
        const steps = [];
        steps.push(`Función: f(x) = ${m}x + ${b}`);
        steps.push(`Sustituir x = ${x}: f(${x}) = ${m}(${x}) + ${b}`);
        steps.push(`Multiplicar: f(${x}) = ${m * x} + ${b}`);
        steps.push(`Sumar: f(${x}) = ${answer}`);
        
        return {
            question: `Si f(x) = ${m}x + ${b}, calcula f(${x})`,
            answer: answer,
            steps: steps,
            concept: `Una función lineal tiene la forma f(x) = mx + b, donde m es la pendiente y b es el intercepto en y. Para evaluar, simplemente sustituye el valor de x y calcula.`
        };
    },

    /**
     * Genera un ejercicio según el tema y dificultad
     * @param {string} topic - Tema matemático
     * @param {string} difficulty - Nivel de dificultad
     * @returns {object} Ejercicio generado
     */
    generate(topic, difficulty) {
        switch(topic) {
            case 'algebra':
                return this.generateAlgebra(difficulty);
            case 'ecuaciones':
                return this.generateEcuaciones(difficulty);
            case 'geometria':
                return this.generateGeometria(difficulty);
            case 'trigonometria':
                return this.generateTrigonometria(difficulty);
            case 'funciones':
                return this.generateFunciones(difficulty);
            default:
                return this.generateAlgebra(difficulty);
        }
    }
};

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExerciseGenerator;
}
