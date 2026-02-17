document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  const modal = document.getElementById("leaderboardModal");
  const modalTitle = document.getElementById("modalTitle");
  const leaderboardTableBody = document.querySelector("#leaderboardTable tbody");
  const searchInput = document.getElementById("searchInput");
  const closeModal = document.querySelector("#leaderboardModal .close");

  let currentStats = [];
  let lastSeasonStats = [];

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2024`).then((r) => r.json()), // last season
  ])
    .then(([currentData, lastSeasonData]) => {
      currentStats = currentData.totals.slice(1);
      lastSeasonStats = lastSeasonData.totals.slice(1);

      const statPairs = [
        ["Points", "topPoints", "moveTopPoints"],
        ["Correct Selections", "topCorrect", "moveTopCorrect"],
        ["Jokers Won", "topJokers", "moveTopJokers"],
        ["Points from Jokers", "topJokersPoints", "moveTopJokersPoints"],
        ["Average points per season", "topAvg", "moveTopAvg"],
        ["40 Pointers", "top40", "moveTop40"],
        ["80 Pointers", "top80", "moveTop80"],
        ["Seasons Entered", "topSeasons", "moveTopSeasons"],
      ];

      // Update top 3 and arrows
      statPairs.forEach(([field, prefix, moveId]) => {
        updateTop3Stats(currentStats, field, prefix);
        updateMovement(currentStats, lastSeasonStats, field, moveId);
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));

  // Update top 3 players
  function updateTop3Stats(data, statField, prefix) {
    if (!data || !data.length) return;
    const sorted = [...data].sort(
      (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
    );
    const top3 = sorted.slice(0, 3);
    top3.forEach((player, index) => {
      const el = document.getElementById(`${prefix}${index + 1}`);
      if (!el) return;
      let value = Number(player[statField] || 0);
      if (statField === "Average points per season" || statField === "Points") {
        value = value.toFixed(1);
      } else {
        value = Number.isInteger(value) ? value : value.toFixed(1);
      }
      el.textContent = `${player.SportsMaster} — ${value}`;
    });
  }

  // Update movement arrows
  function updateMovement(currentData, lastData, statField, moveId) {
    const el = document.getElementById(moveId);
    if (!el || !currentData || !lastData) return;

    const sortedCurrent = [...currentData].sort(
      (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
    );
    const sortedLast = [...lastData].sort(
      (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
    );

    const topCurrent = sortedCurrent[0]?.SportsMaster;
    const topLast = sortedLast[0]?.SportsMaster;

    el.classList.remove("up", "down", "same");

    if (topCurrent === topLast) {
      el.textContent = "➡️";
      el.classList.add("same");
    } else {
      const lastIndex = sortedLast.findIndex(
        (p) => p.SportsMaster === topCurrent
      );
      if (lastIndex >= 0) {
        el.textContent = "🔼";
        el.classList.add("up");
      } else {
        el.textContent = "🔽";
        el.classList.add("down");
      }
    }
  }

  // Open leaderboard modal
  document.querySelectorAll(".cs-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const stat = this.dataset.stat;
      openLeaderboardModal(stat);
    });
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    leaderboardTableBody.innerHTML = "";
    searchInput.value = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target == modal) {
      modal.style.display = "none";
      leaderboardTableBody.innerHTML = "";
      searchInput.value = "";
    }
  });

  // Open and populate leaderboard modal
  function openLeaderboardModal(statField) {
    modalTitle.textContent = statField + " Leaderboard";
    leaderboardTableBody.innerHTML = "";

    const sorted = [...currentStats].sort(
      (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
    );

    sorted.forEach((player, index) => {
      let value = Number(player[statField] || 0);
      if (statField === "Average points per season" || statField === "Points") {
        value = value.toFixed(1);
      } else {
        value = Number.isInteger(value) ? value : value.toFixed(1);
      }

      const lastIndex = lastSeasonStats.findIndex(
        (p) => p.SportsMaster === player.SportsMaster
      );
      let change = "➡️";
      if (lastIndex >= 0) {
        const lastValue = Number(lastSeasonStats[lastIndex][statField] || 0);
        if (value > lastValue) change = "🔼";
        else if (value < lastValue) change = "🔽";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.SportsMaster}</td>
        <td>${value}</td>
        <td>${change}</td>
      `;

      // Highlight top 3
      if (index === 0) row.classList.add("gold");
      if (index === 1) row.classList.add("silver");
      if (index === 2) row.classList.add("bronze");

      leaderboardTableBody.appendChild(row);

      // Animate cascade
      setTimeout(() => row.classList.add("show"), index * 50);
    });

    modal.style.display = "block";
  }

  // Search/filter functionality
  searchInput.addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    document.querySelectorAll("#leaderboardTable tbody tr").forEach((row) => {
      const playerName = row.cells[1].textContent.toLowerCase();
      row.style.display = playerName.includes(filter) ? "" : "none";
    });
  });
});
