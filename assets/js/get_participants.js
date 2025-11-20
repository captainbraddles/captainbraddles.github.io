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
    const payloadUrl = "https://script.google.com/macros/s/AKfycbzbIgYlehQZxihs3c3N99doKmdfeTK-7_cYuN-TeuKWaiAAno6XgLKVVSv7YCQrAWwr/exec";

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

    const container = document.getElementById("participants");
    if (!container) return;

    container.innerHTML = ""; // clear list first

    payload.forEach(item => {

        const html = `
            <li class="cs-item">
                <div class="cs-flex">
                    <picture class="cs-picture">
                        <img class="participant-image" src="${item.image} " alt="${item.name}"/>
                    </picture>
                    <div class="cs-tag">
                    <img
                        class="cs-icon"
                        aria-hidden="true"
                        src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Icons/fire.svg"
                        decoding="async"
                        alt="fire"
                        width="15"
                        height="15"
                        loading="true"
                    />
                    Hot Deal
                    </div>
                </div>
                <div class="cs-info">
                    <h3 class="cs-h3">${item.name}</h3>
                    <span class="cs-ages">${item.description}</span>
                </div>
            </li>

        `;

        container.innerHTML += html;
    });
}
