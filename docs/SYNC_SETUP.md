# Configurar sincronización de puntos (Workflow)

Este documento explica cómo desplegar un endpoint serverless (ej. Netlify/Vercel) que permita disparar el workflow `sync-student-points.yml` de este repo de forma segura.

Pasos (Netlify):

1. Añade el archivo `netlify/functions/trigger-sync.js` a tu sitio (ya incluido en el repo).
2. En Netlify > Site settings > Build & deploy > Environment > Environment variables, crea las variables:
   - `GITHUB_TOKEN`: un Personal Access Token con permisos `repo` y `workflow` (o `repo` y `contents: write`).
   - `GITHUB_OWNER`: tu usuario o la organización (ej. `franciscodiazo`).
   - `GITHUB_REPO`: el nombre del repo (ej. `franciscodiazo.github.io`).
   - Opcional: `WORKFLOW_FILE` si usas un nombre de workflow distinto al predeterminado (`sync-student-points.yml`).
   - Opcional: `SYNC_SECRET` para proteger el endpoint; si lo defines, el cliente debe enviar cabecera `x-sync-secret` con el mismo valor.
3. Despliega el sitio en Netlify. La función quedará disponible en `/.netlify/functions/trigger-sync`.

Uso desde el cliente (ya implementado):
- El botón `Sincronizar puntos` en `11-3/students.html` llama a `window.triggerPointsSync()` que por defecto llama a `/.netlify/functions/trigger-sync`.
- Puedes sobrescribir el endpoint con `window.SYNC_ENDPOINT = 'https://tusite.netlify.app/.netlify/functions/trigger-sync'` si usas otro dominio.

Seguridad y recomendaciones 🔒
- Nunca pongas tokens en el frontend. Usa el servidorless con variables de entorno.
- Si expones el endpoint públicamente, protege con `SYNC_SECRET` o auth adicional.
- Revisa la ejecución del workflow en GitHub Actions y verifica que `11-3/data/points.json` se haya actualizado.

Si quieres, puedo ayudarte a desplegar esto en Netlify o Vercel y probar un disparo de workflow con tus credenciales (necesitarás configurar `GITHUB_TOKEN` en el panel de despliegue).