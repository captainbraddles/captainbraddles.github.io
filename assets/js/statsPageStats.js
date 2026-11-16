document.addEventListener("DOMContentLoaded", async function () {
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
  let stats = [], lastStats = [];

  const modal = document.getElementById("leaderboardModal");
  const modalContent = modal.querySelector(".modal-content");
  const modalTitle = document.getElementById("modalTitle");
  const tableBody = document.querySelector("#leaderboardTable tbody");
  const searchInput = document.getElementById("searchInput");
  const closeBtn = modal.querySelector(".close");

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmt = (field, v) => {
    v = Number(v || 0);
    if (field === "Average points per season" || field === "Points") return v.toFixed(1);
    return Number.isInteger(v) ? v : v.toFixed(1);
  };

  // Add up the per-season rows into one row per player
  function buildTotals(rows) {
    const players = new Map();
    rows.forEach(r => {
      let p = players.get(r.participant_id);
      if (!p) {
        p = { SportsMaster: r.name, "Points": 0, "Correct Selections": 0,
              "Jokers Won": 0, "Points from Jokers": 0,
              "40 Pointers": 0, "80 Pointers": 0, "Seasons Entered": 0 };
        players.set(r.participant_id, p);
      }
      p["Points"] += Number(r.points);
      p["Correct Selections"] += Number(r.correct_selections);
      p["Jokers Won"] += Number(r.jokers_won);
      p["Points from Jokers"] += Number(r.points_from_jokers);
      p["40 Pointers"] += Number(r.forty_pointers);
      p["80 Pointers"] += Number(r.eighty_pointers);
      p["Seasons Entered"] += 1;
    });
    return [...players.values()].map(p => ({
      ...p,
      "Average points per season": p["Seasons Entered"] ? p["Points"] / p["Seasons Entered"] : 0
    }));
  }

  async function loadStats() {
    const { data: seasons, error: sErr } = await db
      .from("seasons").select("id, name").eq("completed", true).order("id");
    if (sErr) throw sErr;
    if (!seasons.length) return;

    const { data: rows, error: rErr } = await db
      .from("player_season_stats").select("*")
      .in("season_id", seasons.map(s => s.id));
    if (rErr) throw rErr;

    const latest = seasons[seasons.length - 1];
    stats = buildTotals(rows);
    lastStats = buildTotals(rows.filter(r => r.season_id !== latest.id));

    const note = document.querySelector(".history-text");
    if (note) note.textContent =
      `*Note: All stats are accurate as of the end of the ${latest.name} season. ` +
      `Any new records set in the current season will be added to this page at the end of the season.`;

    statPairs.forEach(([field, prefix, moveId]) => {
      updateTop3Stats(stats, field, prefix);
      updateMovement(stats, lastStats, field, moveId);
    });

    document.querySelectorAll(".cs-item a.cs-link").forEach(link => {
      const field = link.dataset.stat;
      if (!field) return;
      link.addEventListener("click", e => {
        e.preventDefault();
        openLeaderboardModal(field);
      });
    });
  }

  function updateTop3Stats(data, statField, prefix) {
    if (!data || !data.length) return;
    const sorted = [...data].sort((a, b) => Number(b[statField] || 0) - Number(a[statField] || 0));
    sorted.slice(0, 3).forEach((player, index) => {
      const el = document.getElementById(`${prefix}${index + 1}`);
      if (!el) return;
      el.innerHTML = `<span>${esc(player.SportsMaster)}</span> — <span>${fmt(statField, player[statField])}</span>`;
    });
  }

  function updateMovement(currentData, lastData, statField, moveId) {
    const el = document.getElementById(moveId);
    if (!el || !currentData || !lastData || !lastData.length) return;
    const sortedCurrent = [...currentData].sort((a, b) => Number(b[statField] || 0) - Number(a[statField] || 0));
    const sortedLast = [...lastData].sort((a, b) => Number(b[statField] || 0) - Number(a[statField] || 0));
    const topCurrent = sortedCurrent[0]?.SportsMaster;
    const topLast = sortedLast[0]?.SportsMaster;
    el.classList.remove("up", "down", "same");
    if (topCurrent === topLast) { el.textContent = "➡️"; el.classList.add("same"); }
    else if (sortedLast.findIndex(p => p.SportsMaster === topCurrent) >= 0) {
      el.textContent = "🔼"; el.classList.add("up");
    } else { el.textContent = "🔽"; el.classList.add("down"); }
  }

  function openLeaderboardModal(statField) {
    modalTitle.textContent = statField;
    tableBody.innerHTML = "";
    const sorted = [...stats].sort((a, b) => Number(b[statField] || 0) - Number(a[statField] || 0));
    sorted.forEach((player, index) => {
      const raw = Number(player[statField] || 0);
      const tr = document.createElement("tr");
      if (index === 0) tr.classList.add("gold");
      else if (index === 1) tr.classList.add("silver");
      else if (index === 2) tr.classList.add("bronze");

      let moveArrow = "➡️";
      const last = lastStats.find(p => p.SportsMaster === player.SportsMaster);
      if (last) {
        const lastValue = Number(last[statField] || 0);
        if (raw > lastValue) moveArrow = "🔼";
        else if (raw < lastValue) moveArrow = "🔽";
      }
      tr.innerHTML = `<td>${index + 1}</td><td>${esc(player.SportsMaster)}</td><td>${fmt(statField, raw)}</td><td>${moveArrow}</td>`;
      tableBody.appendChild(tr);
      setTimeout(() => { tr.classList.add("show"); }, index * 50);
    });
    modal.style.display = "block";
    setTimeout(() => modalContent.classList.add("show"), 10);
    searchInput.value = "";
  }

  closeBtn.onclick = () => closeModal();
  window.onclick = e => { if (e.target === modal) closeModal(); };
  function closeModal() {
    modalContent.classList.remove("show");
    modalContent.classList.add("hide");
    setTimeout(() => { modal.style.display = "none"; modalContent.classList.remove("hide"); }, 300);
  }
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    tableBody.querySelectorAll("tr").forEach(row => {
      row.style.display = row.children[1].textContent.toLowerCase().includes(filter) ? "" : "none";
    });
  });

  try { await loadStats(); }
  catch (err) { console.error("Error fetching stats:", err); }
});