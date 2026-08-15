// ═══ COMBINED NEWS MODULE ═══
// Mix DigiCafe news with Medium articles

/* COMBINE DIGICAFE AND MEDIUM ARTICLES */
async function getCombinedNews(limit = 10) {
  // Get DigiCafe articles
  const digicafeArticles = NEWS_ARTICLES.map(article => ({
    ...article,
    source: 'DigiCafe',
    link: '#'
  }));

  // Get Medium articles
  let mediumArticles = [];
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`);
    const data = await response.json();
    
    mediumArticles = (data.items || []).map(item => ({
      title: item.title,
      description: item.description
        .replace(/<[^>]*>/g, '')
        .substring(0, 200) + '...',
      date: new Date(item.pubDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      category: 'Medium',
      source: 'Medium',
      link: item.link,
      author: item.author || 'Medium',
      image: extractImageFromDescription(item.description)
    }));
  } catch (error) {
    console.error('Error fetching Medium articles:', error);
  }

  // Combine all articles
  const allArticles = [...digicafeArticles, ...mediumArticles];

  // Sort by date (newest first)
  allArticles.sort((a, b) => {
    const dateA = new Date(a.date || a.pubDate || 0);
    const dateB = new Date(b.date || b.pubDate || 0);
    return dateB - dateA;
  });

  // Limit results
  return allArticles.slice(0, limit);
}

/* RENDER COMBINED ARTICLES */
function renderCombinedNews(containerSelector, articles) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

  if (articles.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--txt3);">No articles available</p>';
    return;
  }

  container.innerHTML = articles.map(article => `
    <div class="card news-article combined-article" data-source="${article.source}">
      <div class="flex-between" style="margin-bottom:1rem;">
        <span class="badge badge-${article.source === 'Medium' ? 'primary' : 'success'}">
          ${article.source === 'Medium' ? '📝' : '📰'} ${article.category || article.source}
        </span>
        <span style="color:var(--txt3); font-size:0.85rem;">
          📅 ${article.date}
        </span>
      </div>
      
      <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.75rem;">
        ${article.title}
      </h3>
      
      <p style="color:var(--txt2); line-height:1.6; margin-bottom:1rem;">
        ${article.description}
      </p>
      
      <div class="flex-between" style="align-items:center;">
        ${article.author ? `<small style="color:var(--txt3);">By ${article.author}</small>` : '<div></div>'}
        ${article.link && article.source === 'Medium' 
          ? `<a href="${article.link}" target="_blank" class="btn btn-primary btn-small">Read →</a>` 
          : `<span style="color:var(--txt3); font-size:0.85rem;">DigiCafe</span>`}
      </div>
    </div>
  `).join('');
}

/* LOAD AND DISPLAY COMBINED NEWS */
async function loadAndDisplayCombinedNews(containerSelector, limit = 10) {
  // Show loading state
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = '<div style="text-align:center;"><div class="spinner"></div> Loading news...</div>';
  }

  try {
    const articles = await getCombinedNews(limit);
    renderCombinedNews(containerSelector, articles);
  } catch (error) {
    console.error('Error loading combined news:', error);
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:var(--red);">Error loading news</p>`;
    }
  }
}

/* FILTER BY SOURCE */
function filterNewsBySource(containerSelector, articles, source) {
  const filtered = source === 'all' 
    ? articles 
    : articles.filter(a => a.source === source);
  
  renderCombinedNews(containerSelector, filtered);
}

console.log('✅ Combined News module loaded');
