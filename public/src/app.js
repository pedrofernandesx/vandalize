// public/src/app.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ─── UTILS ───────────────────────────────────────────────────────────────────

function formatarData(timestamp) {
  if (!timestamp) return "—";
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2,"0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function tempoLeitura(html) {
  const texto = (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!texto) return "1 min de leitura";
  const palavras = texto.split(" ").length;
  return `${Math.ceil(palavras / 200)} min de leitura`;
}

function escapar(texto = "") {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ─── INDEX: CARREGAR CARDS ────────────────────────────────────────────────────

export async function carregarArtigos(categoriaFiltro = null) {
  const container = document.getElementById("cardsGrid");
  if (!container) return;

  container.innerHTML = `<p style="color:#888;padding:2rem 0">Carregando matérias...</p>`;

  try {
    let q;
    const col = collection(db, "artigos");

    if (categoriaFiltro) {
      q = query(col,
        where("publicado", "==", true),
        where("categoria", "==", categoriaFiltro),
        orderBy("data", "desc")
      );
    } else {
      q = query(col,
        where("publicado", "==", true),
        orderBy("data", "desc")
      );
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:#888;padding:2rem 0">Nenhuma matéria encontrada.</p>`;
      return;
    }

    const artigos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Primeiro artigo vira o hero
    atualizarHero(artigos[0]);

    // Restantes viram cards
    container.innerHTML = "";
    artigos.slice(1).forEach(a => {
      if (!a.slug) return;
      container.appendChild(criarCard(a));
    });

  } catch (erro) {
    console.error("Erro ao carregar artigos:", erro);
    container.innerHTML = `<p style="color:#c00;padding:2rem 0">
      Erro ao carregar artigos. Verifique as regras do Firestore e os índices necessários.
    </p>`;
  }
}

function atualizarHero(artigo) {
  if (!artigo) return;

  const heroEl      = document.getElementById("hero");
  const heroTag     = document.getElementById("heroTag");
  const heroTitle   = document.getElementById("heroTitle");
  const heroSub     = document.getElementById("heroSubtitle");
  const heroImg     = document.getElementById("heroImg");

  if (heroTag)   heroTag.textContent   = (artigo.categoria || "geral").toUpperCase();
  if (heroTitle) heroTitle.textContent = artigo.titulo    || "Sem título";
  if (heroSub)   heroSub.textContent   = artigo.subtitulo || "";

  if (heroImg) {
    heroImg.src = artigo.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
    heroImg.alt = artigo.titulo || "Destaque";
  }

  if (heroEl && artigo.slug) {
    heroEl.classList.add("ready");
    heroEl.style.cursor = "pointer";
    heroEl.onclick = () => {
      window.location.href = `artigo.html?slug=${encodeURIComponent(artigo.slug)}`;
    };
  }
}

function criarCard(a) {
  const card = document.createElement("article");
  card.className = "card";

  const titulo    = escapar(a.titulo    || "Sem título");
  const subtitulo = escapar(a.subtitulo || "");
  const categoria = escapar((a.categoria || "geral").toUpperCase());
  const autor     = escapar(a.autor     || "Redação");
  const slug      = encodeURIComponent(a.slug);
  const imagem    = a.imagem || "https://placehold.co/600x400/111/333?text=VANDALIZE";

  card.innerHTML = `
    <a href="artigo.html?slug=${slug}" class="card-link">
      <div class="card-img-wrap">
        <img src="${imagem}" alt="${titulo}" loading="lazy">
        <span class="card-tag">${categoria}</span>
      </div>
      <div class="card-body">
        <h2 class="card-title">${titulo}</h2>
        <p class="card-excerpt">${subtitulo}</p>
        <div class="card-meta">
          <span>${autor}</span>
          <span class="dot">·</span>
          <span>${formatarData(a.data)}</span>
          <span class="dot">·</span>
          <span>${tempoLeitura(a.conteudo)}</span>
        </div>
      </div>
    </a>
  `;

  return card;
}

// ─── ARTIGO: CARREGAR POR SLUG ────────────────────────────────────────────────

export async function carregarArtigoBySlug() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get("slug");

  if (!slug) { window.location.href = "index.html"; return; }

  try {
    const q    = query(
      collection(db, "artigos"),
      where("slug",      "==", slug),
      where("publicado", "==", true)
    );
    const snap = await getDocs(q);

    if (snap.empty) { window.location.href = "index.html"; return; }

    const a = snap.docs[0].data();

    document.title = `${a.titulo} — Vandalize`;

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    const heroImg = document.getElementById("hero-img");
    if (heroImg) {
      heroImg.src = a.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
      heroImg.alt = a.titulo || "";
    }

    set("hero-tag",      (a.categoria || "GERAL").toUpperCase());
    set("hero-titulo",    a.titulo    || "");
    set("hero-subtitulo", a.subtitulo || "");
    set("hero-autor",     a.autor     || "Redação");
    set("hero-data",      formatarData(a.data));
    set("hero-leitura",   tempoLeitura(a.conteudo || ""));

    const body = document.getElementById("artigo-body");
    if (body) body.innerHTML = a.conteudo || "<p>Sem conteúdo.</p>";

  } catch (erro) {
    console.error("Erro ao carregar artigo:", erro);
  }
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

async function cadastrarNewsletter() {
  const input = document.getElementById("nlEmail");
  const btn   = document.getElementById("nlBtn");
  if (!input || !btn) return;

  const email = input.value.trim();
  if (!email || !email.includes("@")) {
    input.style.borderColor = "#E03C2C";
    setTimeout(() => input.style.borderColor = "", 2000);
    return;
  }

  btn.textContent = "...";
  btn.disabled    = true;

  try {
    await addDoc(collection(db, "newsletter"), {
      email,
      data: serverTimestamp()
    });
    input.value         = "";
    btn.textContent     = "✓";
    btn.style.background = "#4caf50";
    setTimeout(() => {
      btn.textContent      = "→";
      btn.style.background = "";
      btn.disabled         = false;
    }, 3000);
  } catch (err) {
    console.error("Erro newsletter:", err);
    btn.textContent = "→";
    btn.disabled    = false;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Index — carregar grid
  if (document.getElementById("cardsGrid")) {
    const cat = new URLSearchParams(window.location.search).get("cat");
    carregarArtigos(cat);
  }

  // Artigo — carregar por slug
  if (document.getElementById("artigo-body")) {
    carregarArtigoBySlug();
  }

  // Newsletter
  const nlBtn = document.getElementById("nlBtn");
  if (nlBtn) nlBtn.addEventListener("click", cadastrarNewsletter);

  const nlInput = document.getElementById("nlEmail");
  if (nlInput) {
    nlInput.addEventListener("keydown", e => {
      if (e.key === "Enter") cadastrarNewsletter();
    });
  }

  // Nav hamburguer
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
});
