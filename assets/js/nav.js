// Edit this list to change the menu on every page.
// For a dropdown, give an item a "children" list, e.g.
// { label: 'Events', href: '/events.html', children: [
//     { label: '2026', href: '/events.html' },
//     { label: '2027', href: '/events_2027.html' } ] }
const NAV_LINKS = [
    { label: 'Home',         href: '/index.html' },
    { label: 'Leaderboard',  href: '/leaderboard.html' },
    { label: 'Events',       href: '/events.html' },
    { label: 'Participants', href: '/participants.html' },
    { label: 'Selections',   href: '/selections.html' },
    { label: 'Winners List', href: '/index.html' },
    { label: 'Rules',        href: '/rules.html' },
    { label: 'History',      href: '/history.html' },
    { label: 'Stats',        href: '/stats.html' }
];

(function () {
    // Work out which page we're on, so the right link gets highlighted
    let path = location.pathname;
    if (path.endsWith('/')) path += 'index.html';
    if (!/\.[a-z0-9]+$/i.test(path)) path += '.html';

    let activeUsed = false;
    const isActive = href => {
        if (activeUsed || href !== path) return false;
        activeUsed = true;   // highlight only the first match
        return true;
    };

    const items = NAV_LINKS.map(item => {
        if (item.children) {
            const kids = item.children.map(c =>
                `<li class="cs-drop-li">
                    <a href="${c.href}" class="cs-drop-link">${c.label}</a>
                </li>`).join('');
            const active = item.children.some(c => c.href === path) && !activeUsed;
            if (active) activeUsed = true;
            return `<li class="cs-li cs-dropdown">
                <a href="${item.href}" class="cs-li-link${active ? ' cs-active' : ''}">${item.label}</a>
                <ul class="cs-drop-ul">${kids}</ul>
            </li>`;
        }
        return `<li class="cs-li">
            <a href="${item.href}" class="cs-li-link${isActive(item.href) ? ' cs-active' : ''}">${item.label}</a>
        </li>`;
    }).join('');

    const html = `
<header id="cs-navigation">
    <div class="cs-container">
        <a href="/index.html" class="cs-logo" aria-label="back to home">
            <img src="/images/Official%20Logo.png" alt="logo" width="210" height="29" aria-hidden="true" decoding="async">
        </a>
        <nav class="cs-nav" role="navigation">
            <button class="cs-toggle" aria-label="mobile menu toggle">
                <div class="cs-box" aria-hidden="true">
                    <span class="cs-line cs-line1" aria-hidden="true"></span>
                    <span class="cs-line cs-line2" aria-hidden="true"></span>
                    <span class="cs-line cs-line3" aria-hidden="true"></span>
                </div>
            </button>
            <div class="cs-ul-wrapper">
                <ul id="cs-expanded" class="cs-ul" aria-expanded="false">${items}</ul>
            </div>
        </nav>
    </div>
</header>`;

    // Insert the menu exactly where this script tag sits
    document.currentScript.insertAdjacentHTML('beforebegin', html);
})();