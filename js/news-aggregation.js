// ═══════════════════════════════════════════════════════════════════════════
//              NEWS AGGREGATION MODULE v1.0
// Fetches news from multiple sources:
// - DigiCafe News (Manual/Firebase)
// - The Hindu RSS Feed
// - Hindustan Times RSS Feed
// - Medium Articles
// - Other relevant sources
// ═══════════════════════════════════════════════════════════════════════════

// ═══ NEWS SOURCES CONFIGURATION ═══
const NEWS_SOURCES = {
  // The Hindu - India's leading newspaper
  theHindu: {
    name: 'The Hindu',
    feedUrl: 'https://www.thehindu.com/news/feeder/default.rss',
    category: 'National News',
    logo: '📰',
    color: '#0f1f3f'
  },

  // Hindustan Times - Major Hindi newspaper
  hindustanTimes: {
    name: 'Hindustan Times',
    feedUrl: 'https://www.hindustantimes.com/feeds/rss/india-news/',
    category: 'India News',
    logo: '📰',
    color: '#1a3a52'
  },

  // Medium - Your Medium publication
  medium: {
    name: 'Medium',
    feedUrl: 'https://medium.com/feed/@YOUR_MEDIUM_USERNAME',
    category: 'Expert Articles',
    logo: '📝',
    color: '#000'
  },

  // Times of India RSS
  timesOfIndia: {
    name: 'Times of India',
    feedUrl: 'https://timesofindia.indiatimes.com/rssfeeds/-2128068149.cms',
    category: 'Breaking News',
    logo: '📰',
    color: '#e74c3c'
  },

  // Business Standard
  businessStandard: {
    name: 'Business Standard',
    feedUrl: 'https://www.business-standard.com/rss/latest.rss',
    category: 'Business',
    logo: '📊',
    color: '#16529a'
  },

  // Economic Times
  economicTimes: {
    name: 'Economic Times',
    feedUrl: 'https://economictimes.indiatimes.com/rssfeeds/',
    category: 'Economy',
    logo: '💹',
    color: '#003399'
  },

  // Financial Express
  financialExpress: {
    name: 'Financial Express',
    feedUrl: 'https://www.financialexpress.com/feed/',
    category: 'Finance',
    logo: '💰',
    color: '#00008b'
  }
};

// ═══ FETCH NEWS FROM ALL SOURCES ═══
async function fetchAllNews(limit = 50) {
  const allNews = [];

  // Fetch from each source
  for (const [key, source] of Object.entries(NEWS_SOURCES)) {
    try {
      const articles = await fetchNewsFromSource(key, source);
      allNews.push(...articles);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Limit results
  return allNews.slice(0, limit);
}

// ═══ FETCH FROM SINGLE SOURCE ═══
async function fetchNewsFromSource(sourceKey, source) {
  try {
    // Skip if using placeholder Medium URL
    if (sourceKey === 'medium' && source.feedUrl.includes('YOUR_MEDIUM_USERNAME')) {
      console.warn('Medium feed URL not configured');
      return [];
    }

    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.feedUrl)}`
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.items || data.items.length === 0) return [];

    // Parse articles
    return data.items.map(item => ({
      title: item.title,
      description: cleanHtml(item.description).substring(0, 250) + '...',
      link: item.link,
      date: item.pubDate,
      source: source.name,
      sourceKey: sourceKey,
      category: source.category,
      logo: source.logo,
      image: extractImage(item.description),
      author: item.author || source.name
    }));

  } catch (error) {
    console.error(`Failed to fetch from ${source.name}:`, error);
    return [];
  }
}

// ═══ FETCH DIGICAFE NEWS FROM FIREBASE ═══
async function fetchDigiCafeNews() {
  try {
    const snapshot = await db.collection('news')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map(doc => ({
      title: doc.data().title,
      description: doc.data().description.substring(0, 250) + '...',
      link: '#',
      date: doc.data().createdAt?.toDate(),
      source: 'DigiCafe',
      sourceKey: 'digicafe',
      category: doc.data().category || 'DigiCafe News',
      logo: '🎯',
      image: doc.data().image,
      author: 'DigiCafe Team'
    }));

  } catch (error) {
    console.error('Error fetching DigiCafe news:', error);
    return [];
  }
}

// ═══ COMBINE ALL NEWS ═══
async function getAllNews(limit = 50) {
  const digicafeNews = await fetchDigiCafeNews();
  const externalNews = await fetchAllNews(limit);

  // Combine
  const allNews = [...digicafeNews, ...externalNews];

  // Sort by date
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Remove duplicates (by title)
  const unique = [];
  const titles = new Set();

  for (const article of allNews) {
    if (!titles.has(article.title.toLowerCase())) {
      unique.push(article);
      titles.add(article.title.toLowerCase());
    }
  }

  return unique.slice(0, limit);
}

// ═══ RENDER AGGREGATED NEWS ═══
function renderAggregatedNews(containerSelector, articles) {
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
    <div class="card news-article aggregated-news" data-source="${article.source}">
      <div class="flex-between" style="margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.2rem;">${article.logo}</span>
          <span class="badge" style="background:rgba(59,130,246,0.15); color:var(--blue);">
            ${article.source}
          </span>
          <span class="badge" style="background:rgba(16,185,129,0.15); color:var(--green);">
            ${article.category}
          </span>
        </div>
        <span style="color:var(--txt3); font-size:0.85rem;">
          📅 ${formatDate(new Date(article.date))}
        </span>
      </div>

      ${article.image ? `
        <img src="${article.image}" 
             alt="${article.title}"
             style="width:100%; max-height:200px; object-fit:cover; border-radius:var(--r); margin-bottom:1rem;">
      ` : ''}

      <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.75rem; line-height:1.4;">
        ${article.title}
      </h3>

      <p style="color:var(--txt2); line-height:1.6; margin-bottom:1rem;">
        ${article.description}
      </p>

      <div class="flex-between" style="align-items:center;">
        <small style="color:var(--txt3);">By ${article.author}</small>
        ${article.link && article.link !== '#'
          ? `<a href="${article.link}" target="_blank" class="btn btn-primary btn-small">
               Read Full Article →
             </a>`
          : `<span style="color:var(--txt3); font-size:0.85rem;">Internal Post</span>`}
      </div>
    </div>
  `).join('');
}

// ═══ LOAD AND DISPLAY ═══
async function loadAndDisplayAggregatedNews(containerSelector, limit = 50) {
  const container = document.querySelector(containerSelector);
  
  if (container) {
    container.innerHTML = '<div style="text-align:center;"><div class="spinner"></div> Loading news from multiple sources...</div>';
  }

  try {
    const articles = await getAllNews(limit);
    renderAggregatedNews(containerSelector, articles);
  } catch (error) {
    console.error('Error loading aggregated news:', error);
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:var(--red);">Error loading news sources</p>`;
    }
  }
}

// ═══ FILTER BY SOURCE ═══
async function filterNewsBySource(containerSelector, sourceKey) {
  const articles = await getAllNews(100);
  const filtered = sourceKey === 'all'
    ? articles
    : articles.filter(a => a.sourceKey === sourceKey);

  renderAggregatedNews(containerSelector, filtered);
}

// ═══ FILTER BY CATEGORY ═══
async function filterNewsByCategory(containerSelector, category) {
  const articles = await getAllNews(100);
  const filtered = category === 'all'
    ? articles
    : articles.filter(a => a.category === category);

  renderAggregatedNews(containerSelector, filtered);
}

// ═══ SEARCH NEWS ═══
async function searchNews(containerSelector, query) {
  const articles = await getAllNews(100);
  const lowerQuery = query.toLowerCase();

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(lowerQuery) ||
    a.description.toLowerCase().includes(lowerQuery)
  );

  renderAggregatedNews(containerSelector, filtered);
}

// ═══ HELPER FUNCTIONS ═══

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extractImage(html) {
  if (!html) return null;
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : null;
}

// Update Medium feed URL when configured
function setMediumFeedUrl(username) {
  NEWS_SOURCES.medium.feedUrl = `https://medium.com/feed/@${username}`;
}

// ═══ AUTO-REFRESH ═══
function autoRefreshNews(containerSelector, limit = 50, intervalMinutes = 30) {
  // Load immediately
  loadAndDisplayAggregatedNews(containerSelector, limit);

  // Refresh periodically
  setInterval(() => {
    loadAndDisplayAggregatedNews(containerSelector, limit);
  }, intervalMinutes * 60 * 1000);

  console.log(`✅ News aggregation set to refresh every ${intervalMinutes} minutes`);
}

console.log('✅ News Aggregation Module loaded - Multiple sources configured');
