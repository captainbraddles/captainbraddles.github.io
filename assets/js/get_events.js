document.addEventListener("DOMContentLoaded", () => {

    // Start loading your events
    getEvents()
        .then(() => {
            hideLoader();
            showContent();
        })
        .catch(error => console.error("Error loading events:", error));

});

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}

function showContent() {
    const content = document.getElementById("content");
    if (content) content.style.display = "block";
}

async function getEvents() {
    const payloadUrl = "https://script.google.com/macros/s/AKfycbzE09QC8KSBQv0fVQ2pV5lND_iMvEbdQ7GnSgltmvGsICU0bB9tvFt2ASJtOvxtCg_JgA/exec";

    const response = await fetch(payloadUrl);
    const data = await response.json();

    let payload;

    // If Google Apps Script returns a JSON string, parse it
    try {
        payload = typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
        console.error("JSON parse error:", e);
        return;
    }

    const container = document.getElementById("output");
    if (!container) return;

    container.innerHTML = ""; // clear list first

    payload.forEach(item => {

        const html = `
        <li class="cs-item">
            <div class="cs-image-group">
                <picture class="cs-picture">
                    <source media="(max-width: 600px)" srcset="${item.Image}" />
                    <source media="(min-width: 601px)" srcset="${item.Image}" />
                    <img loading="lazy" decoding="async"
                        src="${item.Image}" alt="${item.Event}"
                        width="413" height="240" aria-hidden="true" />
                </picture>

                <!-- SVG Mask -->
                <svg class="cs-mask" viewBox="0 0 267 209">
                    <!-- (SVG contents unchanged) -->
                </svg>
            </div>

            <div class="cs-info">
                <h3 class="cs-h3">${item.Event}</h3>
                <span class="cs-ages">${item.Category}</span>
                <p class="cs-item-text">${item["Selection required"]}</p>

                <a href="${item.Information}" class="cs-link">
                    More info
               </a>
            </div>
        </li>
        `;

        container.innerHTML += html;
    });
}
