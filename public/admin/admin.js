// public/admin/admin.js
import { db, auth } from "../src/firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ─── GUARD DE AUTENTICAÇÃO ────────────────────────────────────────────────────
// Mantém o body oculto até confirmar sessão (evita flash de conteúdo protegido)
document.body.style.display = "none";

onAuthStateChanged(auth, (user) => {
  document.body.style.display = "block";
  const path      = window.location.pathname;
  const isPainel  = path.includes("painel_admin.html");
  const isLogin   = path.includes("login_admin.html");

  if (isPainel && !user) { window.location.href = "login_admin.html"; return; }
  if (isLogin  &&  user) { window.location.href = "painel_admin.html"; return; }
  if (isPainel &&  user) iniciarPainel();
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email")?.value?.trim();
    const senha = document.getElementById("senha")?.value;
    const erro  = document.getElementById("login-erro");
    if (erro) erro.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = "painel_admin.html";
    } catch (err) {
      console.error("Erro no login:", err);
      if (erro) erro.textContent = "E-mail ou senha incorretos.";
    }
  });
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const btnLogout = document.getElementById("logoutBtn");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login_admin.html";
  });
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function gerarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function formatarData(ts) {
  if (!ts) return "—";
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2,"0")} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── PAINEL DE CONTROLE (CRUD) ────────────────────────────────────────────────
async function iniciarPainel() {
  const formArtigo = document.getElementById("artigo-form");
  const listaArtigos = document.getElementById("lista-artigos");

  if (!listaArtigos) return;

  // LISTAR ARTIGOS EM TEMPO REAL
  const q = query(collection(db, "artigos"), orderBy("data", "desc"));
  
  onSnapshot(q, (snapshot) => {
    listaArtigos.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const art = docSnap.data();
      const id = docSnap.id;
      
      listaArtigos.innerHTML += `
        <div class="artigo-item" style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
          <h3>${art.titulo}</h3>
          <p>Data: ${formatarData(art.data)} | Status: ${art.publicado ? 'Publicado' : 'Rascunho'}</p>
          <button onclick="deletarArtigo('${id}')">Excluir</button>
        </div>
      `;
    });
  });

  // CRIAR NOVO ARTIGO
  if (formArtigo) {
    formArtigo.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titulo = document.getElementById("titulo").value;
      const conteudo = document.getElementById("conteudo").value; // Se usar editor rico, pegue o HTML aqui

      try {
        await addDoc(collection(db, "artigos"), {
          titulo: titulo,
          conteudo: conteudo,
          slug: gerarSlug(titulo),
          publicado: true,
          data: serverTimestamp(),
          imagem: "https://placeholder.co/600x400" // Valor padrão inicial
        });
        formArtigo.reset();
        alert("Artigo publicado com sucesso!");
      } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro de permissão ou conexão. Verifique o console.");
      }
    });
  }
}

// Expõe a função de deletar para o escopo global (necessário para o onclick no HTML)
window.deletarArtigo = async (id) => {
  if (confirm("Deseja realmente excluir este artigo?")) {
    try {
      await deleteDoc(doc(db, "artigos", id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  }
};