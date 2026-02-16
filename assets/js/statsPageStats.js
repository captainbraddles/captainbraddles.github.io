document.addEventListener("DOMContentLoaded", function() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then(r => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2025`).then(r => r.json()) // last season
  ])
  .then(([currentData, lastSeasonData]) => {
    const stats = currentData.totals;
    const last = lastSeasonData.totals;

    console.log("Current stats:", stats);
    console.log("Last season stats:", last);

    const statPairs = [
      ["Points", "topPoints", "moveTopPoints"],
      ["Correct Selections", "topCorrect", "moveTopCorrect"],
      ["Jokers Won", "topJokers", "moveTopJokers"],
      ["Points from Jokers", "topJokersPoints", "moveTopJokersPoints"],
      ["Average points per season", "topAvg", "moveTopAvg"],
      ["40 Pointers", "top40", "moveTop40"],
      ["80 Pointers", "top80", "moveTop80"],
      ["Seasons Entered", "topSeasons", "moveTopSeasons"],
      ["Miscellaneous", "topMisc", "moveTopMisc"]
    ];

    statPairs.forEach(([field, prefix, moveId]) => {
      updateTop3Stats(stats, field, prefix);
      updateMovement(stats, last, field, moveId);
    });
  })
  .catch(err => console.error("Error fetching stats:", err));
});

// Update the top 3 players for a given stat
function updateTop3Stats(data, statField, prefix) {
  if (!data || !data.length) return;

  const sorted = [...data].sort((a,b) => Number(b[statField] || 0) - Number(a[statField] || 0));
  const top3 = sorted.slice(0,3);

  top3.forEach((player, index) => {
    const el = document.getElementById(`${prefix}${index+1}`);
    if (!el) return;
    el.textContent = `${player.SportsMaster} — ${player[statField] || 0}`;
  });
}

// Update the arrow to show movement compared to last season
function updateMovement(currentData, lastData, statField, moveId) {
  const el = document.getElementById(moveId);
  if (!el || !currentData || !lastData) return;

  const sortedCurrent = [...currentData].sort((a,b) => Number(b[statField] || 0) - Number(a[statField] || 0));
  const sortedLast = [...lastData].sort((a,b) => Number(b[statField] || 0) - Number(a[statField] || 0));

  const topCurrent = sortedCurrent[0]?.SportsMaster;
  const topLast = sortedLast[0]?.SportsMaster;

  el.classList.remove("up","down","same");

  if(topCurrent === topLast){
    el.textContent = "➡️";
    el.classList.add("same");
  } else {
    const lastIndex = sortedLast.findIndex(p => p.SportsMaster === topCurrent);
    if(lastIndex >= 0){
      el.textContent = "🔼";
      el.classList.add("up");
    } else {
      el.textContent = "🔽";
      el.classList.add("down");
    }
  }
}
