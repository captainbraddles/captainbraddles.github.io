document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2025`).then((r) => r.json()),
  ])
    .then(([currentData, lastSeasonData]) => {
      const stats = (currentData.totals || []).slice(1);
      const last = (lastSeasonData.totals || []).slice(1);

      console.log("Current stats:", stats);
      console.log("Last season stats:", last);

      const statPairs = [
        ["Points", "topPoints"],
        ["Correct Selections", "topCorrect"],
        ["Jokers Won", "topJokers"],
        ["Points from Jokers", "topJokersPoints"],
        ["Average points per season", "topAvg"],
        ["40 Pointers", "top40"],
        ["80 Pointers", "top80"],
        ["Seasons Entered", "topSeasons"],
      ];

      statPairs.forEach(([field, prefix]) => {
        updateTop3Stats(stats, last, field, prefix);
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));
});

// Update top 3 players with animated arrows, counting numbers, cascading
function updateTop3Stats(currentData, lastData, statField, prefix) {
  if (!currentData || !currentData.length) return;

  const sortedCurrent = [...currentData].sort(
    (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
  );
  const sortedLast = [...(lastData || [])].sort(
    (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
  );

  const top3 = sortedCurrent.slice(0, 3);

  top3.forEach((player, index) => {
    const el = document.getElementById(`${prefix}${index + 1}`);
    if (!el) return;

    let value = Number(player[statField] || 0);
    const displayValue = Number.isInteger(value) ? value : value.toFixed(1);

    // Determine movement arrow and color
    let arrow = "➡️";
    let colorClass = "same";
    const lastIndex = sortedLast.findIndex(
      (p) => p.SportsMaster === player.SportsMaster
    );

    if (lastIndex === -1) {
      arrow = "🆕";
      colorClass = "new";
    } else if (lastIndex > index) {
      arrow = "🔼";
      colorClass = "up";
    } else if (lastIndex < index) {
      arrow = "🔽";
      colorClass = "down";
    }

    // Set initial HTML with spans for number and arrow
    el.innerHTML = `${player.SportsMaster} — <span class="value">0</span> <span class="arrow ${colorClass} slide-pop">${arrow}</span>`;

    // Cascade delay based on index
    const delay = index * 200; // 0ms, 200ms, 400ms

    // Animate arrow with delay
    const arrowEl = el.querySelector(".arrow");
    setTimeout(() => {
      arrowEl.classList.add("slide-pop");
      setTimeout(() => arrowEl.classList.remove("slide-pop"), 500);
    }, delay);

    // Animate number with delay
    const valueEl = el.querySelector(".value");
    setTimeout(() => {
      animateNumber(valueEl, 0, Number(displayValue), 800);
    }, delay);
  });
}

// Animate number count up
function animateNumber(el, start, end, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = start + (end - start) * progress;
    el.textContent = Number.isInteger(end)
      ? Math.floor(currentValue)
      : currentValue.toFixed(1);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
