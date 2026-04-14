// ─── HELPERS ────────────────────────────────────────────────────────────────

const CATEGORIES = {
  musica: 'MÚSICA',
  carnaval: 'CARNAVAL',
  capoeira: 'CAPOEIRA',
  noite: 'NOITE',
  investigacao: 'INVESTIGAÇÃO'
};

function getArticles() {
  const stored = localStorage.getItem('vandalize_articles');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
}

function saveArticles(articles) {
  localStorage.setItem('vandalize_articles', JSON.stringify(articles));
}

function getImages() {
  const stored = localStorage.getItem('vandalize_images');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
}

function saveImages(images) {
  localStorage.setItem('vandalize_images', JSON.stringify(images));
}

function getSubs() {
  const stored = localStorage.getItem('vandalize_subs');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  return [];
}

function saveSubs(subs) {
  localStorage.setItem('vandalize_subs', JSON.stringify(subs));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3500);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ─── TAB NAVIGATION ─────────────────────────────────────────────────────────

function switchTab(tabId) {
  document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const section = document.getElementById('tab-' + tabId);
  if (section) section.classList.add('active');
  const navItem = document.querySelector(`[data-tab="${tabId}"]`);
  if (navItem) navItem.classList.add('active');

  // Refresh data on switch
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'articles') renderArticlesTable();
  if (tabId === 'images') renderImagesLibrary();
  if (tabId === 'subscribers') renderSubscribers();
  if (tabId === 'new-article') {
    const editing = document.getElementById('editingId').value;
    if (!editing) resetForm();
    renderCoverPicker();
  }
}

document.querySelectorAll('.admin-nav-item[data-tab]').forEach(item => {
  item.addEventListener('click', () => switchTab(item.dataset.tab));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('vandalize_admin');
  window.location.href = 'index.html';
});

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

function renderDashboard() {
  const articles = getArticles();
  const published = articles.filter(a => a.published).length;
  const drafts = articles.filter(a => !a.published).length;
  const images = getImages().length;
  const subs = getSubs().length;

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-mini"><div class="stat-mini-num">${articles.length}</div><div class="stat-mini-label">MATÉRIAS TOTAL</div></div>
    <div class="stat-mini"><div class="stat-mini-num">${published}</div><div class="stat-mini-label">PUBLICADAS</div></div>
    <div class="stat-mini"><div class="stat-mini-num">${drafts}</div><div class="stat-mini-label">RASCUNHOS</div></div>
    <div class="stat-mini"><div class="stat-mini-num">${subs}</div><div class="stat-mini-label">ASSINANTES</div></div>
  `;

  const recent = articles.slice(-5).reverse();
  document.getElementById('dashRecentBody').innerHTML = recent.map(a => articleRow(a)).join('');
}

// ─── ARTICLES TABLE ──────────────────────────────────────────────────────────

function renderArticlesTable() {
  const cat = document.getElementById('filterCat')?.value || '';
  let articles = getArticles();
  if (cat) articles = articles.filter(a => a.category === cat);
  articles = articles.slice().reverse();
  document.getElementById('articlesTableBody').innerHTML = articles.map(a => articleRow(a, true)).join('');
}

function articleRow(a, showFull = false) {
  return `
    <tr>
      <td class="table-title">${truncate(a.title, 60)}</td>
      <td><span class="table-tag">${a.categoryLabel || CATEGORIES[a.category] || a.category}</span></td>
      <td>${a.author || '—'}</td>
      <td class="${a.published ? 'status-published' : 'status-draft'}">
        <span class="status-dot">${a.published ? 'Publicada' : 'Rascunho'}</span>
      </td>
      <td>${formatDate(a.date)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" style="padding:.3rem .7rem;font-size:.75rem;" onclick="editArticle('${a.id}')">Editar</button>
          <button class="btn btn-danger" style="padding:.3rem .7rem;font-size:.75rem;" onclick="deleteArticle('${a.id}')">✕</button>
        </div>
      </td>
    </tr>
  `;
}

document.getElementById('filterCat')?.addEventListener('change', renderArticlesTable);

// ─── NEW / EDIT ARTICLE ──────────────────────────────────────────────────────

function resetForm() {
  document.getElementById('editingId').value = '';
  document.getElementById('formTitle').textContent = 'Nova Matéria';
  document.getElementById('fTitle').value = '';
  document.getElementById('fCategory').value = 'musica';
  document.getElementById('fAuthor').value = '';
  document.getElementById('fReadTime').value = '';
  document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('fExcerpt').value = '';
  document.getElementById('fImage').value = '';
  document.getElementById('fImagePreviewWrap').style.display = 'none';
  document.getElementById('fBody').innerHTML = '';
}

function editArticle(id) {
  const articles = getArticles();
  const a = articles.find(x => x.id === id);
  if (!a) return;

  switchTab('new-article');
  document.getElementById('editingId').value = id;
  document.getElementById('formTitle').textContent = 'Editar Matéria';
  document.getElementById('fTitle').value = a.title || '';
  document.getElementById('fCategory').value = a.category || 'musica';
  document.getElementById('fAuthor').value = a.author || '';
  document.getElementById('fReadTime').value = a.readTime || '';
  document.getElementById('fDate').value = a.date || '';
  document.getElementById('fExcerpt').value = a.excerpt || '';
  document.getElementById('fImage').value = a.image || '';
  document.getElementById('fBody').innerHTML = a.body || '';
  updateImagePreview(a.image);
}

function deleteArticle(id) {
  if (!confirm('Excluir esta matéria? Esta ação não pode ser desfeita.')) return;
  const articles = getArticles().filter(a => a.id !== id);
  saveArticles(articles);
  renderDashboard();
  renderArticlesTable();
  showToast('Matéria excluída.');
}

function saveArticle(publish) {
  const id = document.getElementById('editingId').value;
  const title = document.getElementById('fTitle').value.trim();
  if (!title) { showToast('Título é obrigatório.', true); return; }

  const cat = document.getElementById('fCategory').value;
  const article = {
    id: id || genId(),
    title,
    category: cat,
    categoryLabel: CATEGORIES[cat] || cat.toUpperCase(),
    author: document.getElementById('fAuthor').value.trim(),
    readTime: document.getElementById('fReadTime').value.trim() || '5 min',
    date: document.getElementById('fDate').value || new Date().toISOString().split('T')[0],
    excerpt: document.getElementById('fExcerpt').value.trim(),
    image: document.getElementById('fImage').value.trim(),
    body: document.getElementById('fBody').innerHTML,
    published: publish
  };

  const articles = getArticles();
  const existing = articles.findIndex(a => a.id === article.id);
  if (existing >= 0) {
    articles[existing] = article;
  } else {
    articles.push(article);
  }
  saveArticles(articles);

  showToast(publish ? 'Matéria publicada!' : 'Rascunho salvo!');
  setTimeout(() => switchTab('articles'), 800);
}

document.getElementById('publishBtn').addEventListener('click', () => saveArticle(true));
document.getElementById('saveDraftBtn').addEventListener('click', () => saveArticle(false));

// ─── IMAGE PREVIEW ───────────────────────────────────────────────────────────

function updateImagePreview(url) {
  const wrap = document.getElementById('fImagePreviewWrap');
  const img = document.getElementById('fImagePreview');
  if (url) {
    img.src = url;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

document.getElementById('fImage')?.addEventListener('input', e => {
  updateImagePreview(e.target.value);
});

// ─── IMAGES LIBRARY ─────────────────────────────────────────────────────────

let selectedImages = new Set();

function renderImagesLibrary() {
  const images = getImages();
  document.getElementById('imgCount').textContent = images.length;
  const grid = document.getElementById('imagesLibrary');

  if (!images.length) {
    grid.innerHTML = '<p style="color:#555;font-size:.88rem;grid-column:1/-1;">Nenhuma imagem ainda. Faça upload acima.</p>';
    return;
  }

  grid.innerHTML = images.map((img, i) => `
    <div class="image-item ${selectedImages.has(img.id) ? 'selected' : ''}"
         id="imgItem-${img.id}"
         onclick="toggleImageSelect('${img.id}')">
      <img src="${img.data}" alt="${img.name}" />
      <button class="image-item-del" onclick="event.stopPropagation();deleteImage('${img.id}')">✕</button>
    </div>
  `).join('');

  updateDeleteBtn();
}

function renderCoverPicker() {
  const images = getImages();
  const grid = document.getElementById('coverImagePicker');
  if (!images.length) {
    grid.innerHTML = '<p style="color:#555;font-size:.82rem;">Nenhuma imagem na biblioteca. Adicione na aba Imagens.</p>';
    return;
  }
  grid.innerHTML = images.map(img => `
    <div class="image-item" onclick="selectCoverImage('${img.data.replace(/'/g, "\\'")}')">
      <img src="${img.data}" alt="${img.name}" />
    </div>
  `).join('');
}

function selectCoverImage(url) {
  document.getElementById('fImage').value = url;
  updateImagePreview(url);
  showToast('Imagem de capa selecionada.');
}

function toggleImageSelect(id) {
  if (selectedImages.has(id)) {
    selectedImages.delete(id);
  } else {
    selectedImages.add(id);
  }
  const item = document.getElementById('imgItem-' + id);
  if (item) item.classList.toggle('selected', selectedImages.has(id));
  updateDeleteBtn();
}

function updateDeleteBtn() {
  const btn = document.getElementById('deleteSelectedBtn');
  btn.style.display = selectedImages.size > 0 ? 'inline-flex' : 'none';
}

document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
  if (!confirm(`Excluir ${selectedImages.size} imagem(ns)?`)) return;
  let images = getImages().filter(img => !selectedImages.has(img.id));
  saveImages(images);
  selectedImages.clear();
  renderImagesLibrary();
  showToast('Imagens excluídas.');
});

function deleteImage(id) {
  if (!confirm('Excluir esta imagem?')) return;
  let images = getImages().filter(img => img.id !== id);
  saveImages(images);
  selectedImages.delete(id);
  renderImagesLibrary();
  showToast('Imagem excluída.');
}

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

function handleFiles(files) {
  const MAX = 5 * 1024 * 1024; // 5MB
  const images = getImages();
  let uploaded = 0;

  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX) {
      showToast(`${file.name} é muito grande (máx 5MB)`, true);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      images.push({ id: genId(), name: file.name, data: e.target.result });
      uploaded++;
      if (uploaded === files.length) {
        saveImages(images);
        renderImagesLibrary();
        showToast(`${uploaded} imagem(ns) adicionada(s)!`);
      }
    };
    reader.readAsDataURL(file);
  });
}

document.getElementById('imgUpload')?.addEventListener('change', e => handleFiles(e.target.files));

// Drag and drop
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });
}

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────

function renderSubscribers() {
  const subs = getSubs();
  document.getElementById('subsCount').textContent = subs.length;
  const tbody = document.getElementById('subsTableBody');
  const empty = document.getElementById('subsEmpty');

  if (!subs.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = subs.map((email, i) => `
    <tr>
      <td style="color:#555;">${i + 1}</td>
      <td>${email}</td>
      <td>
        <button class="btn btn-danger" style="padding:.3rem .7rem;font-size:.75rem;" onclick="deleteSub('${email}')">✕ Remover</button>
      </td>
    </tr>
  `).join('');
}

function deleteSub(email) {
  const subs = getSubs().filter(e => e !== email);
  saveSubs(subs);
  renderSubscribers();
  showToast('Assinante removido.');
}

document.getElementById('exportSubsBtn')?.addEventListener('click', () => {
  const subs = getSubs();
  if (!subs.length) { showToast('Nenhum assinante para exportar.', true); return; }
  const csv = 'email\n' + subs.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vandalize-assinantes.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// ─── RICH TEXT EDITOR ────────────────────────────────────────────────────────

function execCmd(cmd, value) {
  if (cmd === 'createLink') {
    const url = prompt('URL do link:');
    if (url) document.execCommand('createLink', false, url);
  } else {
    document.execCommand(cmd, false, value || null);
  }
  document.getElementById('fBody').focus();
}

function clearFormat() {
  document.execCommand('removeFormat');
}

// ─── INIT ────────────────────────────────────────────────────────────────────

// Seed default articles if empty
(function seedDefaults() {
  if (!localStorage.getItem('vandalize_articles')) {
    const defaults = [
      {
        id: "1",
        title: "Samba-reggae 40 anos: a revolução rítmica que o mundo ainda não entendeu",
        excerpt: "Do Pelourinho para o planeta — como Olodum, Ilê Aiyê e Muzenza criaram o som mais original do século.",
        category: "musica", categoryLabel: "MÚSICA", author: "Caio Mendes",
        readTime: "8 min", date: "2026-04-05", published: true,
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        body: "<p>O samba-reggae nasceu nas ruas do Pelourinho como uma resposta cultural e política às desigualdades da Bahia dos anos 1970. Com o Ilê Aiyê como pioneiro, seguido de perto pelo Olodum e pela Muzenza, um novo ritmo emergiu das entranhas de Salvador.</p><p>Quarenta anos depois, esse ritmo ainda pulsa forte — mas seu impacto global continua subestimado. Enquanto o reggae jamaicano e o funk americano têm enciclopédias dedicadas, o samba-reggae permanece como um segredo mal guardado.</p>"
      },
      {
        id: "2",
        title: "As 3 da manhã no Pelourinho: um retrato da vida noturna pós-pandemia",
        excerpt: "Bares, becos e batucadas — o que mudou na noite do Centro Histórico e quem ficou para trás.",
        category: "noite", categoryLabel: "NOITE", author: "Luna Ferreira",
        readTime: "6 min", date: "2026-04-03", published: true,
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        body: "<p>Quando a cidade dorme, o Pelourinho acorda. Às 3 da manhã, os becos de paralelepípedo ainda vibram com batucadas improvisadas e conversas que se estendem pela madrugada.</p><p>Mas a noite do Centro Histórico não é mais a mesma. A pandemia deixou marcas profundas — bares fechados, músicos que foram embora, a renovação que não chegou para todos.</p>"
      },
      {
        id: "3",
        title: "Capoeira angola vs. regional: a guerra que ninguém quer admitir",
        excerpt: "Por trás da roda, uma disputa de décadas sobre identidade, poder e dinheiro divide mestres e comunidades.",
        category: "capoeira", categoryLabel: "CAPOEIRA", author: "Rafael Conceição",
        readTime: "10 min", date: "2026-04-01", published: true,
        image: "https://images.unsplash.com/photo-1604480132736-44e188fe7e9c?w=800&q=80",
        body: "<p>A roda de capoeira é, ao mesmo tempo, dança, luta e cerimônia. Dentro dela, dois mundos coexistem em tensão há décadas: a angola, guardiã das raízes africanas, e a regional, criada por Mestre Bimba para conquistar o Brasil moderno.</p><p>Por trás do jogo, há uma guerra real — de dinheiro, de prestígio, de quem define o que é autêntico. Esta é a história que os mestres não querem que você saiba.</p>"
      },
      {
        id: "hero-1",
        title: "O silêncio dos tambores: por que os terreiros estão perdendo espaço em Salvador",
        excerpt: "Investigação revela como a especulação imobiliária e a intolerância religiosa ameaçam casas de candomblé centenárias no coração da cidade.",
        category: "investigacao", categoryLabel: "INVESTIGAÇÃO", author: "Mariana Costa",
        readTime: "15 min", date: "2026-04-08", published: true,
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=80",
        body: "<p>Os tambores estão em silêncio. Não porque a festa acabou, mas porque os terreiros estão desaparecendo. No coração de Salvador, casas de candomblé centenárias enfrentam uma ameaça silenciosa: a especulação imobiliária aliada a décadas de intolerância religiosa.</p><p>O Vandalize passou três meses investigando o caso de sete terreiros no Centro Histórico que receberam notificações de despejo ou foram pressionados por vizinhos a reduzir os rituais. O que encontramos é uma história de resistência — e de abandono.</p>"
      }
    ];
    localStorage.setItem('vandalize_articles', JSON.stringify(defaults));
  }
})();

renderDashboard();
