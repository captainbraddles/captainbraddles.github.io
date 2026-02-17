document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2025`).then((r) => r.json()), // last season
  ])
    .then(([currentData, lastSeasonData]) => {
      const stats = currentData.totals.slice(1); // skip header row
      const last = lastSeasonData.totals.slice(1);

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
      ];

      // Populate top 3 and movement arrows
      statPairs.forEach(([field, prefix, moveId]) => {
        updateTop3Stats(stats, field, prefix);
        updateMovement(stats, last, field, moveId);
      });

      // Attach click listeners for modal
      document.querySelectorAll(".cs-item .cs-link").forEach((link, index) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const statField = statPairs[index][0]; // get stat name
          openLeaderboardModal(statField, stats, last);
        });
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));
});

// ========================
// Update Top 3 Display
// ========================
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

    // Format decimals
    if (statField === "Average points per season" || statField === "Points") {
      value = value.toFixed(1);
    } else {
      value = Number.isInteger(value) ? value : value.toFixed(1);
    }

    el.textContent = `${player.SportsMaster} — ${value}`;
  });
}

// ========================
// Movement Arrows
// ========================
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

// ========================
// Modal & Full Leaderboard
// ========================
const modal = document.getElementById("leaderboardModal");
const modalTitle = document.getElementById("modalTitle");
const modalTableBody = document.querySelector("#leaderboardTable tbody");
const searchInput = document.getElementById("searchInput");
const modalClose = document.querySelector(".modal .close");

function openLeaderboardModal(statField, currentData, lastData) {
  modalTitle.textContent = statField;
  populateLeaderboardTable(statField, currentData, lastData);
  modal.style.display = "block";
  searchInput.value = "";
  searchInput.focus();
}

// Close modal
modalClose.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// ========================
// Populate the table with cascading animation
// ========================
function populateLeaderboardTable(statField, currentData, lastData) {
  modalTableBody.innerHTML = "";
  const sorted = [...currentData].sort(
    (a, b) => Number(b[statField] || 0) - Number(a[statField] || 0)
  );

  sorted.forEach((player, index) => {
    let value = Number(player[statField] || 0);
    if (statField === "Average points per season" || statField === "Points") {
      value = value.toFixed(1);
    } else {
      value = Number.isInteger(value) ? value : value.toFixed(1);
    }

    let movement = "➡️";
    const lastIndex = lastData.findIndex(
      (p) => p.SportsMaster === player.SportsMaster
    );
    if (lastIndex >= 0) {
      if (Number(player[statField] || 0) > Number(lastData[lastIndex][statField] || 0))
        movement = "🔼";
      else if (
        Number(player[statField] || 0) < Number(lastData[lastIndex][statField] || 0)
      )
        movement = "🔽";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.SportsMaster}</td>
      <td>${value}</td>
      <td>${movement}</td>
    `;
    row.style.transitionDelay = `${index * 50}ms`; // cascading effect
    modalTableBody.appendChild(row);
  });

  // Trigger cascade animation
  setTimeout(() => {
    document.getElementById("leaderboardTable").classList.add("show-rows");
  }, 50);
}

// ========================
// Search / Filter
// ========================
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  Array.from(modalTableBody.rows).forEach((row) => {
    const player = row.cells[1].textContent.toLowerCase();
    row.style.display = player.includes(filter) ? "" : "none";
  });
});

// ========================
// Sorting
// ========================
document.querySelectorAll("#leaderboardTable th[data-column]").forEach((th) => {
  th.addEventListener("click", () => {
    const column = th.dataset.column;
    const order = th.dataset.order === "asc" ? "desc" : "asc";
    th.dataset.order = order;

    const rows = Array.from(modalTableBody.rows);
    rows.sort((a, b) => {
      let aVal, bVal;
      if (column === "rank") {
        aVal = parseInt(a.cells[0].textContent);
        bVal = parseInt(b.cells[0].textContent);
      } else if (column === "player") {
        aVal = a.cells[1].textContent.toLowerCase();
        bVal = b.cells[1].textContent.toLowerCase();
      } else if (column === "value") {
        aVal = parseFloat(a.cells[2].textContent);
        bVal = parseFloat(b.cells[2].textContent);
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
    rows.forEach((row) => modalTableBody.appendChild(row));
  });
});
