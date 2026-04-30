import re

new_styles = """
/* Gamificación Flotante */
.gamification-floating-bar {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 1500;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(12px);
    padding: 0.6rem 1rem;
    border-radius: 50px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    transition: var(--transition);
}

.gamification-floating-bar:hover {
    transform: scale(1.05);
    border-color: var(--accent-amber);
}

.gamification-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent-amber);
    text-transform: uppercase;
    letter-spacing: 1px;
    border-right: 1px solid var(--glass-border);
    padding-right: 1rem;
    white-space: nowrap;
}

.gamification-badges {
    display: flex;
    gap: 0.5rem;
}

.badge-icon {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: help;
    transition: var(--transition);
}

.badge-icon:hover {
    background: var(--accent-amber);
    border-color: var(--accent-amber);
    transform: scale(1.2) translateY(-4px);
    box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
}

@media (max-width: 768px) {
    .gamification-floating-bar {
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        justify-content: center;
    }
    .gamification-label {
        display: none;
    }
}
"""

with open('style.css', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Remove old gamification badges style
content = re.sub(r'/\* Contenedor de insignias.*?\.badge-icon:hover \{.*?\}', new_styles, content, flags=re.DOTALL)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(content)
