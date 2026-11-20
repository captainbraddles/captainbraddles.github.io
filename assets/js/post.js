const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadPost() {
  const slug = new URLSearchParams(location.search).get('slug');
  const el = document.getElementById('post');
  if (!slug) { el.textContent = 'Post not found.'; return; }

  const { data, error } = await sb
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) { el.textContent = 'Post not found.'; return; }

  document.title = data.title;
  const html = DOMPurify.sanitize(marked.parse(data.content));
  const date = new Date(data.published_at)
    .toLocaleDateString('en-AU', {day:'numeric', month:'long', year:'numeric'});

  el.innerHTML = `
    <h1></h1>
    <small>${date}</small>
    ${data.image_url ? `<img src="${data.image_url}" alt="" style="max-width:100%">` : ''}
    <div class="post-body">${html}</div>`;
  el.querySelector('h1').textContent = data.title;
}
loadPost();