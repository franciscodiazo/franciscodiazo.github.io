import os
import glob
import re

GLOBAL_HEADER = """
    <header class="navbar">
        <div class="container nav-container">
            <a href="index.html" class="logo">
                <span class="logo-text">ingfrancisco</span><span class="logo-accent">diaz</span><span
                    class="logo-dot">.</span>
            </a>
            
            <nav class="nav-links">
                <a href="index.html">Inicio</a>
                
                <div class="nav-dropdown">
                    <span class="nav-dropdown-trigger">STEM & Proyectos <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></span>
                    <div class="nav-dropdown-content">
                        <a href="entorno-matematico.html"><i class="fas fa-shapes" style="margin-right: 0.5rem; width: 15px;"></i> Laboratorio Matemático</a>
                        <a href="tablero.html"><i class="fas fa-chalkboard" style="margin-right: 0.5rem; width: 15px;"></i> Tablero Interactivo</a>
                        <a href="recursos.html"><i class="fas fa-flask" style="margin-right: 0.5rem; width: 15px;"></i> Recursos STEM</a>
                        <a href="proyectos-estudiantes.html"><i class="fas fa-rocket" style="margin-right: 0.5rem; width: 15px;"></i> Vitrina Estudiantil</a>
                    </div>
                </div>

                <div class="nav-dropdown">
                    <span class="nav-dropdown-trigger highlight-link">Saber 11 <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></span>
                    <div class="nav-dropdown-content">
                        <a href="Saber11_Matematicas_2026_10Encuentros.html"><i class="fas fa-graduation-cap" style="margin-right: 0.5rem; width: 15px;"></i> Guías Python</a>
                        <a href="simulacro-icfes.html"><i class="fas fa-check-double" style="margin-right: 0.5rem; width: 15px;"></i> Simulacro Interactivo</a>
                        <a href="guia-geometria-circular.html"><i class="fas fa-circle-notch" style="margin-right: 0.5rem; width: 15px;"></i> Guía: Geo. Circular</a>
                        <a href="geo-triangulos.html"><i class="fas fa-caret-up" style="margin-right: 0.5rem; width: 15px;"></i> Sim. Triángulos</a>
                        <a href="geo-circulo.html"><i class="fas fa-circle" style="margin-right: 0.5rem; width: 15px;"></i> Sim. El Círculo</a>
                    </div>
                </div>

                <div class="nav-dropdown">
                    <span class="nav-dropdown-trigger">Innovación <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></span>
                    <div class="nav-dropdown-content">
                        <a href="directorio-ia.html"><i class="fas fa-robot" style="margin-right: 0.5rem; width: 15px;"></i> Directorio IA</a>
                        <a href="dua.html"><i class="fas fa-universal-access" style="margin-right: 0.5rem; width: 15px;"></i> Propuesta DUA</a>
                    </div>
                </div>

                <div class="nav-dropdown">
                    <span class="nav-dropdown-trigger">El Mediador <i class="fas fa-chevron-down" style="font-size: 0.7rem;"></i></span>
                    <div class="nav-dropdown-content">
                        <a href="portafolio.html"><i class="fas fa-briefcase" style="margin-right: 0.5rem; width: 15px;"></i> Portafolio Web</a>
                        <a href="blog.html"><i class="fas fa-book-open" style="margin-right: 0.5rem; width: 15px;"></i> Bitácora</a>
                    </div>
                </div>
                
            </nav>
            <button class="mobile-menu-btn"><i class="fas fa-bars"></i></button>
        </div>
    </header>

    <div class="gamification-floating-bar">
        <div class="gamification-label">Insignias</div>
        <div id="gamification-badges" class="gamification-badges"></div>
    </div>
"""

FA_LINK = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
APP_JS = '<script src="app.js"></script>'
STYLE_CSS = '<link rel="stylesheet" href="style.css">'

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove obsolete internal navbar styles in simulacro-icfes.html
    # We remove .navbar { ... } and .navbar a { ... } and .navbar a:hover { ... }
    content = re.sub(r'\.navbar\s*\{[^}]*\}\s*', '', content)
    content = re.sub(r'\.navbar\s+a\s*\{[^}]*\}\s*', '', content)
    content = re.sub(r'\.navbar\s+a:hover\s*\{[^}]*\}\s*', '', content)

    # Remove conflicting background color from simulacro inner style
    if 'simulacro-icfes.html' in filepath:
        # Keep body { ... } but remove background-color: var(--light-bg) or background-color: #E2E8F0
        # Actually in simulacro, the body has body { background-color: #E2E8F0; color: var(--slate-gray); line-height: 1.6; }
        # Let's remove this completely so it uses style.css body:
        content = re.sub(r'body\s*\{.*?\}', '', content, flags=re.DOTALL)

    # 2. Add stylesheets if not exist
    if 'style.css' not in content:
        content = content.replace('</head>', f'    {STYLE_CSS}\n</head>')
    
    if 'font-awesome' not in content:
        content = content.replace('</head>', f'    {FA_LINK}\n</head>')

    # 3. Add app.js if not exists
    if 'app.js' not in content:
        content = content.replace('</body>', f'    {APP_JS}\n</body>')

    # 4. Remove old navbars
    content = re.sub(r'<header class="navbar".*?</header>', '', content, flags=re.DOTALL)
    content = re.sub(r'<nav class="navbar".*?</nav>', '', content, flags=re.DOTALL)
    content = re.sub(r'<header class="bc-header".*?</header>', '', content, flags=re.DOTALL)

    # 5. Inject the GLOBAL_HEADER right after <body>
    # Find <body> or <body ...>
    body_match = re.search(r'<body[^>]*>', content)
    if body_match:
        body_end = body_match.end()
        # insert
        content = content[:body_end] + "\n" + GLOBAL_HEADER + content[body_end:]

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    directory = r'c:\Users\Francisco\Documents\2026\ingfranciscodiaz.com'
    html_files = glob.glob(os.path.join(directory, '*.html'))
    for f in html_files:
        process_html_file(f)

if __name__ == '__main__':
    main()
