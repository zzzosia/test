import './style.css';
import { format } from 'date-fns';

document.querySelector('#app').innerHTML = `
  <h1>zosia mrożek</h1>

  <div id="sort-field">
    <label for="sort-select" class="select-header">sortuj według:</label>
    <select id="sort-select">
      <option value="created_at.asc">po dacie rosnąco</option>
      <option value="created_at.desc" selected>po dacie malejąco</option>
      <option value="title.asc">po nazwie alfabetycznie</option>
    </select>
  </div>

  <ul id="articles-list"></ul>

  <h2 id="add-article-header">dodaj nowy artykuł</h2>
  <form id="article-form">
    <label>
      tytuł:
      <input type="text" name="title" placeholder="tytuł" required />
    </label>
    <label>
      podtytuł:
      <input type="text" name="subtitle" placeholder="podtytuł" required />
    </label>
    <label>
      autor:
      <input type="text" name="author" placeholder="autor" required />
    </label>
    <label>
      treść artykułu:
      <textarea name="content" placeholder="treść artykułu" required></textarea>
    </label>
    <label>
      data utworzenia:
      <input type="date" name="created_at" placeholder="data utworzenia" />
    </label>
    <button type="submit" class="submit-button">dodaj artykuł</button>
  </form>
`;

const API_URL = 'https://eohovqvrwlupfctqzhdk.supabase.co/rest/v1/article';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvaG92cXZyd2x1cGZjdHF6aGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzUxMjcsImV4cCI6MjA2MzI1MTEyN30.lvHieYaC0EiorhK-HWaD57AZq_cg7Ui7pKQ1yvuvxQI';

const sortSelect = document.getElementById('sort-select');
sortSelect.addEventListener('change', fetchArticles);

const fetchArticles = async () => {
  const order = sortSelect?.value || 'created_at.desc';

  try {
    const response = await fetch(`${API_URL}?order=${order}`, {
      headers: {
        apiKey: API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    showArticles(data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const showArticles = (articles) => {
  const list = document.getElementById('articles-list');
  list.innerHTML = '';

  articles.forEach((article) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <h2>${article.title}</h2>
      <h3>${article.subtitle}</h3>
      <p><address>autor: ${article.author}</address></p>
      <p><time>data: ${format(new Date(article.created_at), 'dd-MM-yyyy')}</time></p>
      <p>${article.content}</p>
      <p>tagi: ${article.tags || 'brak'}</p>
      <p>status: ${article.is_published ? 'opublikowany' : 'szkic'}</p>
    `;
    list.appendChild(li);
  });
};

const form = document.getElementById('article-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const newArticle = {
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    author: formData.get('author'),
    content: formData.get('content'),
    tags: formData.get('tags') || null,
    is_published: formData.get('is_published') === 'on',
    created_at: formData.get('created_at')
      ? new Date(formData.get('created_at')).toISOString()
      : new Date().toISOString(),
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        apiKey: API_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(newArticle),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);

    fetchArticles();
    form.reset();
  } catch (error) {
    console.error('Błąd dodawania artykułu:', error);
  }
});

fetchArticles();
