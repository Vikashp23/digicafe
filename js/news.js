// ═══ NEWS MODULE ═══
// All DigiCafe news articles and rendering

const NEWS_ARTICLES = [
  {title:'Ministry of Corporate Affairs Announces New Company Registration Guidelines',date:'22 Jul 2026',category:'Ministry',description:'New streamlined process for company registration launched. Expected processing time reduced from 7 days to 24 hours. Apply through MCA portal with Aadhaar and PAN.'},
  {title:'Digital India Initiative: 500 New Common Service Centers Inaugurated',date:'21 Jul 2026',category:'Digital India',description:'Government inaugurates 500 CSCs in rural areas. Free Wi-Fi and digital services now available in villages. Focus on digital literacy and financial inclusion.'},
  {title:'MSME Registration Crosses 5 Crore Mark: Udyam Portal Success',date:'20 Jul 2026',category:'MSME',description:'Ministry announces 5 crore+ businesses registered. Average growth 15% YoY. Government extends GST exemption for MSMEs earning <40 lakh.'},
  {title:'Bangalore Startup Ecosystem Valued at $100 Billion: New Report',date:'19 Jul 2026',category:'Local News',description:'Bangalore tech industry report shows 12,000+ startups operating. Job creation up 25%. IT exports reach $180 billion. Infrastructure development ongoing.'},
  {title:'Stock Market Hits New Record: Sensex Crosses 85,000 Mark',date:'18 Jul 2026',category:'Business',description:'Indian stock markets show strong performance. Auto and IT sectors lead gains. Foreign investments increase 18% YoY. RBI maintains growth forecast at 6.5%.'},
  {title:'GST Council Approves Changes: Tax Rate Modifications Effective August 2026',date:'17 Jul 2026',category:'GST',description:'New GST rate structure approved for 40+ commodities. IT services, healthcare, and agriculture see rate adjustments. Implementation guidelines released.'},
  {title:'Ministry Launches Digital Rupee: Pilot Phase Complete',date:'16 Jul 2026',category:'Digital India',description:'RBI completes e-Rupee pilot testing. Full launch planned September 2026. Banks begin preparations for digital currency integration.'},
  {title:'Union Budget 2026: Major Tax Changes Announced',date:'15 Jul 2026',category:'Income Tax',description:'Finance Ministry announces significant changes in tax slabs and deductions for FY 2026-27. New incentives for startup and green energy sectors.'},
  {title:'GST Rate on IT Services Revised Effective July 2026',date:'14 Jul 2026',category:'GST',description:'New GST rate structure implemented for Information Technology and software services sector. Compliance timeline updated.'},
  {title:'CBDT Updates ITR Schedules for AY 2026-27',date:'13 Jul 2026',category:'Income Tax',description:'New appendix and schedules released for Income Tax Returns filing for assessment year 2026-27. Download from e-filing portal.'},
];

/* RENDER NEWS TO ELEMENT */
function renderNews(containerSelector, limit = null, category = null) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Container not found: ${containerSelector}`);
    return;
  }

  let articlesToShow = NEWS_ARTICLES;
  
  // Filter by category if provided
  if (category) {
    articlesToShow = articlesToShow.filter(a => a.category === category);
  }
  
  // Limit results if specified
  if (limit) {
    articlesToShow = articlesToShow.slice(0, limit);
  }

  container.innerHTML = articlesToShow.map(article => `
    <div class="card news-article" data-category="${article.category}">
      <div class="flex-between" style="margin-bottom: 1rem;">
        <span class="badge badge-primary">${article.category}</span>
        <span class="article-date" style="color: var(--txt3); font-size: 0.85rem;">
          📅 ${article.date}
        </span>
      </div>
      <h3 class="article-title" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem;">
        ${article.title}
      </h3>
      <p class="article-description" style="color: var(--txt2); line-height: 1.6;">
        ${article.description}
      </p>
    </div>
  `).join('');
}

/* GET NEWS BY CATEGORY */
function getNewsByCategory(category) {
  return NEWS_ARTICLES.filter(a => a.category === category);
}

/* GET UNIQUE NEWS CATEGORIES */
function getNewsCategories() {
  return [...new Set(NEWS_ARTICLES.map(a => a.category))];
}

/* GET LATEST NEWS */
function getLatestNews(count = 3) {
  return NEWS_ARTICLES.slice(0, count);
}

/* SEARCH NEWS */
function searchNews(query) {
  const lowerQuery = query.toLowerCase();
  return NEWS_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.description.toLowerCase().includes(lowerQuery)
  );
}

console.log('✅ News module loaded -', NEWS_ARTICLES.length, 'articles');
