async function fetchWorks() {
  const res = await fetch('data/works.json', { cache: 'no-store' });
  if (!res.ok) return [];
  return await res.json();
}

/* ❶ 旧/新データの両対応ヘルパ */
function parseWorkTitle(item) {
  if (item.titleMain) {
    return { main: item.titleMain, brand: item.titleBrand || null };
  }
  // 後方互換："Main - Brand -" 形式なら分割
  const t = item.title || "";
  const m = t.match(/^(.*?)\s*-\s*(.*?)\s*-\s*$/u);
  return m ? { main: m[1], brand: m[2] } : { main: t, brand: null };
}

function createCard(item) {
  /* ❷ タイトルHTMLを組み立て（brandだけ色替え用のspanを付与） */
  const { main, brand } = parseWorkTitle(item);
  const titleHtml = brand
    ? `${main} <span class="sep">-</span> <span class="title-brand">${brand}</span> <span class="sep">-</span>`
    : `${main}`;
  const altText = brand ? `${main} - ${brand} -` : main;

  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <a href="${item.url}" target="_blank" rel="noopener">
      <img class="card-thumb" src="${item.thumb}" alt="${altText}" loading="lazy">
      <div class="card-body">
        <h4 class="card-title work-title">${titleHtml}</h4>
        <p class="card-summary">${item.summary}</p>
        <div class="tag-row">${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </a>
  `;
  return card;
}

function renderLatest(works) {
  const wrap = document.getElementById('latest-works');
  if (!wrap) return;
  works.slice(0, 3).forEach(w => wrap.appendChild(createCard(w)));
}

function renderAll(works) {
  const grid = document.getElementById('works-grid');
  if (!grid) return;
  const typeSel = document.getElementById('filter-type');
  const techSel = document.getElementById('filter-tech');

  function apply() {
    grid.innerHTML = '';
    const type = typeSel?.value || 'all';
    const tech = techSel?.value || 'all';
    works
      .filter(w => (type === 'all' || w.type === type))
      .filter(w => (tech === 'all' || (w.tags || []).includes(tech)))
      .forEach(w => grid.appendChild(createCard(w)));
  }

  typeSel?.addEventListener('change', apply);
  techSel?.addEventListener('change', apply);
  apply();
}

(async () => {
  const works = await fetchWorks();
  renderLatest(works);
  renderAll(works);
})();
