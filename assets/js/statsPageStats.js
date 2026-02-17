document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  const statPairs = [
    ["Points", "topPoints", "moveTopPoints"],
    ["Correct Selections", "topCorrect", "moveTopCorrect"],
    ["Jokers Won", "topJokers", "moveTopJokers"],
    ["Points from Jokers", "topJokersPoints", "moveTopJokersPoints"],
    ["Average points per season", "topAvg", "moveTopAvg"],
    ["40 Pointers", "top40", "moveTop40"],
    ["80 Pointers", "top80", "moveTop80"],
    ["Seasons Entered", "topSeasons", "moveTopSeasons"]
  ];

  let stats = [];
  let lastStats = [];

  // Modal elements
  const modal = document.getElementById("leaderboardModal");
  const modalContent = modal.querySelector(".modal-content");
  const modalTitle = document.getElementById("modalTitle");
  const tableBody = document.querySelector("#leaderboardTable tbody");
  const searchInput = document.getElementById("searchInput");
  const closeBtn = modal.querySelector(".close");

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then(r => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2024`).then(r => r.json())
  ])
    .then(([currentData, lastSeasonData]) => {
      stats = currentData.totals.slice(1);
      lastStats = lastSeasonData.totals.slice(1);

      // Populate top 3 cards
      statPairs.forEach(([field, prefix, moveId]) => {
        updateTop3Stats(stats, field, prefix);
        updateMovement(stats, lastStats, field, moveId);
      });

      // Attach click handlers to cards
      document.querySelectorAll(".cs-item a.cs-link").forEach(link => {
        const field = link.dataset.stat;
        if (!field) return;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          openLeaderboardModal(field);
        });
      });
    })
    .catch(err => console.error("Error fetching stats:", err));

  // Update the top 3 players for a given stat
  function updateTop3Stats(data, statField, prefix) {
    if (!data || !data.length) return;

    const sorted = [...data].sort((a,b) => Number(b[statField] || 0) - Number(a[statField] || 0));
    const top3 = sorted.slice(0,3);

    top3.forEach((player, index) => {
      const el = document.getElementById(`${prefix}${index+1}`);
      if (!el) return;
      let value = Number(player[statField] || 0);
      if (statField === "Average points per season" || statField === "Points") value = value.toFixed(1);
      else value = Number.isInteger(value) ? value : value.toFixed(1);

      el.innerHTML = `<span>${player.SportsMaster}</span> — <span>${value}</span>`;
    });
  }

  // Update movement arrows for top cards
  function updateMovement(currentData, lastData, statField, moveId) {
    const el = document.getElementById(moveId);
    if (!el || !currentData || !lastData) return;

    const sortedCurrent = [...currentData].sort((a,b) => Number(b[statField]||0) - Number(a[statField]||0));
    const sortedLast = [...lastData].sort((a,b) => Number(b[statField]||0) - Number(a[statField]||0));

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

  // Open leaderboard modal
  function openLeaderboardModal(statField) {
    modalTitle.textContent = statField;
    tableBody.innerHTML = "";

    const sortedCurrent = [...stats].sort((a,b) => Number(b[statField]||0) - Number(a[statField]||0));

    sortedCurrent.forEach((player, index) => {
      let value = Number(player[statField] || 0);
      if (statField === "Average points per season" || statField === "Points") value = value.toFixed(1);
      else value = Number.isInteger(value) ? value : value.toFixed(1);

      const tr = document.createElement("tr");
      if(index===0) tr.classList.add("gold");
      else if(index===1) tr.classList.add("silver");
      else if(index===2) tr.classList.add("bronze");

      // Movement arrow
      let moveArrow = "➡️";
      const lastIndex = lastStats.findIndex(p => p.SportsMaster === player.SportsMaster);
      if(lastIndex>=0){
        const lastValue = Number(lastStats[lastIndex][statField]||0);
        if(value > lastValue) moveArrow="🔼";
        else if(value < lastValue) moveArrow="🔽";
      }

      tr.innerHTML = `<td>${index+1}</td>
                      <td>${player.SportsMaster}</td>
                      <td>${value}</td>
                      <td>${moveArrow}</td>`;
      tableBody.appendChild(tr);

      // Cascade animation
      setTimeout(()=>{tr.classList.add("show");}, index*50);
    });

    modal.style.display = "block";
    setTimeout(()=>modalContent.classList.add("show"), 10);
    searchInput.value = "";
  }

  // Close modal
  closeBtn.onclick = () => closeModal();
  window.onclick = (e) => { if(e.target === modal) closeModal(); }
  function closeModal(){
    modalContent.classList.remove("show");
    modalContent.classList.add("hide");
    setTimeout(()=>{ modal.style.display="none"; modalContent.classList.remove("hide"); }, 300);
  }

  // Filter leaderboard
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    tableBody.querySelectorAll("tr").forEach(row => {
      const name = row.children[1].textContent.toLowerCase();
      row.style.display = name.includes(filter) ? "" : "none";
    });
  });
});
