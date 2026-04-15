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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value?.trim();
    const senha = document.getElementById("senha")?.value;
    const erro = document.getElementById("login-erro");

    if (erro) erro.textContent = "";

    try {
  const cred = await signInWithEmailAndPassword(auth, email, senha);
  console.log("LOGOU:", cred.user.email);
console.log("Login OK");
window.location.href = "./painel_admin.html";
    } catch (err) {
      console.error("Erro no login:", err);
      if (erro) erro.textContent = "Email ou senha incorretos.";
    }
  });
}

// GUARD
onAuthStateChanged(auth, (user) => {
  document.body.style.display = "block";
  const path = window.location.pathname;
  const isPainel = path.includes("painel_admin.html");
  const isLogin = path.includes("login_admin.html");

  if (isPainel && !user) {
    window.location.href = "login_admin.html";
    return;
  }

  if (isLogin && user) {
    window.location.href = "./painel_admin.html";
    return;
  }

  if (isPainel && user) {
    iniciarPainel();
  }
});

// LOGOUT
const btnLogout = document.getElementById("logoutBtn");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login_admin.html";
  });
}

function gerarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

let editandoId = null;
let painelIniciado = false;

async function salvarArtigo(publicado) {
  const titulo = document.getElementById("fTitle")?.value?.trim();
  if (!titulo) {
    alert("Preencha o título.");
    return;
  }

  const artigo = {
    titulo,
    categoria: document.getElementById("fCategory")?.value?.trim() || "geral",
    autor: document.getElementById("fAuthor")?.value?.trim() || "Redação",
    subtitulo: document.getElementById("fExcerpt")?.value?.trim() || "",
    imagem: document.getElementById("fImage")?.value?.trim() || "",
    conteudo: document.getElementById("fBody")?.innerHTML || "",
    publicado,
    slug: gerarSlug(titulo),
    data: serverTimestamp()
  };

  try {
    if (editandoId) {
      await updateDoc(doc(db, "artigos", editandoId), artigo);
      alert("Artigo atualizado.");
    } else {
      await addDoc(collection(db, "artigos"), artigo);
      alert("Artigo salvo no Firebase.");
    }

    resetarFormulario();
    await listarArtigos();
  } catch (err) {
    console.error("Erro ao salvar artigo:", err);
    alert("Erro ao salvar. Veja o console.");
  }
}

async function listarArtigos() {
  const lista = document.getElementById("lista-artigos");
  if (!lista) return;

  lista.innerHTML = "<tr><td colspan='5' style='color:#888'>Carregando...</td></tr>";

  try {
    const q = query(collection(db, "artigos"), orderBy("data", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      lista.innerHTML = "<tr><td colspan='5' style='color:#888'>Nenhum artigo ainda.</td></tr>";
      return;
    }

    lista.innerHTML = "";

    snap.forEach((docSnap) => {
      const a = docSnap.data();
      const id = docSnap.id;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.titulo || "Sem título"}</td>
        <td>${a.categoria || "—"}</td>
        <td>${a.publicado ? "✅ Publicado" : "🔒 Rascunho"}</td>
        <td><a href="../artigo.html?slug=${a.slug}" target="_blank">Ver →</a></td>
        <td>
          <button onclick="editarArtigo('${id}')">✏️ Editar</button>
          <button onclick="deletarArtigo('${id}')" style="color:red">🗑️ Excluir</button>
        </td>
      `;
      lista.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao listar artigos:", err);
    lista.innerHTML = "<tr><td colspan='5' style='color:red'>Erro ao carregar.</td></tr>";
  }
}

window.editarArtigo = async (id) => {
  try {
    const docRef = doc(db, "artigos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const a = docSnap.data();
    editandoId = id;

    document.getElementById("fTitle").value = a.titulo || "";
    document.getElementById("fCategory").value = a.categoria || "geral";
    document.getElementById("fAuthor").value = a.autor || "";
    document.getElementById("fExcerpt").value = a.subtitulo || "";
    document.getElementById("fImage").value = a.imagem || "";
    document.getElementById("fBody").innerHTML = a.conteudo || "";

    document.getElementById("form-artigo")?.scrollIntoView({ behavior: "smooth" });

    const label = document.getElementById("form-titulo-label");
    if (label) label.textContent = "✏️ Editando artigo";
  } catch (err) {
    console.error("Erro ao editar artigo:", err);
  }
};

window.deletarArtigo = async (id) => {
  if (!confirm("Tem certeza que quer excluir este artigo?")) return;

  try {
    await deleteDoc(doc(db, "artigos", id));
    await listarArtigos();
  } catch (err) {
    console.error("Erro ao excluir artigo:", err);
    alert("Erro ao excluir.");
  }
};

function resetarFormulario() {
  editandoId = null;

  document.getElementById("fTitle").value = "";
  document.getElementById("fCategory").value = "geral";
  document.getElementById("fAuthor").value = "";
  document.getElementById("fExcerpt").value = "";
  document.getElementById("fImage").value = "";
  document.getElementById("fBody").innerHTML = "";

  const label = document.getElementById("form-titulo-label");
  if (label) label.textContent = "Novo artigo";
}

function iniciarPainel() {
  if (painelIniciado) return;
  painelIniciado = true;

  listarArtigos();

  document.getElementById("btn-publicar")?.addEventListener("click", () => salvarArtigo(true));
  document.getElementById("btn-rascunho")?.addEventListener("click", () => salvarArtigo(false));
  document.getElementById("btn-cancelar")?.addEventListener("click", resetarFormulario);
}

window.formatar = (cmd, value = null) => {
  document.execCommand(cmd, false, value);
};