document.addEventListener("DOMContentLoaded", () => {
    
    // Configuración Inicial
    const GRID_SIZE = 40;
    
    // Referencias DOM
    const playground = document.getElementById("playground");
    const explanationBox = document.getElementById("explanation-box");
    const numLineCanvas = document.getElementById("numLineCanvas");
    const colorPicker = document.getElementById("blockColor");
    const btnClear = document.getElementById("btn-clear");
    const scoreEl = document.getElementById("score");
    const btnDraw = document.getElementById("btn-draw");
    const btnEraseDraw = document.getElementById("btn-erase-draw");
    const drawingCanvas = document.getElementById("drawing-canvas");
    const gamificationPanel = document.getElementById("gamification-panel");
    const challengeText = document.getElementById("challenge-text");

    let blocks = [];
    let score = 0;
    let isDrawingMode = false;
    
    // == SISTEMA DE MISIONES (GAMIFICACIÓN) ==
    const challenges = [
        {
            text: "Forma el número 5 usando bloques unidos.",
            check: (groups) => groups.some(g => g.sumUnits === 5)
        },
        {
            text: "Forma el número 10 uniendo varios bloques.",
            check: (groups) => groups.some(g => g.sumUnits === 10)
        },
        {
            text: "Representa el número 15.",
            check: (groups) => groups.some(g => g.sumUnits === 15)
        }
    ];
    let currentChallengeIdx = 0;
    
    function updateChallengeUI() {
        if(!challengeText) return;
        if(currentChallengeIdx < challenges.length) {
            challengeText.innerHTML = challenges[currentChallengeIdx].text;
        } else {
            challengeText.innerHTML = "¡Has completado todos los retos básicos!";
        }
    }
    updateChallengeUI();

    // == RECTA NUMÉRICA ==
    function drawNumberLine(currentUnitsVal) {
        if(!numLineCanvas) return;
        const ctx = numLineCanvas.getContext("2d");
        ctx.clearRect(0, 0, numLineCanvas.width, numLineCanvas.height);
        
        const width = numLineCanvas.width;
        const height = numLineCanvas.height;
        const centerY = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(20, centerY);
        ctx.lineTo(width - 20, centerY);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = "#334155";
        ctx.font = "12px Inter";
        ctx.textAlign = "center";
        
        const minVal = -10;
        const maxVal = 20;
        const range = maxVal - minVal;
        const padding = 30;
        const spacing = (width - padding * 2) / range;
        
        for(let i = minVal; i <= maxVal; i++) {
            const x = padding + (i - minVal) * spacing;
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5);
            ctx.lineTo(x, centerY + 5);
            ctx.stroke();
            
            if(i % 5 === 0 || i === 0) {
                ctx.fillText(i, x, centerY + 20);
            }
        }
        
        const currentX = padding + (currentUnitsVal - minVal) * spacing;
        ctx.beginPath();
        ctx.arc(currentX, centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = currentUnitsVal < 0 ? "#ef4444" : "#10b981";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const originalX = padding + (0 - minVal) * spacing;
        if(currentUnitsVal !== 0) {
            ctx.beginPath();
            ctx.moveTo(originalX, centerY - 15);
            ctx.quadraticCurveTo((originalX + currentX)/2, centerY - 30, currentX, centerY - 15);
            ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // == SISTEMA DRAGGABLE Y BLOQUES DECIMALES ==
    let draggedEl = null;
    let offsetX = 0;
    let offsetY = 0;

    function createBlock(numericVal, xPos = null, yPos = null) {
        const block = document.createElement("div");
        block.className = "math-block num-block 3d-block";
        
        let w = GRID_SIZE, h = GRID_SIZE;
        if(numericVal !== 0) h = GRID_SIZE * Math.abs(numericVal);
        
        // Buscar color en el sidebar si existe
        const sidebarItems = Array.from(document.querySelectorAll(".generator-item"));
        const match = sidebarItems.find(item => parseInt(item.dataset.val) === numericVal);
        
        if (match && match.querySelector(".preview-block").style.background) {
            block.style.background = match.querySelector(".preview-block").style.background;
        } else {
            block.style.backgroundColor = numericVal < 0 ? "#ef4444" : "#3b82f6";
        }
        
        block.style.width = w + "px";
        block.style.height = h + "px";
        
        if(Math.abs(numericVal) > 1) {
            block.style.display = "flex";
            block.style.flexDirection = "column";
            for(let i=0; i<Math.abs(numericVal); i++) {
                const notch = document.createElement("div");
                notch.style.width = "100%";
                notch.style.height = "40px";
                notch.style.pointerEvents = "none";
                notch.style.borderBottom = i < Math.abs(numericVal) - 1 ? "1px solid rgba(0,0,0,0.4)" : "none";
                block.appendChild(notch);
            }
        } else {
            block.innerHTML = `<span style="display:flex; justify-content:center; align-items:center; width:100%; height:100%; font-weight:bold; pointer-events:none;">${numericVal}</span>`;
        }

        const pgRect = playground.getBoundingClientRect();
        const finalX = xPos !== null ? xPos : Math.round((pgRect.width/2 - w/2) / GRID_SIZE) * GRID_SIZE;
        const finalY = yPos !== null ? yPos : Math.round((pgRect.height/2 - h/2) / GRID_SIZE) * GRID_SIZE;

        block.style.left = finalX + "px";
        block.style.top = finalY + "px";
        block.dataset.u = numericVal; 
        block.dataset.rotated = "false";
        
        block.addEventListener("dblclick", () => {
            let isRotated = block.dataset.rotated === "true";
            block.dataset.rotated = isRotated ? "false" : "true";
            block.style.transform = block.dataset.rotated === "true" ? "rotate(90deg)" : "none";
            evaluateBoard();
        });
        
        playground.appendChild(block);
        blocks.push(block);
        setupDraggable(block);
        
        document.querySelector(".playground-hint").style.display = "none";
        evaluateBoard();
        return block;
    }

    // Interacción con la Recta Numérica
    let isDraggingLinePoint = false;
    let lastTotalOnLine = 0;

    numLineCanvas.addEventListener("mousedown", (e) => {
        const rect = numLineCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const centerY = numLineCanvas.height / 2;
        
        // Parámetros de la recta (como en drawNumberLine)
        const minVal = -10;
        const maxVal = 20;
        const padding = 30;
        const spacing = (numLineCanvas.width - padding * 2) / (maxVal - minVal);
        
        // Calcular posición actual del punto
        const currentX = padding + (lastTotalOnLine - minVal) * spacing;
        
        // Detectar si el clic está cerca del punto (radio de 15px para facilidad)
        const dist = Math.abs(x - currentX);
        if (dist < 15) {
            isDraggingLinePoint = true;
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDraggingLinePoint) return;
        
        const rect = numLineCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        const minVal = -10;
        const maxVal = 20;
        const padding = 30;
        const spacing = (numLineCanvas.width - padding * 2) / (maxVal - minVal);
        
        let newVal = Math.round((x - padding) / spacing + minVal);
        newVal = Math.max(minVal, Math.min(maxVal, newVal));
        
        if (newVal !== lastTotalOnLine) {
            const diff = newVal - lastTotalOnLine;
            // Si el valor cambia, crear bloques de unidad (+1 o -1)
            if (diff > 0) {
                for(let i=0; i<diff; i++) createBlock(1);
            } else {
                for(let i=0; i<Math.abs(diff); i++) createBlock(-1);
            }
            lastTotalOnLine = newVal;
        }
    });

    window.addEventListener("mouseup", () => {
        isDraggingLinePoint = false;
    });

    // Generar nuevos bloques desde el sidebar
    document.querySelectorAll(".generator-item").forEach(item => {
        item.addEventListener("click", () => {
            const valStr = item.dataset.val;
            createBlock(parseInt(valStr));
        });
    });

    // Funciones Draggable
    function setupDraggable(el) {
        const startDrag = (e) => {
            // Extremadamente importante para que navegadores móviles y desktop no rompan el arrastre
            if (e.type === "mousedown") e.preventDefault();
            if (e.type === "touchstart" && e.cancelable) e.preventDefault();
            
            draggedEl = el;
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = el.getBoundingClientRect();
            
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            
            el.classList.remove("snapping");
            el.style.zIndex = 1000;
        };
        
        el.addEventListener("mousedown", startDrag);
        el.addEventListener("touchstart", startDrag, {passive: false});
    }

    const moveDrag = (e) => {
        if (!draggedEl) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const pgRect = playground.getBoundingClientRect();
        
        let newLeft = clientX - pgRect.left - offsetX;
        let newTop = clientY - pgRect.top - offsetY;
        
        if (isNaN(newLeft)) newLeft = 0;
        if (isNaN(newTop)) newTop = 0;
        
        draggedEl.style.left = newLeft + "px";
        draggedEl.style.top = newTop + "px";
    };

    const endDrag = () => {
        if (!draggedEl) return;
        draggedEl.style.zIndex = "";
        draggedEl = null;
        evaluateBoard();
    };

    // Vincular al documento para no perder el seguimiento si el ratón se mueve muy rápido
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag, {passive: false}); 
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);

    // Sistema Analítico Logico
    function evaluateBoard() {
        if(blocks.length === 0) {
            explanationBox.innerHTML = "Coloca bloques en la pizarra para comenzar a interactuar.";
            drawNumberLine(0);
            return;
        }

        let groups = [];
        let visited = new Set();
        
        const isTouching = (a, b) => {
            const r1 = a.getBoundingClientRect();
            const r2 = b.getBoundingClientRect();
            const margin = 10;
            return !(r1.right < r2.left - margin || 
                     r1.left > r2.right + margin || 
                     r1.bottom < r2.top - margin || 
                     r1.top > r2.bottom + margin);
        };        

        blocks.forEach((block, idx) => {
            if(visited.has(idx)) return;
            
            let groupMeta = { sumUnits: 0, count: 0, elements: [] };
            let queue = [idx];
            visited.add(idx);
            
            while(queue.length > 0) {
                let currentIdx = queue.shift();
                let b1 = blocks[currentIdx];
                
                groupMeta.elements.push(b1);
                groupMeta.count++;
                groupMeta.sumUnits += parseFloat(b1.dataset.u || 0);
                
                blocks.forEach((b2, idx2) => {
                    if(!visited.has(idx2) && isTouching(b1, b2)) {
                        visited.add(idx2);
                        queue.push(idx2);
                    }
                });
            }
            groups.push(groupMeta);
        });

        let htmlExpl = "<ul>";
        let totalUnits = 0; 
        const pgRect = playground.getBoundingClientRect();
        
        document.querySelectorAll(".group-floating-label").forEach(l => l.remove());
        
        groups.forEach((g, i) => {
            totalUnits += g.sumUnits; 
            
            let textRep = `Magnitud construida: <strong>${g.sumUnits}</strong>`;
            
            if (g.count > 1) {
                let values = g.elements.map(b => parseFloat(b.dataset.u));
                let hasPositive = values.some(v => v > 0);
                let hasNegative = values.some(v => v < 0);
                
                let ecuacionStr = values.map((v, index) => {
                    if (index === 0) return v;
                    return v >= 0 ? `+ ${v}` : `- ${Math.abs(v)}`;
                }).join(" ");
                
                textRep += ` <br><span style="color:#94a3b8; font-size:0.85em;">Operación: ${ecuacionStr} = <strong>${g.sumUnits}</strong></span>`;
                
                if (hasPositive && hasNegative) {
                    textRep += `<br><span style="color:#0ea5e9; font-size:0.8em; font-style:italic;"><i class="fas fa-info-circle"></i> Los bloques positivos y negativos se restan entre sí (se cancelan).</span>`;
                }
            }
            
            htmlExpl += `<li style="margin-bottom:1.2rem; border-left: 3px solid #10b981; padding-left: 10px;">Conjunto ${i+1}: ${textRep}</li>`;
            
            if(g.count > 1 || g.sumUnits > 0) {
                let minTop = Infinity; 
                let centerX = 0;
                g.elements.forEach(b => {
                    const r = b.getBoundingClientRect();
                    if (r.top < minTop) minTop = r.top;
                    centerX += r.left + r.width/2;
                });
                centerX /= g.count; 
                
                const label = document.createElement("div");
                label.className = "group-floating-label";
                label.style.position = "absolute";
                label.style.left = (centerX - pgRect.left) + "px";
                label.style.top = (minTop - pgRect.top - 30) + "px";
                label.style.transform = "translateX(-50%)";
                label.style.background = "rgba(16, 185, 129, 0.9)";
                label.style.color = "white";
                label.style.padding = "4px 10px";
                label.style.borderRadius = "8px";
                label.style.fontSize = "14px";
                label.style.fontWeight = "bold";
                label.style.pointerEvents = "none"; 
                label.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
                label.style.zIndex = 500;
                label.innerHTML = `<i class="fas fa-layer-group"></i> ${g.sumUnits}`;
                
                playground.appendChild(label);
            }
        });
        htmlExpl += "</ul>";
        
        explanationBox.innerHTML = htmlExpl;
        lastTotalOnLine = totalUnits;
        drawNumberLine(totalUnits);
        checkChallenge(groups);
    }
    
    function checkChallenge(groups) {
        if(currentChallengeIdx >= challenges.length) return;
        const reto = challenges[currentChallengeIdx];
        if(reto.check && reto.check(groups)) {
            score += 100;
            scoreEl.innerText = score;
            
            if(gamificationPanel) {
                gamificationPanel.style.boxShadow = "0 0 15px #10b981";
                setTimeout(() => { gamificationPanel.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"; }, 1000);
            }
            
            currentChallengeIdx++;
            updateChallengeUI();
            
            const alert = document.createElement("div");
            alert.className = "challenge-success-alert glass-panel";
            alert.innerHTML = `<h3><i class="fas fa-star" style="color:gold;"></i> ¡Misión Cumplida! +100pts</h3>`;
            alert.style.position = "absolute";
            alert.style.top = "20%";
            alert.style.left = "50%";
            alert.style.transform = "translate(-50%, -50%)";
            alert.style.backgroundColor = "rgba(16, 185, 129, 0.9)";
            alert.style.padding = "10px 20px";
            alert.style.borderRadius = "8px";
            alert.style.color = "white";
            alert.style.zIndex = 9999;
            
            playground.appendChild(alert);
            setTimeout(() => {
                if(alert.parentNode) alert.parentNode.removeChild(alert);
            }, 3000);
        }
    }

    if(btnClear) btnClear.addEventListener("click", () => {
        blocks.forEach(b => b.remove());
        blocks = [];
        evaluateBoard();
    });

    lastTotalOnLine = 0;
    drawNumberLine(0);
});
