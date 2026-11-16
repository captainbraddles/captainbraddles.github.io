document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('filters');
  const panel = document.getElementById('filter-panel');
  const seasonBox = document.getElementById('season-filters');
  const catSel = document.getElementById('category-filter');
  const partSel = document.getElementById('participant-filter');
  const groupSel = document.getElementById('group-by');
  const status = document.getElementById('status');
  const showAll = document.getElementById('show-all-cols');
  const wrap = document.getElementById('results-wrap');
  const mobile = window.matchMedia('(max-width: 600px)');
  const secondary = [1, 5, 7, 8, 9]; // Picks, Jokers Used, Points From Jokers, 40s, 80s
  let table = null;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function applyColumns() {
    if (!table) return;
    table.columns(secondary).visible(!mobile.matches || showAll.checked);
    table.columns.adjust();
  }
  mobile.addEventListener('change', applyColumns);
  showAll.addEventListener('change', applyColumns);

  async function loadOptions() {
    const [seasons, cats, parts] = await Promise.all([
      db.from('seasons').select('id, name, completed').order('id', { ascending: false }),
      db.from('categories').select('name').order('name'),
      db.from('participants').select('id, name').order('name')
    ]);
    [seasons, cats, parts].forEach(r => { if (r.error) throw r.error; });

    seasonBox.innerHTML = seasons.data.map(s =>
      `<label><input type="checkbox" value="${s.id}" ${s.completed ? 'checked' : ''}> ${esc(s.name)}${s.completed ? '' : ' (in progress)'}</label>`).join('');
    catSel.innerHTML = cats.data.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
    partSel.innerHTML = parts.data.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  }

  async function run(fromUser) {
    const seasons = [...seasonBox.querySelectorAll('input:checked')].map(i => Number(i.value));
    const cats = [...catSel.selectedOptions].map(o => o.value);
    const parts = [...partSel.selectedOptions].map(o => Number(o.value));
    const groupBy = groupSel.value;

    status.textContent = 'Crunching the numbers…';
    const { data, error } = await db.rpc('custom_stats', {
      p_seasons: seasons.length ? seasons : null,
      p_categories: cats.length ? cats : null,
      p_participants: parts.length ? parts : null,
      p_joker: form.elements['joker'].value,
      p_group_by: groupBy
    });
    if (error) { console.error(error); status.textContent = 'Something went wrong loading the stats.'; return; }

    if (table) { table.destroy(); document.getElementById('results').innerHTML = ''; table = null; }
    status.textContent = data.length ? '' : 'No results for those filters.';
    if (!data.length) return;

    const labelTitle = { participant: 'SportsMaster', category: 'Category', season: 'Season' }[groupBy];
    table = new DataTable('#results', {
      data,
      paging: true,
      pageLength: 25,
      order: [[4, 'desc']],
      scrollX: true,
      columns: [
        { title: labelTitle, data: 'label', render: DataTable.render.text() },
        { title: 'Picks', data: 'picks' },
        { title: 'Correct', data: 'correct' },
        { title: 'Accuracy %', data: 'accuracy' },
        { title: 'Points', data: 'points' },
        { title: 'Jokers Used', data: 'jokers_used' },
        { title: 'Jokers Won', data: 'jokers_won' },
        { title: 'Points From Jokers', data: 'points_from_jokers' },
        { title: '40 Pointers', data: 'forty_pointers' },
        { title: '80 Pointers', data: 'eighty_pointers' }
      ]
    });
    applyColumns();

    // On a phone, tuck the filters away and jump to the results
    if (fromUser && mobile.matches) {
      panel.open = false;
      wrap.scrollIntoView({ behavior: 'smooth' });
    }
  }

  form.addEventListener('submit', e => { e.preventDefault(); run(true); });
  document.getElementById('reset').addEventListener('click', async () => {
    form.reset(); await loadOptions(); run(false);
  });

  // Start with the filter panel closed on phones so the results show first
  if (mobile.matches) panel.open = false;

  try { await loadOptions(); await run(false); }
  catch (err) { console.error(err); status.textContent = 'Could not load the filters.'; }
});