import re

with open('simulacro-icfes.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# The new else block with algorithm hints
new_else = r"""            } else {
                // Mapa de pistas algorítmicas por tema
                const topicHints = {
                    "Probabilidad":   ["1️⃣ Identifica el espacio muestral (todos los resultados posibles).", "2️⃣ Cuenta los casos favorables al evento pedido.", "3️⃣ Aplica: P = casos favorables ÷ espacio muestral.", "4️⃣ Simplifica la fracción si es necesario."],
                    "Estadística":    ["1️⃣ Ordena los datos de menor a mayor.", "2️⃣ Calcula la media (suma ÷ total de datos).", "3️⃣ Ubica la mediana (valor central) y la moda (más repetido).", "4️⃣ Interpreta el resultado en el contexto del problema."],
                    "Álgebra":        ["1️⃣ Identifica variables y constantes en la expresión.", "2️⃣ Aplica la propiedad distributiva si hay paréntesis.", "3️⃣ Agrupa y simplifica términos semejantes.", "4️⃣ Despeja la variable objetivo y verifica tu resultado."],
                    "Geometría":      ["1️⃣ Identifica la figura geométrica del problema.", "2️⃣ Recuerda las fórmulas aplicables (área, perímetro, ángulos).", "3️⃣ Sustituye los valores dados en la fórmula.", "4️⃣ Realiza la operación verificando las unidades."],
                    "Funciones":      ["1️⃣ Determina el tipo de función (lineal, cuadrática, etc.).", "2️⃣ Encuentra o interpreta la regla f(x).", "3️⃣ Evalúa sustituyendo el valor de x pedido.", "4️⃣ Interpreta el resultado en el contexto del problema."],
                    "Trigonometría":  ["1️⃣ Identifica el triángulo rectángulo involucrado.", "2️⃣ Etiqueta hipotenusa, cateto opuesto y cateto adyacente.", "3️⃣ Selecciona la razón correcta (sen, cos o tan).", "4️⃣ Despeja y calcula el lado o ángulo desconocido."],
                    "Números":        ["1️⃣ Identifica el tipo de número (natural, entero, racional).", "2️⃣ Aplica la jerarquía: paréntesis → potencias → × ÷ → + −.", "3️⃣ Simplifica paso a paso sin saltarte operaciones.", "4️⃣ Verifica con la operación inversa."],
                    "Volumen":        ["1️⃣ Identifica el sólido geométrico (prisma, cilindro, cono, esfera).", "2️⃣ Recuerda su fórmula de volumen.", "3️⃣ Sustituye las medidas dadas correctamente.", "4️⃣ Calcula y expresa el resultado en unidades cúbicas."],
                    "Razones":        ["1️⃣ Escribe la razón como fracción a/b.", "2️⃣ Si es proporción, usa la regla de la cruz: a×d = b×c.", "3️⃣ Despeja el valor desconocido.", "4️⃣ Verifica que la proporción sea consistente."],
                    "default":        ["1️⃣ Lee el enunciado completo con calma.", "2️⃣ Identifica los datos conocidos y lo que se pide.", "3️⃣ Selecciona el concepto o fórmula aplicable.", "4️⃣ Ejecuta el procedimiento paso a paso y verifica tu resultado."]
                };
                let hints = topicHints["default"];
                for (const key of Object.keys(topicHints)) {
                    if (topic.toLowerCase().includes(key.toLowerCase())) { hints = topicHints[key]; break; }
                }
                const hintHTML = hints.map(h => `<li style="margin-bottom:0.5rem; line-height:1.5;">${h}</li>`).join('');

                const rawPrompt = `Actúa como un tutor de matemáticas experto en pedagogía ICFES. Acabo de fallar un ejercicio sobre "${topic}". Necesito que:\n1. Me expliques paso a paso el concepto de ${topic} de forma muy sencilla.\n2. Sugieras recursos interactivos (video, podcast, infografía) sobre ${topic}.\n3. Me des un resumen esquemático para no volver a fallar en este tipo de preguntas.`;

                feedbackDiv.innerHTML = `
                    <div class="feedback-error" oncontextmenu="showCtxMenu(event, \`${rawPrompt.replace(/`/g,'\\`')}\`)">
                        <h4>¡Aprender es intentar de nuevo! 💡</h4>
                        <p>El concepto que debes reforzar es <strong>${topic}</strong>. Sigue este algoritmo de resolución:</p>
                        <ul style="margin:1rem 0; padding:1rem; background:rgba(0,0,0,0.15); border-radius:8px; list-style:none;">
                            ${hintHTML}
                        </ul>
                        <p style="margin-top:10px; font-size:0.85rem; color:#94A3B8;">
                            <i class="fas fa-hand-pointer"></i> <em>Clic derecho sobre este recuadro para profundizar con una IA.</em>
                        </p>
                        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:1rem;">
                            <a href="https://notebooklm.google.com/" target="_blank" class="notebook-btn"><i class="fas fa-microchip"></i> NotebookLM</a>
                            <a href="https://gemini.google.com/app" target="_blank" class="gemini-btn"><i class="fas fa-brain"></i> Gemini</a>
                            <a href="https://copilot.microsoft.com/" target="_blank" class="copilot-btn"><i class="fab fa-microsoft"></i> Copilot</a>
                        </div>
                        <div style="margin-top:1rem; background:rgba(0,0,0,0.2); border-radius:8px; padding:1rem;">
                            <p style="font-size:0.8rem; color:#94A3B8; margin-bottom:0.5rem;"><i class="fas fa-copy"></i> Copia y pega este prompt en la IA de tu preferencia:</p>
                            <textarea readonly onclick="this.select()" style="width:100%; background:rgba(255,255,255,0.05); color:#e2e8f0; border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:0.75rem; font-size:0.85rem; resize:none; min-height:90px; font-family:monospace; cursor:text;">${rawPrompt}</textarea>
                        </div>
                    </div>
                `;
            }
        }
    </script>"""

# Replace the old else block
old_else_pattern = re.compile(
    r'            \} else \{.*?</script>',
    re.DOTALL
)

if old_else_pattern.search(content):
    content = old_else_pattern.sub(new_else, content, count=1)
    with open('simulacro-icfes.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("OK: Actualizado correctamente.")
else:
    print("ERROR: Patron no encontrado.")
