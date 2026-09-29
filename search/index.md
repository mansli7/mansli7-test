---
layout: default
title: Search
---

<div class="max-w-4xl mx-auto mt-2">
  <div class="mb-8">
    <p class="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Search</p>
    <h1 style="font-size:1.875rem;">🔎 Search the Site</h1>
    <p class="text-slate-500">Search Bible studies, reading-plan pages, and supporting resources from one place.</p>
  </div>

  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
    <div class="relative mb-4">
      <input
        type="text"
        id="searchInput"
        placeholder="Search Bible studies, questions, and resources..."
        class="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 pr-14 text-lg text-slate-900 transition-all"
        autocomplete="off"
      >
      <span class="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-50">🔍</span>
    </div>
    <div id="searchStats" class="text-center text-slate-500 text-sm mb-4"></div>
    <div id="searchResults"></div>
  </div>

  <div id="quickNav" class="bg-slate-50 rounded-3xl border border-slate-200 p-6">
    <p class="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Quick Navigation</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <a href="/bs/" class="search-shortcut">📖 Bible Study Portal</a>
      <a href="/bs/ar/" class="search-shortcut">📅 Annual Reading</a>
      <a href="/bs/sq/" class="search-shortcut">❓ Study Questions</a>
      <a href="/tech/" class="search-shortcut">💻 Technology</a>
    </div>
  </div>

  <!-- Bible Verse Search Card -->
  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
      <div>
        <p class="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">Bible</p>
        <h2 style="margin:0;font-size:1.25rem;">📖 Bible Verse Search</h2>
        <p class="text-slate-500" style="margin-top:6px">Search verses across the KJV corpus. Supports boolean &amp;, |, ~, quoted phrases and /regex/.</p>
      </div>
      <div style="color:#94a3b8;font-size:13px">Static demo</div>
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <input id="bible-q" type="text" placeholder='e.g. "in the beginning" or faith & hope or /love/' style="flex:1;padding:10px 12px;border:1px solid #e6eef8;border-radius:8px;font-size:15px">
      <select id="bible-version" style="padding:10px;border-radius:8px;border:1px solid #e6eef8">
        <option value="KJV" selected>KJV</option>
        <option value="CUV">CUV1919</option>
      </select>
      <button id="bible-run" style="background:#2563eb;color:#fff;border:none;padding:10px 14px;border-radius:8px;">Search</button>
      <button id="bible-clear" style="background:#64748b;color:#fff;border:none;padding:10px 14px;border-radius:8px;">Clear</button>
    </div>

    <div id="bible-results"></div>
    <div id="bible-pager" style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:12px"></div>
  </div>
</div>

<style>
#searchInput:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: #ffffff;
}

.search-result {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.search-result:hover {
  border-color: #c7d2fe;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.search-result h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.search-result h3 a {
  color: #0f172a;
  text-decoration: none;
}

.search-result h3 a:hover {
  color: #6366f1;
}

.search-result p {
  color: #475569;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.search-result .search-url {
  font-size: 0.85rem;
  color: #94a3b8;
  font-family: monospace;
}

.highlight {
  background: rgba(99, 102, 241, 0.2);
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
  font-weight: 600;
}

.search-shortcut {
  padding: 0.9rem 1rem;
  background: #ffffff;
  border-radius: 16px;
  text-decoration: none;
  color: #0f172a;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  font-weight: 500;
}

.search-shortcut:hover {
  background: #f8fafc;
  border-color: #c7d2fe;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
</style>

<script>
let searchData = [];
let searchIndexLoaded = false;

// Load search data
fetch((window.Mansli7BaseUrl || '') + '/search.json?v=' + Date.now())
  .then(response => {
    if (!response.ok) {
      throw new Error('Search index not found (HTTP ' + response.status + ')');
    }
    return response.json();
  })
  .then(data => {
    searchData = data.pages || data;
    searchIndexLoaded = true;
    document.getElementById('searchStats').innerHTML = '<span style="color: #10b981;">✓ Search ready - ' + searchData.length + ' pages indexed</span>';
    
    // If there's a search query already, perform search
    const currentQuery = document.getElementById('searchInput').value;
    if (currentQuery) {
      performSearch(currentQuery);
    }
  })
  .catch(error => {
    document.getElementById('searchStats').innerHTML = `
      <div style="background: rgba(220, 38, 38, 0.05); border: 1px solid #fecaca; border-radius: 16px; padding: 1rem; margin-bottom: 1rem;">
        <p style="color: #dc2626; margin: 0 0 0.5rem 0; font-weight: 600;">⚠️ Search error</p>
        <p style="color: #64748b; font-size: 0.9rem; margin: 0;">
          ${error.message}. Please try refreshing the page (Ctrl+Shift+R or Cmd+Shift+R).
        </p>
      </div>
    `;
    document.getElementById('searchInput').disabled = true;
    document.getElementById('searchInput').placeholder = 'Search unavailable - use Quick Navigation below';
    document.getElementById('quickNav').style.display = 'block';
  });

// Search function
async function performSearch(query) {
  const searchInput = document.getElementById('searchInput');
  const resultsDiv = document.getElementById('searchResults');
  const statsDiv = document.getElementById('searchStats');
  const quickNav = document.getElementById('quickNav');
  
  // Check if search index is loaded
  if (!searchIndexLoaded) {
    return;
  }

  // Ensure the bible search engine script has loaded to avoid "SearchEngine is not defined"
  if(typeof window.SearchEngine === 'undefined'){
    // wait up to 5s for the script to arrive (handles cache/stale deploys)
    await new Promise(resolve=>{
      const start = Date.now();
      const check = ()=>{ if(window.SearchEngine) return resolve(); if(Date.now()-start>5000) return resolve(); setTimeout(check,200); };
      check();
    });
    if(typeof window.SearchEngine === 'undefined'){
      document.getElementById('searchResults').innerHTML = '<div style="padding:14px;background:#fff;border:1px solid #fee2e2;border-radius:12px;color:#dc2626">Search engine not loaded. Try a hard refresh (Cmd/Ctrl+Shift+R).</div>';
      return;
    }
  }
  
  if (!query || query.trim().length < 2) {
    resultsDiv.innerHTML = '';
    if (searchIndexLoaded) {
      statsDiv.innerHTML = '<span style="color: #10b981;">✓ Search ready - ' + searchData.length + ' pages indexed</span>';
    }
    quickNav.style.display = 'block';
    return;
  }

  quickNav.style.display = 'none';
  const searchTerms = query.trim().split(/\s+/);
  
  const results = searchData.filter(page => {
    // For Chinese and other non-ASCII characters, don't use toLowerCase on the content
    // Just use the original text for matching
    const titleOriginal = page.title || '';
    const contentOriginal = page.content || '';
    const titleLower = titleOriginal.toLowerCase();
    const contentLower = contentOriginal.toLowerCase();
    
    return searchTerms.every(term => {
      const termLower = term.toLowerCase();
      // Check both case-insensitive (for English) and case-sensitive (for Chinese)
      return titleLower.includes(termLower) || contentLower.includes(termLower) ||
             titleOriginal.includes(term) || contentOriginal.includes(term);
    });
  }).map(page => {
    // Calculate relevance score
    let score = 0;
    const titleOriginal = page.title || '';
    const contentOriginal = page.content || '';
    const titleLower = titleOriginal.toLowerCase();
    const contentLower = contentOriginal.toLowerCase();
    
    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      // Title matches get higher scores
      if (titleLower.includes(termLower) || titleOriginal.includes(term)) score += 10;
      // Content matches get lower scores
      if (contentLower.includes(termLower) || contentOriginal.includes(term)) score += 1;
    });
    return { ...page, score };
  }).sort((a, b) => b.score - a.score);

  // Display results
  if (results.length === 0) {
    statsDiv.innerHTML = `No results found for "<strong>${escapeHtml(query)}</strong>"`;
    resultsDiv.innerHTML = `
      <div style="text-align: center; padding: 2rem; opacity: 0.7; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px;">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">😕 No matches found</p>
        <p style="color: #64748b;">Try different keywords or browse using Quick Navigation below</p>
      </div>
    `;
    quickNav.style.display = 'block';
    return;
  }

  statsDiv.innerHTML = `Found <strong>${results.length}</strong> result${results.length !== 1 ? 's' : ''} for "<strong>${escapeHtml(query)}</strong>"`;
  
  resultsDiv.innerHTML = results.map(result => {
    const highlightedTitle = highlightText(result.title, searchTerms);
    const highlightedExcerpt = highlightText(result.excerpt, searchTerms);
    
    return `
      <div class="search-result">
        <h3><a href="${result.url}">${highlightedTitle}</a></h3>
        <p class="search-url">${result.url}</p>
        <p>${highlightedExcerpt}</p>
      </div>
    `;
  }).join('');
}

// Highlight matching terms
function highlightText(text, terms) {
  if (!text) return '';
  let highlighted = escapeHtml(text);
  terms.forEach(term => {
    // Create regex that matches both case-insensitive and exact matches
    const escapedTerm = escapeRegex(term);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
  });
  return highlighted;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
  performSearch(e.target.value);
});

// Focus search input on page load
document.getElementById('searchInput').focus();

// Handle URL parameters (if someone links with ?q=search)
const urlParams = new URLSearchParams(window.location.search);
const queryParam = urlParams.get('q');
if (queryParam) {
  document.getElementById('searchInput').value = queryParam;
  performSearch(queryParam);
}
</script>

<!-- Load bible search engine and wire the UI -->
<script src="{{ '/assets/js/search-engine.js' | relative_url }}"></script>
<script>
(function(){
  const pageSize = 10;
  let currentResults = [];
  let page = 0;

  const qEl = document.getElementById('bible-q');
  const runBtn = document.getElementById('bible-run');
  const clearBtn = document.getElementById('bible-clear');
  const versionSel = document.getElementById('bible-version');
  const resultsEl = document.getElementById('bible-results');
  const pagerEl = document.getElementById('bible-pager');

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'); }

  function buildHighlightRegex(q){
    const hl = [];
    try{
      const phraseMatches = q.match(/"([^\"]+)"/g) || [];
      for(const p of phraseMatches) hl.push(escapeRegExp(p.replace(/"/g,'')));
      const regexMatches = q.match(/\/(.+?)\//g) || [];
      for(const r of regexMatches) hl.push(r.slice(1,-1));
      const words = q.replace(/"[^\"]+"/g,'').replace(/\/.+?\//g,'').split(/\s+/).filter(Boolean);
      for(const w of words){ if(/^[&|~()]+$/.test(w)) continue; hl.push('\\b'+escapeRegExp(w)+'\\b'); }
    }catch(e){ }
    return hl.length ? new RegExp('(' + hl.join('|') + ')', 'ig') : null;
  }

  function renderPage(){
    resultsEl.innerHTML = '';
    if(!currentResults.length){ resultsEl.innerHTML = '<div style="padding:14px;background:#fff;border:1px solid #e6eef8;border-radius:12px;color:#64748b;text-align:center">No results</div>'; pagerEl.innerHTML=''; return; }
    const start = page * pageSize; const slice = currentResults.slice(start, start+pageSize);
    const info = document.createElement('div'); info.style.color='#6b7280'; info.style.marginBottom='8px'; info.textContent = `Found ${currentResults.length} verses`;
    resultsEl.appendChild(info);
    const hlRe = buildHighlightRegex(qEl.value || '');
    for(const v of slice){
      const card = document.createElement('div'); card.style.padding='12px'; card.style.marginBottom='8px'; card.style.background='#fff'; card.style.border='1px solid #eef2ff'; card.style.borderRadius='8px';
      const title = document.createElement('strong'); title.textContent = `${v.book} ${v.chapter}:${v.verse}`;
      const p = document.createElement('div'); p.innerHTML = escapeHtml(v.text);
      if(hlRe) p.innerHTML = p.innerHTML.replace(hlRe, '<mark>$1</mark>');
      card.appendChild(title); card.appendChild(p); resultsEl.appendChild(card);
    }
    const totalPages = Math.ceil(currentResults.length / pageSize);
    pagerEl.innerHTML = '';
    if(totalPages>1){
      const prev = document.createElement('button'); prev.textContent='Prev'; prev.disabled = page===0; prev.onclick = ()=>{ page--; renderPage(); };
      const next = document.createElement('button'); next.textContent='Next'; next.disabled = page+1>=totalPages; next.onclick = ()=>{ page++; renderPage(); };
      const info2 = document.createElement('span'); info2.textContent = `Page ${page+1}/${totalPages}`; info2.style.margin='0 8px';
      pagerEl.appendChild(prev); pagerEl.appendChild(info2); pagerEl.appendChild(next);
    }
  }

  async function doSearch(){
    const q = qEl.value.trim(); if(!q) return;
    const ver = versionSel.value || 'KJV';
    runBtn.disabled = true; runBtn.textContent = 'Searching...';
    try{
      currentResults = await SearchEngine.search(q, ver);
      page = 0; renderPage();
    }catch(e){ resultsEl.innerHTML = `<div style="padding:14px;background:#fff;border:1px solid #fee2e2;border-radius:12px;color:#dc2626">Search failed: ${escapeHtml(e.message||e)}</div>`; pagerEl.innerHTML=''; }
    runBtn.disabled = false; runBtn.textContent = 'Search';
  }

  runBtn.addEventListener('click', doSearch);
  qEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });
  clearBtn.addEventListener('click', ()=>{ qEl.value=''; currentResults=[]; page=0; resultsEl.innerHTML=''; pagerEl.innerHTML=''; });
})();
</script>

---

<p style="text-align: center; margin-top: 3rem;">
  <a href="/">← Back to Home</a>
</p>
