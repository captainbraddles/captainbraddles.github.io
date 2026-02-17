document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2024`).then((r) => r.json()), // last season
  ])
    .then(([currentData, lastSeasonData]) => {
      const stats = currentData.totals.slice(1); // skip header row
      const last = lastSeasonData.totals.slice(1);

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

      // Update cards
      statPairs.forEach(([field, prefix, moveId]) => {
        updateTop3Stats(stats, field, prefix);
        updateMovement(stats, last, field, moveId);
      });

      // Setup modal click events for cards
      document.querySelectorAll(".cs-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const statField = link.dataset.stat;
          openLeaderboardModal(stats, last, statField);
        });
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));
});

// Update top 3 for cards
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

    if (statField === "Points" || statField === "Average points per season") {
      value = value.toFixed(1);
    } else {
      value = Math.round(value);
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
    const lastIndex = sortedLast.findIndex((p) => p.SportsMaster === topCurrent);
    if (lastIndex >= 0) {
      el.textContent = "🔼";
      el.classList.add("up");
    } else {
      el.textContent = "🔽";
      el.classList.add("down");
    }
  }
}

// Open modal and populate full leaderboard
function openLeaderboardModal(currentData, lastData, statField) {
  const modal = document.getElementById("leaderboardModal");
  const modalContent = modal.querySelector(".modal-content");
  const modalTitle = document.getElementById("modalTitle");
  const tbody = document.querySelector("#leaderboardTable tbody");
  const searchInput = document.getElementById("searchInput");

  modalTitle.textContent = statField + " Leaderboard";
  tbody.innerHTML = "";

  const sorted = [...currentData].sort(
    (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
  );

  sorted.forEach((player, idx) => {
    const row = document.createElement("tr");

    if (idx === 0) row.classList.add("gold");
    else if (idx === 1) row.classList.add("silver");
    else if (idx === 2) row.classList.add("bronze");

    let value = Number(player[statField] || 0);
    if (statField === "Points" || statField === "Average points per season") {
      value = value.toFixed(1);
    } else {
      value = Math.round(value);
    }

    const lastIndex = lastData.findIndex((p) => p.SportsMaster === player.SportsMaster);
    let movement = "➡️";
    if (lastIndex >= 0) {
      const lastVal = Number(lastData[lastIndex][statField] || 0);
      if (Number(player[statField]) > lastVal) movement = "🔼";
      else if (Number(player[statField]) < lastVal) movement = "🔽";
    }

    row.innerHTML = `<td>${idx + 1}</td><td>${player.SportsMaster}</td><td>${value}</td><td>${movement}</td>`;
    tbody.appendChild(row);

    setTimeout(() => row.classList.add("show"), idx * 50);
  });

  // Show modal with smooth animation
  modal.style.display = "block";
  modalContent.classList.remove("hide");
  modalContent.classList.add("show");

  searchInput.value = "";
  searchInput.onkeyup = function () {
    const filter = searchInput.value.toLowerCase();
    Array.from(tbody.rows).forEach((tr) => {
      const playerName = tr.cells[1].textContent.toLowerCase();
      tr.style.display = playerName.includes(filter) ? "" : "none";
    });
  };

  // Close modal
  const closeBtn = modal.querySelector(".close");
  closeBtn.onclick = closeModal;
  window.onclick = function (event) {
    if (event.target == modal) closeModal();
  };

  function closeModal() {
    modalContent.classList.remove("show");
    modalContent.classList.add("hide");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300); // match animation duration
  }
}
