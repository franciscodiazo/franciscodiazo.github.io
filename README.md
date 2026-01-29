Prototipo mínimo del sitio de Francisco Díaz.

Incluye:
- Home (`index.html`)
- Área 11-3 (`11-3/index.html`) con calendario, actividades y gamificación mínima

Para ver en local: abrir `index.html` en un servidor estático (Live Server / http-server) o desplegar en GitHub Pages.

Self-hosting de Bootstrap (opcional, recomendado para rendimiento):

- Hay un script PowerShell que descarga los archivos de Bootstrap en `assets/vendor/bootstrap/`.
- Ejecuta en tu entorno (PowerShell):

  powershell -ExecutionPolicy Bypass -File scripts\fetch-bootstrap.ps1

- Luego agrega y commitea `assets/vendor/bootstrap/bootstrap.min.css` y `assets/vendor/bootstrap/bootstrap.bundle.min.js` para servirlos desde tu propio dominio, reduciendo latencia y dependencias externas.
