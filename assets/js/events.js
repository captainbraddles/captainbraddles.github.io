// Used if an event has no image. Change to any image you like.
const DEFAULT_IMAGE = 'images/Official Logo.png';

// PASTE YOUR EXISTING <svg class="cs-mask"> ... </svg> BETWEEN THE BACKTICKS
const MASK_SVG = `<svg class="cs-mask" viewBox="0 0 267 209"></svg>`;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initSeasons();
    } catch (error) {
        console.error('Error loading events:', error);
    } finally {
        hideLoader();
        showContent();
    }
});

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function showContent() {
    const content = document.getElementById('content');
    if (content) content.style.display = 'block';
}

async function initSeasons() {
    const { data: seasons, error } = await db
        .from('seasons').select('id, name').order('id', { ascending: false });
    if (error) throw error;
    if (!seasons.length) return;

    const select = document.getElementById('season-select');
    select.innerHTML = seasons
        .map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');

    const latestId = seasons[0].id;
    select.addEventListener('change', () =>
        showSeason(Number(select.value), latestId, seasons).catch(console.error));

    await showSeason(latestId, latestId, seasons);
}

async function showSeason(seasonId, latestId, seasons) {
    const { data, error } = await db
        .from('events')
        .select('id, category, name, selection_required, image_url, info_url')
        .eq('season_id', seasonId)
        .order('id');
    if (error) throw error;

    // One card per event: group the selection rows together
    const groups = new Map();
    data.forEach(r => {
        const key = r.category + '|' + r.name;
        if (!groups.has(key)) groups.set(key, { ...r, selections: [] });
        const g = groups.get(key);
        if (r.selection_required) g.selections.push(r.selection_required);
        g.image_url = g.image_url || r.image_url;
        g.info_url = g.info_url || r.info_url;
    });

    const season = seasons.find(s => s.id === seasonId);
    const title = document.getElementById('events-title');
    if (title && season) title.textContent = `SportsMaster ${season.name} Events List`;

    // Intro text that only applies to the newest season
    document.querySelectorAll('.latest-only').forEach(el => {
        el.hidden = seasonId !== latestId;
    });

    const container = document.getElementById('output');
    container.innerHTML = [...groups.values()].map(g => {
        const img = esc(g.image_url || DEFAULT_IMAGE);
        return `
        <li class="cs-item">
            <div class="cs-image-group">
                <picture class="cs-picture">
                    <source media="(max-width: 600px)" srcset="${img}" />
                    <source media="(min-width: 601px)" srcset="${img}" />
                    <img loading="lazy" decoding="async" src="${img}"
                        alt="${esc(g.name)}" width="413" height="240" aria-hidden="true" />
                </picture>
                ${MASK_SVG}
            </div>
            <div class="cs-info">
                <h3 class="cs-h3">${esc(g.name)}</h3>
                <span class="cs-ages">${esc(g.category)}</span>
                <p class="cs-item-text">${esc(g.selections.join(', '))}</p>
                ${g.info_url ? `<a href="${esc(g.info_url)}" class="cs-link">More info</a>` : ''}
            </div>
        </li>`;
    }).join('');
}