document.addEventListener("DOMContentLoaded", function () {
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycby_H5B17lexqX1VVDKLM11CLeKhGn-RqlJIpyQ5KCNTv0HSWFm6xZ1ertKxp7IY4dv1/exec";

  let currentData = [];
  let lastData = [];

  // Fetch current totals and last season
  Promise.all([
    fetch(WEB_APP_URL).then((r) => r.json()),
    fetch(`${WEB_APP_URL}?sheet=2025`).then((r) => r.json()),
  ])
    .then(([currentRes, lastRes]) => {
      currentData = (currentRes.totals || []).slice(1);
      lastData = (lastRes.totals || []).slice(1);

      // Update top 3 cards
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
        updateTop3Stats(currentData, lastData, field, prefix);
      });
    })
    .catch((err) => console.error("Error fetching stats:", err));

  // Modal logic
  const modal = document.getElementById("leaderboardModal");
  const closeBtn = modal.querySelector(".close");
  const modalTitle = document.getElementById("modalTitle");
  const tbody = document.querySelector("#leaderboardTable tbody");
  const searchInput = document.getElementById("searchInput");

  // Open modal on card click
  document.querySelectorAll(".stat-card").forEach((card) => {
    card.addEventListener("click", () => {
      const statField = card.dataset.stat;
      modalTitle.textContent = `${statField} Leaderboard`;

      showFullLeaderboard(currentData, lastData, statField, tbody);
      modal.style.display = "block";
    });
  });

  // Close modal
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  // Search/filter leaderboard
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    tbody.querySelectorAll("tr").forEach(row => {
      const player = row.children[1].textContent.toLowerCase();
      row.style.display = player.includes(filter) ? "" : "none";
    });
  });

  // Sort columns
  document.querySelectorAll("#leaderboardTable th[data-column]").forEach(th => {
    th.addEventListener("click", () => {
      const column = th.dataset.column;
      const order = th.dataset.order;
      sortTable(tbody, column, order);
      th.dataset.order = order === "asc" ? "desc" : "asc";
    });
  });
});

// Top 3 cards
function updateTop3Stats(currentData, lastData, statField, prefix) {
  const sortedCurrent = [...currentData].sort(
    (a,b) => Number(b[statField]||0) - Number(a[statField]||0)
  );
  const sortedLast = [...lastData].sort(
    (a,b) => Number(b[statField]||0) - Number(a[statField]||0)
  );
  const top3 = sortedCurrent.slice(0,3);

  top3.forEach((player,index) => {
    const el = document.getElementById(`${prefix}${index+1}`);
    if(!el) return;

    let value = Number(player[statField]||0);
    const displayValue = Number.isInteger(value)? value : value.toFixed(1);

    let arrow = "➡️"; let colorClass = "same";
    const lastIndex = sortedLast.findIndex(p=>p.SportsMaster===player.SportsMaster);
    if(lastIndex===-1){ arrow="🆕"; colorClass="new"; }
    else if(lastIndex>index){ arrow="🔼"; colorClass="up"; }
    else if(lastIndex<index){ arrow="🔽"; colorClass="down"; }

    el.innerHTML = `${player.SportsMaster} — <span class="value">0</span> <span class="arrow ${colorClass} slide-pop">${arrow}</span>`;

    const arrowEl = el.querySelector(".arrow");
    const valueEl = el.querySelector(".value");
    const delay = index*200;

    setTimeout(()=>{ arrowEl.classList.add("slide-pop"); setTimeout(()=>arrowEl.classList.remove("slide-pop"),500); }, delay);
    setTimeout(()=>{ animateNumber(valueEl,0,Number(displayValue),800); }, delay);
  });
}

// Full leaderboard modal
function showFullLeaderboard(currentData,lastData,statField,tbody){
  tbody.innerHTML=""; // clear table
  const sortedCurrent=[...currentData].sort((a,b)=>Number(b[statField]||0)-Number(a[statField]||0));
  const sortedLast=[...lastData].sort((a,b)=>Number(b[statField]||0)-Number(a[statField]||0));

  sortedCurrent.forEach((player,index)=>{
    const row=document.createElement("tr");
    const value=Number(player[statField]||0);
    const displayValue=Number.isInteger(value)? value : value.toFixed(1);

    let arrow="➡️"; let colorClass="same";
    const lastIndex=sortedLast.findIndex(p=>p.SportsMaster===player.SportsMaster);
    if(lastIndex===-1){ arrow="🆕"; colorClass="new"; }
    else if(lastIndex>index){ arrow="🔼"; colorClass="up"; }
    else if(lastIndex<index){ arrow="🔽"; colorClass="down"; }

    row.innerHTML=`
      <td>${index+1}</td>
      <td>${player.SportsMaster}</td>
      <td><span class="value">0</span></td>
      <td><span class="arrow ${colorClass} slide-pop">${arrow}</span></td>
    `;
    tbody.appendChild(row);

    const arrowEl=row.querySelector(".arrow");
    const valueEl=row.querySelector(".value");
    const delay=index*100;

    setTimeout(()=>{ arrowEl.classList.add("slide-pop"); setTimeout(()=>arrowEl.classList.remove("slide-pop"),500); }, delay);
    setTimeout(()=>{ animateNumber(valueEl,0,Number(displayValue),800); }, delay);
  });
}

// Animate number count up
function animateNumber(el,start,end,duration){
  const startTime=performance.now();
  function update(currentTime){
    const elapsed=currentTime-startTime;
    const progress=Math.min(elapsed/duration,1);
    const currentValue=start+(end-start)*progress;
    el.textContent=Number.isInteger(end)? Math.floor(currentValue) : currentValue.toFixed(1);
    if(progress<1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Sort table
function sortTable(tbody,column,order){
  const rows=Array.from(tbody.querySelectorAll("tr"));
  rows.sort((a,b)=>{
    let aVal,bVal;
    if(column==="rank") { aVal=parseInt(a.children[0].textContent); bVal=parseInt(b.children[0].textContent); }
    else if(column==="player") { aVal=a.children[1].textContent.toLowerCase(); bVal=b.children[1].textContent.toLowerCase(); }
    else if(column==="value") { aVal=parseFloat(a.children[2].textContent); bVal=parseFloat(b.children[2].textContent); }
    if(aVal<bVal) return order==="asc"?-1:1;
    if(aVal>bVal) return order==="asc"?1:-1;
    return 0;
  });
  rows.forEach(r=>tbody.appendChild(r));
}
