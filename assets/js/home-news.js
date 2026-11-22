const DEFAULT_IMAGE = 'images/Official Logo.png';

// Panel sizing on desktop
const PANEL_MAX = 320;   // widest the panel will get (px)
const PANEL_MIN = 230;   // narrower than this and the panel drops below the hero instead
const EDGE_GAP  = 12;    // minimum space between panel and overlay / page edge (px)

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = d => new Date(d).toLocaleDateString('en-AU',
    { day: 'numeric', month: 'short', year: 'numeric' });

/* Centre the panel in the space between the right edge of the hero's
   .cs-overlay and the right edge of the page, and halfway down the overlay. */
function positionPanel() {
    const panel   = document.getElementById('home-news');
    const wrap    = document.getElementById('hero-with-news');
    const overlay = document.querySelector('#hero-2335 .cs-overlay');
    if (!panel || !wrap || !overlay || panel.hidden) return;

    const unfloat = () => {
        panel.classList.remove('hn-floating');
        panel.style.top = panel.style.left = panel.style.width = '';
    };

    // Same breakpoint your hero uses for its desktop layout (64rem)
    if (!window.matchMedia('(min-width: 64rem)').matches) { unfloat(); return; }

    const w = wrap.getBoundingClientRect();
    const o = overlay.getBoundingClientRect();

    const space = w.right - o.right;                       // gap to the right of the overlay
    const width = Math.min(PANEL_MAX, space - EDGE_GAP * 2);
    if (width < PANEL_MIN) { unfloat(); return; }          // not enough room: sit below the hero

    panel.classList.add('hn-floating');
    panel.style.width = width + 'px';

    const left = (o.right - w.left) + (space - width) / 2;                  // centred horizontally in the gap
    const top  = (o.top - w.top) + o.height / 2 - panel.offsetHeight / 2;   // centred on the overlay's height

    panel.style.left = Math.round(left) + 'px';
    panel.style.top  = Math.round(Math.max(top, 0)) + 'px';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data, error } = await db
            .from('posts')
            .select('slug, title, image_url, category, published_at')
            .order('published_at', { ascending: false })
            .limit(3);
        if (error) throw error;
        if (!data || !data.length) return;   // nothing to show: panel stays hidden

        const href = p => 'post.html?slug=' + encodeURIComponent(p.slug);
        const img = p => esc(p.image_url || DEFAULT_IMAGE);
        const meta = p => `${esc(p.category)} · ${fmtDate(p.published_at)}`;

        const html = data.map((p, i) => i === 0
            ? `<a class="hn-card hn-latest" href="${href(p)}">
                   <span class="hn-img"><img src="${img(p)}" alt="" decoding="async"></span>
                   <div class="hn-text">
                       <span class="hn-badge">Latest</span>
                       <div class="hn-meta">${meta(p)}</div>
                       <h3 class="hn-title">${esc(p.title)}</h3>
                   </div>
               </a>`
            : `<a class="hn-card" href="${href(p)}">
                   <span class="hn-img"><img src="${img(p)}" alt="" loading="lazy" decoding="async"></span>
                   <div class="hn-text">
                       <div class="hn-meta">${meta(p)}</div>
                       <h3 class="hn-title">${esc(p.title)}</h3>
                   </div>
               </a>`
        ).join('');

        document.getElementById('home-news-grid').innerHTML = html;
        const panel = document.getElementById('home-news');
        panel.hidden = false;

        positionPanel();

        // Re-position whenever the layout changes (window resize, images or fonts loading, etc.)
        window.addEventListener('resize', positionPanel);
        window.addEventListener('load', positionPanel);
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(positionPanel);
            ro.observe(document.getElementById('hero-with-news'));
            ro.observe(panel);
        }
    } catch (e) {
        console.error('Could not load latest news:', e);   // fail quietly on the home page
    }
});