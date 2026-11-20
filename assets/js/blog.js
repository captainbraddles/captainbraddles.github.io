const DEFAULT_IMAGE = 'images/Official Logo.png';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('output').innerHTML =
            '<li><p>Could not load news posts.</p></li>';
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        const content = document.getElementById('content');
        if (content) content.style.display = 'block';
    }
});

async function loadPosts() {
    const { data, error } = await db
        .from('posts')
        .select('slug, title, summary, image_url, category, published_at')
        .order('published_at', { ascending: false });
    if (error) throw error;

    const container = document.getElementById('output');
    if (!data.length) {
        container.innerHTML = '<li><p>No news posts yet.</p></li>';
        return;
    }

    container.innerHTML = data.map((p, i) => {
        const img = esc(p.image_url || DEFAULT_IMAGE);
        const href = 'post.html?slug=' + encodeURIComponent(p.slug);
        const date = new Date(p.published_at).toLocaleDateString('en-AU',
            { day: 'numeric', month: 'long', year: 'numeric' });
        return `
        <li class="news-card${i === 0 ? ' news-featured' : ''}">
            <a class="news-image-link" href="${href}" tabindex="-1" aria-hidden="true">
                <img loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"
                     src="${img}" alt="">
            </a>
            <div class="news-body">
                <div class="news-meta">${esc(p.category)} · ${date}</div>
                <h2 class="news-title"><a href="${href}">${esc(p.title)}</a></h2>
                <p class="news-summary">${esc(p.summary)}</p>
                <a class="news-more" href="${href}">Read more →</a>
            </div>
        </li>`;
    }).join('');
}