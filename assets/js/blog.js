// use the same client setup as your other pages
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function loadPosts() {
  const { data, error } = await sb
    .from('posts')
    .select('slug,title,summary,image_url,category,published_at')
    .order('published_at', { ascending: false });

  const el = document.getElementById('posts');
  if (error) { el.textContent = 'Could not load posts.'; return; }
  if (!data.length) { el.textContent = 'No posts yet.'; return; }

  el.innerHTML = data.map(p => `
    <article class="post-card">
      ${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : ''}
      <div>
        <small>${esc(p.category)} · ${new Date(p.published_at).toLocaleDateString('en-AU', {day:'numeric', month:'long', year:'numeric'})}</small>
        <h2><a href="post.html?slug=${encodeURIComponent(p.slug)}">${esc(p.title)}</a></h2>
        <p>${esc(p.summary)}</p>
      </div>
    </article>`).join('');
}
loadPosts();