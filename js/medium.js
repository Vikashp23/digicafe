// ═══ MEDIUM RSS FEED MODULE ═══
// Fetch and display Medium articles on DigiCafe

// CONFIGURATION - CHANGE THIS TO YOUR MEDIUM URL
const MEDIUM_FEED_URL = 'https://medium.com/feed/@YOUR_MEDIUM_USERNAME';

// Alternative: For Medium Publication
// const MEDIUM_FEED_URL = 'https://medium.com/feed/publication-name';

/* FETCH MEDIUM ARTICLES */
function fetchMediumArticles(limit = 5) {
  return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch Medium feed');
      }
      return response.json();
    })
    .then(data => {
      if (!data.items) {
        throw new Error('No articles found');
      }
      
      // Process articles
      const articles = data.items.slice(0, limit).map(item => ({
        title: item.title,
        description: item.description
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .substring(0, 200) + '...', // Limit to 200 chars
        link: item.link,
        pubDate: item.pubDate,
        image: extractImageFromDescription(item.description),
        category: 'Medium',
        author: item.author || 'Medium'
      }));

      return articles;
    })
    .catch(error => {
      console.error('Error fetching Medium articles:', error);
      return [];
    });
}

/* EXTRACT IMAGE FROM ARTICLE */
function extractImageFromDescription(html) {
  if (!html) return null;
  
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : null;
}

/* RENDER MEDIUM ARTICLES */
function renderMediumArticles(containerSelector, articles) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

  if (articles.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--txt3);">No Medium articles available</p>';
    return;
  }

  container.innerHTML = articles.map(article => `
    <div class="card medium-article" data-medium="true">
      <div class="flex-between" style="margin-bottom:1rem;">
        <span class="badge badge-primary">📝 ${article.category}</span>
        <span style="color:var(--txt3); font-size:0.85rem;">
          📅 ${formatDate(new Date(article.pubDate))}
        </span>
      </div>
      
      ${article.image ? `
        <img src="${article.image}" alt="${article.title}" 
             style="width:100%; height:200px; object-fit:cover; border-radius:var(--r); margin-bottom:1rem;">
      ` : ''}
      
      <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.75rem;">
        ${article.title}
      </h3>
      
      <p style="color:var(--txt2); line-height:1.6; margin-bottom:1rem;">
        ${article.description}
      </p>
      
      <div class="flex-between" style="align-items:center;">
        <small style="color:var(--txt3);">By ${article.author}</small>
        <a href="${article.link}" target="_blank" class="btn btn-primary btn-small">
          Read on Medium →
        </a>
      </div>
    </div>
  `).join('');
}

/* LOAD AND DISPLAY MEDIUM ARTICLES */
async function loadAndDisplayMediumArticles(containerSelector, limit = 5) {
  // Show loading state
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = '<div style="text-align:center;"><div class="spinner"></div> Loading Medium articles...</div>';
  }

  try {
    const articles = await fetchMediumArticles(limit);
    renderMediumArticles(containerSelector, articles);
  } catch (error) {
    console.error('Error loading Medium articles:', error);
    if (container) {
      container.innerHTML = `<p style="text-align:center; color:var(--red);">Error loading Medium articles</p>`;
    }
  }
}

console.log('✅ Medium RSS Feed module loaded');
