// Netlify function: dispatch workflow to sync student points
// Requires environment vars: GITHUB_TOKEN (repo scopes), GITHUB_OWNER, GITHUB_REPO, WORKFLOW_FILE (optional), SYNC_SECRET (optional)

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const secret = process.env.SYNC_SECRET;
  if (secret){ const provided = event.headers['x-sync-secret'] || event.headers['X-Sync-Secret']; if (provided !== secret) return { statusCode: 401, body: 'Unauthorized' }; }

  let body = {};
  try{ body = JSON.parse(event.body || '{}'); }catch(e){ return { statusCode:400, body:'Invalid JSON' } }
  const points = body.points; if (!points || typeof points !== 'object') return { statusCode:400, body:'Missing points payload' };

  const owner = process.env.GITHUB_OWNER || process.env.REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPO || process.env.REPOSITORY_NAME;
  const workflow = process.env.WORKFLOW_FILE || 'sync-student-points.yml';
  const token = process.env.GITHUB_TOKEN; if (!token) return { statusCode:500, body:'Server not configured (missing GITHUB_TOKEN)' };

  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;
  const payload = { ref: 'main', inputs: { points: JSON.stringify(points) } };

  const res = await fetch(url, { method:'POST', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if (res.status === 204) return { statusCode:200, body: JSON.stringify({ok:true, message:'Workflow dispatched'}) };
  const text = await res.text(); return { statusCode: res.status, body: text || 'Error dispatching workflow' };
};