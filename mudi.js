/* mudi.js - Lógica del Laboratorio Avanzado MUDI */
document.addEventListener("DOMContentLoaded", () => {
    
    const playground = document.getElementById("playground");
    const globalSumEl = document.getElementById("global-sum");
    const decompBox = document.getElementById("decomp-box");
    const opDisplay = document.getElementById("operation-display");
    const logExpBox = document.getElementById("log-exp-box");
    const btnClear = document.getElementById("btn-clear");

    let blocks = [];
    let draggedEl = null;
    let offsetX = 0;
    let offsetY = 0;

    const COLORS = {
        "1000000": "#ec4899",
        "1000": "#f59e0b",
        "100": "#ef4444",
        "10": "#3b82f6",
        "1": "#10b981",
        "0.1": "#94a3b8",
        "0.01": "#64748b",
        "0.001": "#475569"
    };

    // == GENERACION DE BLOQUES ==
    document.querySelectorAll(".gen-item").forEach(item => {
        item.addEventListener("click", () => {
            const val = item.dataset.val;
            const type = item.dataset.type;

            if (type === "exponent" || type === "root") {
                openOperationWizard(type);
                return;
            }

            if (val) createBlock(parseFloat(val));
        });
    });

    function createBlock(value, x = null, y = null) {
        const block = document.createElement("div");
        block.className = "math-block";
        
        // Dimensiones basadas en magnitud
        let size = 40;
        if (value >= 10) size = 50;
        if (value >= 100) size = 70;
        if (value >= 1000) size = 90;
        if (value >= 1000000) size = 120;
        
        block.style.width = size + "px";
        block.style.height = size + "px";
        block.style.backgroundColor = COLORS[value.toString()] || "#3b82f6";
        
        // Etiqueta legible
        let labelText = value >= 1000 ? (value/1000) + "k" : value.toString();
        if (value === 1000000) labelText = "1M";
        
        const span = document.createElement("span");
        span.textContent = labelText;
        block.appendChild(span);
        
        // Posicionamiento
        const pgRect = playground.getBoundingClientRect();
        block.style.left = (x || pgRect.width / 2 - size / 2) + "px";
        block.style.top = (y || pgRect.height / 2 - size / 2) + "px";
        
        block.dataset.value = value;
        
        playground.appendChild(block);
        blocks.push(block);
        setupDraggable(block);
        evaluateSystem();
    }

    // == SISTEMA DE ARRASTRE ==
    function setupDraggable(el) {
        el.onmousedown = (e) => {
            draggedEl = el;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            el.style.cursor = "grabbing";
        };
    }

    document.onmousemove = (e) => {
        if (!draggedEl) return;
        const pgRect = playground.getBoundingClientRect();
        let x = e.clientX - pgRect.left - offsetX;
        let y = e.clientY - pgRect.top - offsetY;
        
        draggedEl.style.left = x + "px";
        draggedEl.style.top = y + "px";
    };

    document.onmouseup = () => {
        if (draggedEl) {
            draggedEl.style.cursor = "grab";
            checkCollisions(draggedEl);
            draggedEl = null;
            evaluateSystem();
        }
    };

    // == LOGICA MATEMATICA AVANZADA ==
    function evaluateSystem() {
        let total = 0;
        let breakdown = {
            M: 0, k: 0, C: 0, D: 0, U: 0, d: 0, c: 0, m: 0
        };

        blocks.forEach(b => {
            const v = parseFloat(b.dataset.value);
            total += v;
            
            if (v === 1000000) breakdown.M++;
            else if (v === 1000) breakdown.k++;
            else if (v === 100) breakdown.C++;
            else if (v === 10) breakdown.D++;
            else if (v === 1) breakdown.U++;
            else if (v === 0.1) breakdown.d++;
            else if (v === 0.01) breakdown.c++;
            else if (v === 0.001) breakdown.m++;
        });

        // Actualizar UI
        globalSumEl.innerText = `Total: ${total.toLocaleString()}`;
        
        // Construir visualización de descomposición
        let decompHtml = "<div style='display:flex; flex-wrap:wrap; gap:5px;'>";
        if (breakdown.M > 0) decompHtml += `<span style="color:var(--color-millon)">${breakdown.M}M</span> + `;
        if (breakdown.k > 0) decompHtml += `<span style="color:var(--color-m)">${breakdown.k}k</span> + `;
        if (breakdown.C > 0) decompHtml += `<span style="color:var(--color-c)">${breakdown.C}C</span> + `;
        if (breakdown.D > 0) decompHtml += `<span style="color:var(--color-d)">${breakdown.D}D</span> + `;
        if (breakdown.U > 0) decompHtml += `<span style="color:var(--color-u)">${breakdown.U}U</span>`;
        decompHtml += "</div>";
        decompBox.innerHTML = total === 0 ? "Agrega bloques..." : decompHtml;

        // Actualizar Pantalla Principal
        opDisplay.innerText = total > 0 ? total.toLocaleString() : "Esperando bloques...";
        
        updateAdvancedTheory(total);
    }

    function updateAdvancedTheory(total) {
        if (total <= 0) {
            logExpBox.innerHTML = "Usa los bloques de operación para visualizar potencias.";
            return;
        }
        
        let theory = `<div class='theory-card' style='border-left: 4px solid var(--accent-purple);'>`;
        theory += `<strong style='color:var(--accent-purple)'>Laboratorio Analítico de ${total}:</strong><br><br>`;
        
        // --- MULTIPLICACION SIN MEMORIA (MODELO DE AREA) ---
        if (total < 100) {
            let d = Math.floor(total / 10);
            let u = total % 10;
            theory += `🏢 <strong>Truco de Multiplicación (Modelo de Área):</strong><br>`;
            theory += `Si multiplicas ${total} × 5, no memorices. Descompón:<br>`;
            theory += `(${d}0 × 5) + (${u} × 5) = ${d*10*5} + ${u*5} = ${total*5}<br><br>`;
        }

        // --- EXPONENTES Y LOGARITMOS ---
        theory += `📐 <strong>Potencias y Logaritmos:</strong><br>`;
        
        const logContent = detectLogarithm(total);
        if (logContent) {
            theory += `<div style="background: #fff; padding: 10px; border-radius: 8px; margin: 8px 0; border: 1px dashed var(--accent-purple);">${logContent}</div>`;
        } else {
            let base2 = Math.log2(total);
            if (Number.isInteger(base2)) {
                theory += `Estructura binaria: 2<sup>${base2}</sup> = ${total}. Esto significa que para llegar a ${total}, multiplicamos el 2 por sí mismo ${base2} veces.<br>`;
            } else {
                theory += `Este número se descompone en ${blocks.length} piezas base.<br>`;
            }
        }
        
        // --- DIVISION (REPARTO) ---
        theory += `<br>➗ <strong>División por Descomposición:</strong><br>`;
        theory += `Para dividir ${total} entre 2, divide cada grupo:<br>`;
        theory += `La mitad de ${total} es ${total/2}. Visualmente, reparte los bloques en dos montones iguales.`;
        
        theory += `</div>`;
        logExpBox.innerHTML = theory;
    }

    function checkCollisions(el) {
        // Lógica para "fusionar" bloques si se desea, 
        // por ahora solo evaluamos posición
    }

    // == MANEJO SEGURO DE OPERACIONES (SIN ALERTAS) ==
    const advPanel = document.getElementById("advanced-explanation");
    const expTitle = document.getElementById("exp-title");
    const expContent = document.getElementById("exp-content");

    btnCalcPow.addEventListener("click", () => {
        const base = parseFloat(baseInput.value);
        const exp = parseFloat(expInput.value);
        
        if (isNaN(base) || isNaN(exp)) return;

        if (exp > 10) {
            showOnBoardExpl("Límite alcanzado", "Por seguridad y rendimiento, el exponente máximo es 10.");
            return;
        }

        const res = Math.pow(base, exp);
        if (res > 2000000) {
            showOnBoardExpl("Número muy grande", "Este resultado supera los 2 millones, es difícil de visualizar con bloques.");
            return;
        }

        smartSpawn(res);
        
        // Explicación Pedagógica
        let html = `<strong>Potencia: ${base}<sup>${exp}</sup> = ${res}</strong><br><br>`;
        html += `La potenciación es multiplicar la base (<strong>${base}</strong>) por sí misma la cantidad de veces que indica el exponente (<strong>${exp}</strong>).<br><br>`;
        html += `<i class="fas fa-arrow-right"></i> Hemos generado ${res} unidades en el tablero.`;
        
        showOnBoardExpl("¿Qué es la Potencia?", html);
        evaluateSystem();
    });

    btnCalcRoot.addEventListener("click", () => {
        const num = parseFloat(rootInput.value);
        if (isNaN(num) || num < 0) return;
        
        const res = Math.sqrt(num);
        
        let html = `<strong>Raíz Cuadrada: √${num} ≈ ${res.toFixed(2)}</strong><br><br>`;
        html += `La radicación es la operación inversa a la potencia. Buscamos qué número multiplicado por sí mismo nos da <strong>${num}</strong>.<br><br>`;
        html += `Calculamos: ${res.toFixed(2)} × ${res.toFixed(2)} ≈ ${num}.`;
        
        showOnBoardExpl("¿Qué es la Radicación?", html);
    });

    function showOnBoardExpl(title, content) {
        advPanel.style.display = "block";
        expTitle.textContent = title;
        expContent.innerHTML = content; // Seguro ya que el contenido es generado internamente
    }

    // Calcular Logaritmo Automático cuando el total cambia
    function detectLogarithm(total) {
        if (total <= 1) return "";
        
        let log10 = Math.log10(total);
        if (Number.isInteger(log10)) {
            return `<strong>Logaritmo: Log<sub>10</sub>(${total}) = ${log10}</strong><br> El logaritmo busca el exponente. ¿A cuánto elevo 10 para llegar a ${total}? R: a ${log10}.`;
        }
        return "";
    }

    function smartSpawn(value) {
        // Validación de seguridad para evitar bucles infinitos por valores extraños
        if (!isFinite(value) || value < 0) return;

        let remaining = value;
        const vals = [1000000, 1000, 100, 10, 1, 0.1, 0.01, 0.001];
        
        // Limitar número máximo de bloques para evitar colapso de memoria (ataque DoS local)
        let blockCount = 0;
        const MAX_BLOCKS = 500;

        vals.forEach(v => {
            while (remaining >= v && blockCount < MAX_BLOCKS) {
                createBlock(v);
                remaining -= v;
                remaining = Math.round(remaining * 1000) / 1000;
                blockCount++;
            }
        });

        if (blockCount >= MAX_BLOCKS) {
            alert("Se alcanzó el límite de bloques visibles por seguridad.");
        }
    }

    btnClear.onclick = () => {
        blocks.forEach(b => b.remove());
        blocks = [];
        evaluateSystem();
    };

});
