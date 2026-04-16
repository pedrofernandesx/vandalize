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
    const artigosRef = collection(db, "artigos");
    let q;

    if (categoriaFiltro) {
      q = query(artigosRef,
        where("publicado", "==", true),
        where("categoria", "==", categoriaFiltro),
        orderBy("criadoEm", "desc")
      );
    } else {
      q = query(artigosRef,
  where("publicado", "==", true),
  orderBy("criadoEm", "desc")
);
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:#888;padding:2rem 0">Nenhuma matéria encontrada.</p>`;
      return;
    }

    const artigos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    atualizarHero(artigos[0]);

    container.innerHTML = "";
    artigos.slice(1).forEach(a => {
      if (!a.slug) return;
      container.appendChild(criarCard(a));
    });

  } catch (erro) {
    console.error("Erro ao carregar artigos:", erro);
    container.innerHTML = `<p style="color:#c00;padding:2rem 0">Erro ao carregar artigos. Verifique o console.</p>`;
  }
}

function atualizarHero(artigo) {
  if (!artigo) return;
  
  const heroEl = document.getElementById("hero");
  if (heroEl) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("heroTag", (artigo.categoria || "geral").toUpperCase());
    set("heroTitle", artigo.titulo || "Sem título");
    set("heroSubtitle", artigo.resumo || "");
    const img = document.getElementById("heroImg");
    if (img) img.src = artigo.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
    
    heroEl.style.cursor = "pointer";
    heroEl.onclick = () => { window.location.href = `artigo.html?slug=${encodeURIComponent(artigo.slug)}`; };
  }
}

function criarCard(a) {
  const card = document.createElement("article");
  card.className = "card";
  const slug = encodeURIComponent(a.slug);
  card.innerHTML = `
    <a href="artigo.html?slug=${slug}" class="card-link">
      <div class="card-img-wrap">
        <img src="${a.imagem || 'https://placehold.co/600x400/111/333?text=VANDALIZE'}" alt="${escapar(a.titulo)}">
        <span class="card-tag">${escapar((a.categoria || "geral").toUpperCase())}</span>
      </div>
      <div class="card-body">
        <h2 class="card-title">${escapar(a.titulo)}</h2>
        <p class="card-excerpt">${escapar(a.resumo)}</p>
        <div class="card-meta">
          <span>${escapar(a.autor || "Redação")}</span>
          <span class="dot">·</span>
          <span>${formatarData(a.data || a.criadoEm)}</span>
        </div>
      </div>
    </a>
  `;
  return card;
}


// ─── ARTIGO: CARREGAR POR SLUG ────────────────────────────────────────────────
export async function carregarArtigoBySlug() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  
  // Se não houver slug, volta para a index imediatamente
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

    // Função auxiliar para preencher texto
    const set = (id, value) => { 
      const el = document.getElementById(id); 
      if (el) el.textContent = value; 
    };

    // 1. CARREGAR A IMAGEM (O ID deve ser heroImg no HTML)
    const heroImg = document.getElementById("heroImg");
    if (heroImg) {
      heroImg.src = a.imagem || "https://placehold.co/1200x700/111/333?text=VANDALIZE";
    }

    // 2. PREENCHER OS CAMPOS (Consistência com o Banco)
    set("hero-tag", (a.categoria || "GERAL").toUpperCase());
    set("hero-titulo", a.titulo || "");
    set("hero-resumo", a.resumo || a.subtitulo || ""); // Puxa resumo ou subtitulo
    set("hero-autor", a.autor || "Redação");
    set("hero-data", formatarData(a.data || a.criadoEm));
    set("hero-leitura", tempoLeitura(a.conteudo || ""));

    // 3. RENDERIZAR O CORPO
    const body = document.getElementById("artigo-body");
    if (body) {
      body.innerHTML = a.conteudo || "<p>Sem conteúdo.</p>";
    }

  } catch (erro) {
    console.error("Erro ao carregar artigo:", erro);
  }
}

async function carregarHeroUltimoPost() {
  const heroEl = document.getElementById("hero");
  if (!heroEl) return;

  try {
    const q = query(
      collection(db, "artigos"),
      where("publicado", "==", true),
      orderBy("criadoEm", "desc")
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    const artigo = snap.docs[0].data();

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set("heroTag", (artigo.categoria || "geral").toUpperCase());
    set("heroTitle", artigo.titulo || "");
    set("heroSubtitle", artigo.resumo || "");

    const img = document.getElementById("heroImg");
    if (img) {
      img.src = artigo.imagem || "https://placehold.co/1200x700";
    }

    heroEl.onclick = () => {
      window.location.href = `artigo.html?slug=${artigo.slug}`;
    };

  } catch (e) {
    console.error("Erro ao carregar HERO:", e);
  }
}




// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

async function cadastrarNewsletter() {
  const input = document.getElementById("nlEmail");
  const btn = document.getElementById("nlBtn");
  if (!input || !btn) return;
  const email = input.value.trim();
  if (!email || !email.includes("@")) return;

  btn.disabled = true;
  try {
    await addDoc(collection(db, "newsletter"), { email, data: serverTimestamp() });
    input.value = "";
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = "→"; btn.disabled = false; }, 3000);
  } catch (err) {
    console.error(err);
    btn.disabled = false;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cardsGrid")) {
    const cat = new URLSearchParams(window.location.search).get("cat");
    carregarArtigos(cat);
  }

  if (document.getElementById("artigo-body")) {
    carregarArtigoBySlug();

    // 🔥 ADICIONA ISSO AQUI
    carregarHeroUltimoPost();
  }

  const nlBtn = document.getElementById("nlBtn");
  if (nlBtn) nlBtn.addEventListener("click", cadastrarNewsletter);
});