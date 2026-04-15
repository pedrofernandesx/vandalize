import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function formatarData(timestamp) {
  if (!timestamp) return "—";

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

  if (isNaN(d)) return "—";

  return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function tempoLeitura(html) {
  const texto = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!texto) return "1 min de leitura";
  const palavras = texto.split(" ").length;
  const minutos = Math.ceil(palavras / 200);
  return `${minutos} min de leitura`;
}

function escaparHtml(texto = "") {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function carregarArtigos(categoriaFiltro = null) {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  container.innerHTML = `<p style="color:#888;padding:2rem">Carregando matérias...</p>`;

  try {
    let q;

    if (categoriaFiltro) {
      q = query(
        collection(db, "artigos"),
        where("publicado", "==", true),
        where("categoria", "==", categoriaFiltro),
        orderBy("data", "desc")
      );
    } else {
      q = query(
        collection(db, "artigos"),
        where("publicado", "==", true),
        orderBy("data", "desc")
      );
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:#888;padding:2rem">Nenhuma matéria encontrada.</p>`;
      return;
    }

    container.innerHTML = "";

    const artigos = snap.docs.map((doc) => doc.data());

    atualizarHero(artigos[0]);
    renderizarCards(container, artigos);
  } catch (erro) {
    console.error("Erro ao carregar artigos:", erro);
    container.innerHTML = `<p style="color:#c00;padding:2rem">Erro ao carregar artigos. Verifique o console e as regras do Firestore.</p>`;
  }
}

function atualizarHero(artigo) {
  if (!artigo) return;

  const hero = document.getElementById("hero")?.classList.add("ready");
  const heroTag = document.getElementById("heroTag");
  const heroTitle = document.getElementById("heroTitle");
  const heroSubtitle = document.getElementById("heroSubtitle");
  const heroImg = document.getElementById("heroImg");

  const slug = artigo.slug ? encodeURIComponent(artigo.slug) : null;

  if (heroTag) heroTag.textContent = (artigo.categoria || "geral").toUpperCase();
  if (heroTitle) heroTitle.textContent = artigo.titulo || "Sem título";
  if (heroSubtitle) heroSubtitle.textContent = artigo.subtitulo || "";

  if (heroImg) {
    heroImg.src = artigo.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
    heroImg.alt = artigo.titulo || "Imagem do destaque";
  }

  // 🔥 TORNA CLICÁVEL
  if (hero && slug) {
    hero.style.cursor = "pointer";
    hero.onclick = () => {
      window.location.href = `artigo.html?slug=${slug}`;
    };
  }
}

function renderizarCards(container, artigos) {
  const artigosSemHero = artigos.slice(1);

  artigosSemHero.forEach((a) => {
    if (!a.slug) {
      console.warn("Artigo sem slug ignorado:", a);
      return;
    }

    const card = document.createElement("article");
    card.className = "card";

    const titulo = escaparHtml(a.titulo || "Sem título");
    const subtitulo = escaparHtml(a.subtitulo || "");
    const categoria = escaparHtml((a.categoria || "geral").toUpperCase());
    const autor = escaparHtml(a.autor || "Redação");
    const slug = encodeURIComponent(a.slug);
    const imagem = a.imagem || "https://placehold.co/600x400/111/333?text=VANDALIZE";

    card.innerHTML = `
      <a href="artigo.html?slug=${slug}" class="card-link">
        <div class="card-img-wrap">
          <img src="${imagem}" alt="${titulo}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-tag">${categoria}</span>
          <h2 class="card-title">${titulo}</h2>
          <p class="card-excerpt">${subtitulo}</p>
          <div class="card-meta">
            <span>${autor}</span>
          </div>
        </div>
      </a>
    `;

    container.appendChild(card);
  });
}

  artigosSemHero.forEach((a) => {
    const card = document.createElement("article");
    card.className = "card";

    const titulo = escaparHtml(a.titulo || "Sem título");
    const subtitulo = escaparHtml(a.subtitulo || "");
    const categoria = escaparHtml((a.categoria || "geral").toUpperCase());
    const autor = escaparHtml(a.autor || "Redação");
const slug = a.slug ? encodeURIComponent(a.slug) : null;

if (!slug) {
  card.innerHTML = `<div class="card-body">Artigo inválido</div>`;
  return;
}
    const imagem = a.imagem || "https://placehold.co/600x400/111/333?text=VANDALIZE";

    card.innerHTML = `
      <a href="artigo.html?slug=${slug}" class="card-link">
        <div class="card-img-wrap">
          <img src="${imagem}" alt="${titulo}" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-tag">${categoria}</span>
          <h2 class="card-title">${titulo}</h2>
          <p class="card-excerpt">${subtitulo}</p>
          <div class="card-meta">
            <span>${autor}</span>
            <span>${formatarData(a.data)}</span>
            <span>${tempoLeitura(a.conteudo)}</span>
          </div>
        </div>
      </a>
    `;

    container.appendChild(card);
  });


export async function carregarArtigoBySlug() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    window.location.href = "index.html";
    return;
  }

  try {
    const q = query(
      collection(db, "artigos"),
      where("slug", "==", slug),
      where("publicado", "==", true)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      window.location.href = "index.html";
      return;
    }

    const a = snap.docs[0].data();

    document.title = `${a.titulo} — Vandalize`;

    const heroImg = document.getElementById("hero-img");
    if (heroImg) {
      heroImg.src = a.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
      heroImg.alt = a.titulo || "Capa do artigo";
    }

    const heroTag = document.getElementById("hero-tag");
    const heroTitulo = document.getElementById("hero-titulo");
    const heroSubtitulo = document.getElementById("hero-subtitulo");
    const heroAutor = document.getElementById("hero-autor");
    const heroData = document.getElementById("hero-data");
    const heroLeitura = document.getElementById("hero-leitura");
    const artigoBody = document.getElementById("artigo-body");

    if (heroTag) heroTag.textContent = (a.categoria || "GERAL").toUpperCase();
    if (heroTitulo) heroTitulo.textContent = a.titulo || "";
    if (heroSubtitulo) heroSubtitulo.textContent = a.subtitulo || "";
    if (heroAutor) heroAutor.textContent = a.autor || "Redação";
    if (heroData) heroData.textContent = formatarData(a.data);
    if (heroLeitura) heroLeitura.textContent = tempoLeitura(a.conteudo || "");
    if (artigoBody) artigoBody.innerHTML = a.conteudo || "<p>Sem conteúdo.</p>";
  } catch (erro) {
    console.error("Erro ao carregar artigo:", erro);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cardsGrid")) {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    carregarArtigos(cat);
  }

  if (document.getElementById("artigo-body")) {
    carregarArtigoBySlug();
  }
});

import { carregarArtigos } from "./app.js";