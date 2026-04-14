// ─── DATA LAYER ─────────────────────────────────────────────────────────────

const DEFAULT_ARTICLES = [
  {
    id: "hero-1",
    title: "O silêncio dos tambores: por que os terreiros estão perdendo espaço em Salvador",
    excerpt: "Investigação revela como a especulação imobiliária e a intolerância religiosa ameaçam casas de candomblé centenárias no coração da cidade.",
    category: "investigacao",
    categoryLabel: "INVESTIGAÇÃO",
    author: "Mariana Costa",
    readTime: "15 min",
    date: "2026-04-08",
    published: true,
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=80",
    body: "<p>No Engenho Velho da Federação, um dos bairros mais tradicionais de Salvador, o som dos atabaques que por décadas guiou cerimônias de candomblé está cada vez mais raro. A Casa de Oxumarê, fundada em 1826, enfrenta hoje uma realidade que seria impensável para seus fundadores: notificações de despejo e processos judiciais movidos por moradores que se instalaram décadas depois ao redor do terreiro.</p><p>O Vandalize passou três meses investigando o caso de sete terreiros no Centro Histórico que receberam notificações de despejo ou foram pressionados por vizinhos a reduzir os rituais. O que encontramos é uma história de resistência — e de abandono por parte do poder público.</p><h2>A especulação que cala os tambores</h2><p>Com a valorização imobiliária do entorno do Dique do Tororó e do Corredor da Vitória, terreiros que antes estavam em regiões periféricas agora se encontram cercados por condomínios de alto padrão. O choque é inevitável — e, segundo advogados especializados em direito religioso, sistematicamente desfavorável às religiões de matriz africana.</p><p>\"Há uma assimetria de poder brutal\", explica a advogada Dandara Nascimento, que representa quatro dos sete terreiros investigados. \"O empreendimento imobiliário chega depois, mas consegue impor sua lógica como se o terreiro fosse o invasor.\"</p><h2>O que diz a lei</h2><p>A Constituição Federal de 1988 garante a liberdade religiosa e o direito ao livre exercício dos cultos. O Estatuto da Igualdade Racial, de 2010, reconhece as comunidades de terreiro como patrimônio cultural brasileiro. No entanto, na prática, esses dispositivos raramente são invocados com sucesso nos tribunais da Bahia.</p><p>Dos sete casos investigados pelo Vandalize, apenas um terreiro conseguiu uma decisão favorável definitiva. Três ainda aguardam julgamento. Dois fecharam as portas.</p>"
  },
  {
    id: "1",
    title: "Samba-reggae 40 anos: a revolução rítmica que o mundo ainda não entendeu",
    excerpt: "Do Pelourinho para o planeta — como Olodum, Ilê Aiyê e Muzenza criaram o som mais original do século.",
    category: "musica",
    categoryLabel: "MÚSICA",
    author: "Caio Mendes",
    readTime: "8 min",
    date: "2026-04-05",
    published: true,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    body: "<p>O samba-reggae nasceu nas ruas do Pelourinho como uma resposta cultural e política às desigualdades da Bahia dos anos 1970. Com o Ilê Aiyê como pioneiro, seguido de perto pelo Olodum e pela Muzenza, um novo ritmo emergiu das entranhas de Salvador.</p><p>Quarenta anos depois, esse ritmo ainda pulsa forte — mas seu impacto global continua subestimado. Enquanto o reggae jamaicano e o funk americano têm enciclopédias dedicadas, o samba-reggae permanece como um segredo mal guardado.</p><h2>O nascimento de um ritmo</h2><p>Tudo começou com uma pergunta simples, porém subversiva para a época: por que o carnaval de Salvador precisava imitar o Rio de Janeiro? Foi essa inquietação que levou um grupo de jovens do bairro da Liberdade a criar o Ilê Aiyê em 1974 — o primeiro bloco afro do Brasil, exclusivamente para pessoas negras.</p><p>A sonoridade que emergiu dali era diferente de tudo que existia. Batidas de surdos e repiniques misturadas com influências do reggae jamaicano que chegava pelo rádio. Uma síncopa que não era samba, não era reggae, era algo completamente novo.</p>"
  },
  {
    id: "2",
    title: "As 3 da manhã no Pelourinho: um retrato da vida noturna pós-pandemia",
    excerpt: "Bares, becos e batucadas — o que mudou na noite do Centro Histórico e quem ficou para trás.",
    category: "noite",
    categoryLabel: "NOITE",
    author: "Luna Ferreira",
    readTime: "6 min",
    date: "2026-04-03",
    published: true,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    body: "<p>Quando a cidade dorme, o Pelourinho acorda. Às 3 da manhã, os becos de paralelepípedo ainda vibram com batucadas improvisadas e conversas que se estendem pela madrugada.</p><p>Mas a noite do Centro Histórico não é mais a mesma. A pandemia deixou marcas profundas — bares fechados, músicos que foram embora, a renovação que não chegou para todos.</p><h2>Os que ficaram</h2><p>Entre os que resistiram está Seu Valdecir, 67 anos, dono do Bar do Careca há mais de três décadas. \"Fechei por oito meses durante a pandemia. Quando reabri, metade dos meus clientes tinham se mudado ou morrido\", conta ele, sem dramatismo, servindo uma gelada às 2h40 da madrugada.</p><p>A clientela mudou. Hoje mistura turistas com moradores antigos, artistas com trabalhadores da construção civil que reformam os sobrados coloniais. Uma convivência às vezes tensa, às vezes frutífera.</p>"
  },
  {
    id: "3",
    title: "Capoeira angola vs. regional: a guerra que ninguém quer admitir",
    excerpt: "Por trás da roda, uma disputa de décadas sobre identidade, poder e dinheiro divide mestres e comunidades.",
    category: "capoeira",
    categoryLabel: "CAPOEIRA",
    author: "Rafael Conceição",
    readTime: "10 min",
    date: "2026-04-01",
    published: true,
    image: "https://images.unsplash.com/photo-1604480132736-44e188fe7e9c?w=800&q=80",
    body: "<p>A roda de capoeira é, ao mesmo tempo, dança, luta e cerimônia. Dentro dela, dois mundos coexistem em tensão há décadas: a angola, guardiã das raízes africanas, e a regional, criada por Mestre Bimba para conquistar o Brasil moderno.</p><p>Por trás do jogo, há uma guerra real — de dinheiro, de prestígio, de quem define o que é autêntico. Esta é a história que os mestres não querem que você saiba.</p><h2>Raízes do conflito</h2><p>Mestre Bimba criou a Capoeira Regional na década de 1930 com um objetivo declarado: tornar a capoeira aceitável para a classe média brasileira. Sistematizou os movimentos, criou uma graduação por cordas coloridas, abriu a primeira academia oficial.</p><p>Os angola-capoeiristas nunca perdoaram. Para eles, Bimba havia vendido a alma da luta — transformado uma arte de resistência negra em produto para consumo das elites.</p>"
  },
  {
    id: "4",
    title: "Carnaval 2026: os bastidores que a Globo não mostrou",
    excerpt: "Acordos políticos, patrocínios polêmicos e a luta das bandas independentes por espaço no Circuito.",
    category: "carnaval",
    categoryLabel: "CARNAVAL",
    author: "Mariana Costa",
    readTime: "12 min",
    date: "2026-03-20",
    published: true,
    image: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
    body: "<p>Por trás dos trios elétricos e da alegria que contagia o mundo, existe uma batalha invisível pelo espaço, pelo dinheiro e pela narrativa do maior carnaval do planeta.</p><p>O Vandalize teve acesso a documentos internos da Empresa Salvador Turismo (Saltur) que revelam como são distribuídas as posições no Circuito Osmar — e por que certas bandas independentes nunca conseguem horário nobre, não importa quantas vezes tentem.</p><h2>O mapa dos horários</h2><p>O horário nobre do Circuito Osmar vai das 18h às 23h. Nessa janela, passam os trios que serão transmitidos pela televisão aberta e pelos principais canais de streaming. Os patrocínios valem o dobro. A visibilidade é incomparável.</p><p>Dos doze trios que ocuparam esse horário no Carnaval 2026, onze tinham contratos de patrocínio com empresas que também são patrocinadoras da Saltur. O décimo segundo era o trio oficial da Prefeitura.</p>"
  }
];

function getArticles() {
  const stored = localStorage.getItem('vandalize_articles');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  localStorage.setItem('vandalize_articles', JSON.stringify(DEFAULT_ARTICLES));
  return DEFAULT_ARTICLES;
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function loadHero() {
  const articles = getArticles().filter(a => a.published);
  if (!articles.length) return;

  const featured = articles.find(a => a.category === 'investigacao') || articles[0];

  const heroImg      = document.getElementById('heroImg');
  const heroTag      = document.getElementById('heroTag');
  const heroTitle    = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');

  if (heroImg && featured.image) heroImg.src = featured.image;
  if (heroTag)  heroTag.textContent = featured.categoryLabel;
  if (heroTitle) {
    heroTitle.textContent = featured.title;
    heroTitle.style.cursor = 'pointer';
    heroTitle.onclick = () => window.location.href = `artigo.html?id=${featured.id}`;
  }
  if (heroSubtitle) heroSubtitle.textContent = featured.excerpt;
}

// ─── CARDS ───────────────────────────────────────────────────────────────────

function renderCards(articles, containerId = 'cardsGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  if (!articles.length) {
    grid.innerHTML = '<p style="color:#999;grid-column:1/-1;padding:2rem 0;">Nenhuma matéria encontrada.</p>';
    return;
  }

  grid.innerHTML = articles.map(a => `
    <article class="card" onclick="window.location.href='artigo.html?id=${a.id}'">
      <div class="card-img-wrap">
        <img src="${a.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'}"
             alt="${a.title}" loading="lazy" />
        <span class="card-tag">${a.categoryLabel}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${truncate(a.title, 80)}</h3>
        <p class="card-excerpt">${truncate(a.excerpt, 120)}</p>
        <div class="card-meta">
          <span>${a.author}</span>
          <span class="dot">•</span>
          <span>⏱ ${a.readTime}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function loadCards() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');

  const CAT_LABELS = {
    musica: 'MÚSICA', carnaval: 'CARNAVAL', capoeira: 'CAPOEIRA',
    noite: 'NOITE', investigacao: 'INVESTIGAÇÃO'
  };

  let articles = getArticles().filter(a => a.published);

  if (cat) {
    articles = articles.filter(a => a.category === cat);
    const label = document.getElementById('sectionCatLabel');
    const title = document.getElementById('sectionCatTitle');
    if (label) label.textContent = CAT_LABELS[cat] || cat.toUpperCase();
    if (title) title.textContent = `Tudo sobre ${CAT_LABELS[cat] || cat}`;
  } else {
    articles = articles.slice(0, 3);
  }

  renderCards(articles, 'cardsGrid');
}

// ─── ARTICLE PAGE ─────────────────────────────────────────────────────────────

function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const articles = getArticles();
  const article = articles.find(a => a.id === id);
  if (!article) return;

  document.title = `${article.title} — Vandalize`;

  const imgEl     = document.getElementById('articleImg');
  const tagEl     = document.getElementById('articleTag');
  const titleEl   = document.getElementById('articleTitle');
  const excerptEl = document.getElementById('articleExcerpt');
  const bylineEl  = document.getElementById('articleByline');
  const bodyEl    = document.getElementById('articleBody');

  if (imgEl && article.image) imgEl.src = article.image;
  if (tagEl)     tagEl.textContent = article.categoryLabel || article.category;
  if (titleEl)   titleEl.textContent = article.title;
  if (excerptEl) excerptEl.textContent = article.excerpt || '';

  if (bylineEl) {
    bylineEl.innerHTML = `
      <strong>${article.author || ''}</strong>
      ${article.author ? '<span class="byline-sep">|</span>' : ''}
      <span>📅 ${formatDate(article.date)}</span>
      ${article.readTime ? '<span class="byline-sep">|</span><span>⏱ ' + article.readTime + ' de leitura</span>' : ''}
    `;
  }

  if (bodyEl) bodyEl.innerHTML = article.body || `<p>${article.excerpt}</p>`;

  // Artigos relacionados
  const relacionados = articles
    .filter(a => a.published && a.id !== id && a.category === article.category)
    .slice(0, 3);

  const section = document.getElementById('relacionadosSection');
  if (section && relacionados.length) {
    section.style.display = 'block';
    renderCards(relacionados, 'relacionadosGrid');
  }
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

function setupNewsletter() {
  const btn   = document.getElementById('nlBtn');
  const input = document.getElementById('nlEmail');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      showToast('Digite um e-mail válido.', true);
      return;
    }
    const subs = JSON.parse(localStorage.getItem('vandalize_subs') || '[]');
    if (subs.includes(email)) {
      showToast('Você já está cadastrado!');
      return;
    }
    subs.push(email);
    localStorage.setItem('vandalize_subs', JSON.stringify(subs));
    input.value = '';
    showToast('Cadastro realizado! Bem-vindo(a) ao Vandalize.');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
}

// ─── MENU MOBILE ─────────────────────────────────────────────────────────────

function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });

  // Fecha ao clicar em link
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showToast(msg, isError = false) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadHero();
  loadCards();
  loadArticle();
  setupNewsletter();
  setupMobileMenu();
});
