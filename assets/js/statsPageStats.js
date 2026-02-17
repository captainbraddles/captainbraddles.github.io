document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2025`).then((r) => r.json()), // last season
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

// Update the top 3 players for a given stat, including movement arrows
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
    // Format floats: 1 decimal for averages/points, integers for counts
    value = Number.isInteger(value) ? value : value.toFixed(1);

    // Determine movement arrow
    let arrow = "➡️"; // default: unchanged
    const lastIndex = sortedLast.findIndex(
      (p) => p.SportsMaster === player.SportsMaster
    );

    if (lastIndex === -1) {
      arrow = "🆕"; // new player
    } else if (lastIndex > index) {
      arrow = "🔼"; // moved up
    } else if (lastIndex < index) {
      arrow = "🔽"; // moved down
    }

    el.textContent = `${player.SportsMaster} — ${value} ${arrow}`;
  });
}
