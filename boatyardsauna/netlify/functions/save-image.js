// save-image.js — lets the owner publish a photo from the live site's editor
// (visit the site with ?edit). It commits the uploaded image into the repo via
// the GitHub API; Netlify then redeploys automatically, so the new photo goes
// live for everyone. No npm packages required.
//
// Netlify → Site settings → Environment variables:
//   GITHUB_TOKEN  = a GitHub token with Contents: read & write on the repo
//                   (fine-grained PAT recommended, limited to this one repo)
//   GITHUB_REPO   = CallumHalpinRooney/Janet-Cruise-Halpin
//   GITHUB_BRANCH = claude/jolly-hamilton-9g7btd   (the branch the site deploys from)
//   EDIT_PASSCODE = a passcode you choose (the editor asks for it before publishing)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { GITHUB_TOKEN, GITHUB_REPO, EDIT_PASSCODE } = process.env;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { statusCode: 501, body: JSON.stringify({ error: 'Image publishing not configured.' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }
  const { path, dataUrl, passcode } = body;

  if (EDIT_PASSCODE && passcode !== EDIT_PASSCODE) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Wrong passcode' }) };
  }
  if (!dataUrl || !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(dataUrl)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid image' }) };
  }
  // Only allow writing into this site's assets folder, image files only.
  if (!path || !/^boatyardsauna\/assets\/[\w-]+\.(jpe?g|png|webp)$/i.test(path)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid target path' }) };
  }

  const content = dataUrl.split(',')[1]; // base64 payload
  const api = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const headers = { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'User-Agent': 'boatyard-photo-editor' };

  try {
    // Look up the current file SHA (needed to update an existing file)
    let sha;
    const get = await fetch(`${api}?ref=${encodeURIComponent(BRANCH)}`, { headers });
    if (get.ok) { sha = (await get.json()).sha; }

    const put = await fetch(api, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Update ${path} via photo editor`, content, branch: BRANCH, ...(sha ? { sha } : {}) }),
    });
    const data = await put.json();
    if (!put.ok) return { statusCode: put.status, body: JSON.stringify({ error: data.message || 'GitHub error' }) };

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, commit: data.commit && data.commit.sha }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
