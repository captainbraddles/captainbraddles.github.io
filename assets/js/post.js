const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = d => new Date(d).toLocaleDateString('en-AU',
    { day: 'numeric', month: 'long', year: 'numeric' });

// Links to other sites open in a new tab
DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName !== 'A') return;
    const href = node.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) && !href.startsWith(location.origin)) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const el = document.getElementById('post');

    try {
        const slug = new URLSearchParams(location.search).get('slug');
        if (!slug) throw new Error('No slug in URL');

        const { data, error } = await db
            .from('posts')
            .select('title, summary, content, image_url, category, published_at')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Post not found');

        document.title = data.title + ' | SportsMaster';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && data.summary) metaDesc.setAttribute('content', data.summary);

        const bodyHtml = DOMPurify.sanitize(marked.parse(data.content));

        el.innerHTML = `
            <header class="post-header">
                <div class="post-meta">${esc(data.category)} · ${fmtDate(data.published_at)}</div>
                <h1>${esc(data.title)}</h1>
                ${data.summary ? `<p class="post-summary">${esc(data.summary)}</p>` : ''}
            </header>
            ${data.image_url
                ? `<img class="post-hero" src="${esc(data.image_url)}" alt="${esc(data.title)}">`
                : ''}
            <div class="post-body">${bodyHtml}</div>`;

        await loadNeighbours(data.published_at);
    } catch (e) {
        console.error('Error loading post:', e);
        el.innerHTML = '<header class="post-header"><h1>Post not found</h1></header>' +
            '<p>This post may have been removed or is not published yet.</p>';
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        const content = document.getElementById('content');
        if (content) content.style.display = 'block';
    }
});

// "Older" and "Newer" links. A failure here shouldn't break the post itself.
async function loadNeighbours(publishedAt) {
    try {
        const [older, newer] = await Promise.all([
            db.from('posts').select('slug, title')
                .lt('published_at', publishedAt)
                .order('published_at', { ascending: false }).limit(1),
            db.from('posts').select('slug, title')
                .gt('published_at', publishedAt)
                .order('published_at', { ascending: true }).limit(1)
        ]);

        const link = (post, label, cls) => post
            ? `<a class="${cls}" href="post.html?slug=${encodeURIComponent(post.slug)}">
                   <span class="post-nav-label">${label}</span>
                   <span class="post-nav-title">${esc(post.title)}</span>
               </a>`
            : '';

        const o = older.data && older.data[0];
        const n = newer.data && newer.data[0];
        if (!o && !n) return;

        const nav = document.getElementById('post-nav');
        nav.innerHTML = link(o, '← Older', 'post-nav-prev') + link(n, 'Newer →', 'post-nav-next');
        nav.hidden = false;
    } catch (e) {
        console.error('Could not load neighbouring posts:', e);
    }
}