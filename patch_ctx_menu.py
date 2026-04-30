import re

file_path = 'simulacro-icfes.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Patrón para encontrar tarjetas de preguntas y extraer el ID, la imagen y el tema del botón evaluar
# Ejemplo: <button ... onclick="evaluar('q1', 'C', '1', 'Tema')">
pattern = r'(<div class="question-card" id="q(\d+)">.*?<img src="(assets/pruebas/\d+\.png)" alt="Pregunta \d+" class="question-image")(.*?>.*?onclick="evaluar\(\'q\d+\', \'\w\', \'\d+\', \'(.*?)\'\)")'

def replace_func(match):
    prefix = match.group(1)
    img_path = match.group(3)
    rest = match.group(4)
    topic = match.group(5)
    
    # Si ya tiene oncontextmenu, no lo duplicamos
    if 'oncontextmenu' in prefix:
        return match.group(0)
    
    new_img_tag = f'{prefix} oncontextmenu="showCtxMenu(event, \'Actúa como tutor ICFES. Ayúdame a analizar esta pregunta sobre {topic}. Explícame el concepto base y dame una pista sin darme la respuesta.\')"'
    return new_img_tag + rest

# Nota: El patrón de arriba es un poco complejo para re.sub directo con grupos grandes. 
# Vamos a usar una estrategia más simple por bloques de pregunta.

blocks = re.split(r'(<!-- Pregunta \d+ -->)', content)
new_content = []

for block in blocks:
    if 'question-card' in block:
        # Extraer tema
        topic_match = re.search(r"onclick=\"evaluar\('q\d+', '\w', '\d+', '(.*?)'\)\"", block)
        if topic_match:
            topic = topic_match.group(1)
            # Insertar oncontextmenu en la imagen
            block = re.sub(r'(<img src="assets/pruebas/\d+\.png" alt="Pregunta \d+" class="question-image")', 
                          fr'\1 oncontextmenu="showCtxMenu(event, \'Actúa como tutor ICFES. Ayúdame a analizar esta pregunta sobre {topic}. Explícame el concepto base y dame una pista sin darme la respuesta.\')"', 
                          block)
    new_content.append(block)

final_html = "".join(new_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_html)

print("Actualización de menús contextuales completada.")
