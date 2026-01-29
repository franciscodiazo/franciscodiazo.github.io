# Configurar sincronización de puntos (Workflow)

1. Despliega la función serverless (Netlify/Vercel) con estas variables de entorno:
   - `GITHUB_TOKEN`: PAT con permisos `repo` y `workflow`.
   - `GITHUB_OWNER`: tu usuario o la organización.
   - `GITHUB_REPO`: nombre del repo (ej. `franciscodiazo.github.io`).
   - `WORKFLOW_FILE`: (opcional) nombre del workflow si no usas `sync-student-points.yml`.
   - `SYNC_SECRET`: (opcional) secreto que el cliente debe enviar en la cabecera `x-sync-secret`.

2. El botón "Sincronizar puntos" en /11-3/ llama a la función por defecto en `/.netlify/functions/trigger-sync`.

3. Para disparar manualmente el workflow, usa:

```
curl -X POST -H "Authorization: token YOUR_TOKEN" -H "Accept: application/vnd.github+json" https://api.github.com/repos/OWNER/REPO/actions/workflows/sync-student-points.yml/dispatches -d '{"ref":"main","inputs":{"points":"<JSON_ESCAPED>"}}'
```

Seguridad: no uses tokens en el frontend; protege la función con `SYNC_SECRET` y variables de entorno en Netlify.