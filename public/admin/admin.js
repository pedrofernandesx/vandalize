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

const categoryLabels = {
  musica: "Música", carnaval: "Carnaval", capoeira: "Capoeira",
  noite: "Noite", investigacao: "Investigação"
};

function showToast(msg, tipo = "ok") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = `toast show${tipo === "error" ? " error" : ""}`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
window.switchTab = function(tabName) {
  document.querySelectorAll(".panel-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".admin-nav-item[data-tab]").forEach(i => i.classList.remove("active"));

  const sec = document.getElementById("tab-" + tabName);
  const nav = document.querySelector(`.admin-nav-item[data-tab="${tabName}"]`);
  if (sec) sec.classList.add("active");
  if (nav) nav.classList.add("active");

  if (tabName === "articles")    carregarArtigos();
  if (tabName === "subscribers") carregarAssinantes();
  if (tabName === "images")      renderImages();
};

document.querySelectorAll(".admin-nav-item[data-tab]").forEach(item => {
  item.addEventListener("click", () => switchTab(item.dataset.tab));
});

// ─── PAINEL PRINCIPAL ─────────────────────────────────────────────────────────
let painelIniciado = false;

function iniciarPainel() {
  if (painelIniciado) return;
  painelIniciado = true;

  // Botões do formulário
  document.getElementById("publishBtn")?.addEventListener("click",   () => salvarArtigo(true));
  document.getElementById("saveDraftBtn")?.addEventListener("click", () => salvarArtigo(false));

  // Preview da imagem de capa
  document.getElementById("fImage")?.addEventListener("input", atualizarPreviewCapa);

  // Filtro de categoria na aba Matérias
  document.getElementById("filterCat")?.addEventListener("change", carregarArtigos);

  // Upload de imagens
  const imgUpload = document.getElementById("imgUpload");
  const dropZone  = document.getElementById("dropZone");

  if (imgUpload) {
    imgUpload.addEventListener("change", e => {
      handleImageUpload(e.target.files);
      e.target.value = "";
    });
  }

  if (dropZone) {
    ["dragenter","dragover"].forEach(evt =>
      dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.add("dragover"); })
    );
    ["dragleave","drop"].forEach(evt =>
      dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.classList.remove("dragover"); })
    );
    dropZone.addEventListener("drop", e => handleImageUpload(e.dataTransfer.files));
  }

  // Exportar assinantes
  document.getElementById("exportSubsBtn")?.addEventListener("click", exportarCSV);

  // Inicializa dashboard
  carregarDashboard();
  iniciarContadorAssinantes();
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
async function carregarDashboard() {
  try {
    const [artigosSnap, imgsSnap] = await Promise.all([
      getDocs(collection(db, "artigos")),
      getDocs(collection(db, "imagens"))
    ]);

    let publicados = 0, rascunhos = 0;
    artigosSnap.forEach(d => d.data().publicado ? publicados++ : rascunhos++);

    document.getElementById("statPublished").textContent = publicados;
    document.getElementById("statDrafts").textContent    = rascunhos;
    document.getElementById("statImages").textContent    = imgsSnap.size;

    // Tabela de recentes
    const tbody   = document.getElementById("dashRecentBody");
    const artigos = artigosSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))
      .slice(0, 6);

    if (!artigos.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:#888;padding:1rem">Nenhuma matéria ainda.</td></tr>`;
      return;
    }

    tbody.innerHTML = artigos.map(a => `
      <tr>
        <td class="table-title">${a.titulo || "Sem título"}</td>
        <td>${categoryLabels[a.categoria] || a.categoria || "—"}</td>
        <td>${a.autor || "—"}</td>
        <td><span class="status-dot ${a.publicado ? "status-published" : "status-draft"}">
          ${a.publicado ? "Publicado" : "Rascunho"}
        </span></td>
        <td>${formatarData(a.data)}</td>
        <td><button class="btn btn-secondary" style="padding:.4rem .8rem;font-size:.78rem"
            onclick="editarArtigo('${a.id}')">Editar</button></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Erro dashboard:", err);
  }
}

// ─── CONTATOR DE ASSINANTES EM TEMPO REAL ────────────────────────────────────
function iniciarContadorAssinantes() {
  const col = collection(db, "newsletter");
  onSnapshot(col, snap => {
    const total = snap.size;
    ["subsLiveCount","subsCount","subsHeaderLive","subsPageLive"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = total;
    });
  });
}

// ─── ARTIGOS — LISTAGEM ───────────────────────────────────────────────────────
async function carregarArtigos() {
  const tbody  = document.getElementById("articlesTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="color:#888;padding:1rem">Carregando...</td></tr>`;

  const filtro = document.getElementById("filterCat")?.value || "";

  try {
    const q    = query(collection(db, "artigos"), orderBy("criadoEm", "desc"));
    const snap = await getDocs(q);

    let artigos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (filtro) artigos = artigos.filter(a => a.categoria === filtro);

    if (!artigos.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:#888;padding:1rem">Nenhuma matéria encontrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = artigos.map(a => `
      <tr>
        <td class="table-title">${a.titulo || "Sem título"}</td>
        <td><span class="table-tag">${(a.categoria || "—").toUpperCase()}</span></td>
        <td>${a.autor || "—"}</td>
        <td><span class="status-dot ${a.publicado ? "status-published" : "status-draft"}">
          ${a.publicado ? "Publicado" : "Rascunho"}
        </span></td>
        <td>${formatarData(a.data)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary" style="padding:.4rem .8rem;font-size:.78rem"
                onclick="editarArtigo('${a.id}')">✏️ Editar</button>
            <button class="btn btn-danger" style="padding:.4rem .8rem;font-size:.78rem"
                onclick="deletarArtigo('${a.id}')">🗑️ Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Erro ao listar artigos:", err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:red;padding:1rem">Erro ao carregar.</td></tr>`;
  }
}

// ─── ARTIGOS — SALVAR ─────────────────────────────────────────────────────────
async function salvarArtigo(publicado) {
  const titulo = document.getElementById("fTitle")?.value?.trim();
  if (!titulo) { showToast("Informe o título.", "error"); return; }

  const editingId = document.getElementById("editingId")?.value?.trim();

  const payload = {
    titulo,
    categoria:  document.getElementById("fCategory")?.value  || "geral",
    autor:      document.getElementById("fAuthor")?.value?.trim()   || "Redação",
    subtitulo:  document.getElementById("fExcerpt")?.value?.trim()  || "",
    imagem:     document.getElementById("fImage")?.value?.trim()    || "",
    tempoLeitura: document.getElementById("fReadTime")?.value?.trim() || "",
    data:       document.getElementById("fDate")?.value            || "",
    conteudo:   document.getElementById("fBody")?.innerHTML         || "",
    publicado,
    slug:       gerarSlug(titulo),
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "artigos", editingId), payload);
      showToast(publicado ? "Matéria atualizada e publicada." : "Rascunho atualizado.");
    } else {
      payload.criadoEm = serverTimestamp();
      await addDoc(collection(db, "artigos"), payload);
      showToast(publicado ? "Matéria publicada com sucesso 🚀" : "Rascunho salvo.");
    }

    resetarFormulario();
    switchTab("articles");

  } catch (err) {
    console.error("Erro ao salvar:", err);
    showToast("Erro ao salvar. Veja o console.", "error");
  }
}

// ─── ARTIGOS — EDITAR ─────────────────────────────────────────────────────────
window.editarArtigo = async (id) => {
  try {
    const snap = await getDoc(doc(db, "artigos", id));
    if (!snap.exists()) return;
    const a = snap.data();

    switchTab("new-article");

    document.getElementById("editingId").value   = id;
    document.getElementById("formTitle").textContent = "Editar Matéria";
    document.getElementById("fTitle").value      = a.titulo       || "";
    document.getElementById("fCategory").value   = a.categoria    || "geral";
    document.getElementById("fAuthor").value     = a.autor        || "";
    document.getElementById("fReadTime").value   = a.tempoLeitura || "";
    document.getElementById("fDate").value       = a.data         || "";
    document.getElementById("fExcerpt").value    = a.subtitulo    || "";
    document.getElementById("fImage").value      = a.imagem       || "";
    document.getElementById("fBody").innerHTML   = a.conteudo     || "";
    atualizarPreviewCapa();

  } catch (err) {
    console.error("Erro ao editar:", err);
  }
};

// ─── ARTIGOS — DELETAR ────────────────────────────────────────────────────────
window.deletarArtigo = async (id) => {
  if (!confirm("Tem certeza que quer excluir esta matéria?")) return;
  try {
    await deleteDoc(doc(db, "artigos", id));
    showToast("Matéria excluída.");
    carregarArtigos();
    carregarDashboard();
  } catch (err) {
    console.error("Erro ao excluir:", err);
    showToast("Erro ao excluir.", "error");
  }
};

// ─── FORMULÁRIO — RESETAR ────────────────────────────────────────────────────
function resetarFormulario() {
  document.getElementById("editingId").value       = "";
  document.getElementById("formTitle").textContent = "Nova Matéria";
  document.getElementById("fTitle").value          = "";
  document.getElementById("fCategory").value       = "musica";
  document.getElementById("fAuthor").value         = "";
  document.getElementById("fReadTime").value       = "";
  document.getElementById("fDate").value           = "";
  document.getElementById("fExcerpt").value        = "";
  document.getElementById("fImage").value          = "";
  document.getElementById("fBody").innerHTML       = "";
  atualizarPreviewCapa();
}

function atualizarPreviewCapa() {
  const url  = document.getElementById("fImage")?.value?.trim();
  const wrap = document.getElementById("fImagePreviewWrap");
  const img  = document.getElementById("fImagePreview");
  if (!wrap || !img) return;
  if (url) {
    img.src             = url;
    wrap.style.display  = "block";
  } else {
    wrap.style.display  = "none";
    img.src             = "";
  }
}

// ─── IMAGENS ─────────────────────────────────────────────────────────────────
// Armazenadas como base64 no Firestore (coleção "imagens")
// Para projetos maiores, use Firebase Storage — mas para entrega rápida, isso funciona.

async function renderImages() {
  const library = document.getElementById("imagesLibrary");
  const picker  = document.getElementById("coverImagePicker");
  if (!library) return;

  library.innerHTML = `<div style="color:#888">Carregando...</div>`;

  try {
    const snap   = await getDocs(collection(db, "imagens"));
    const images = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById("statImages").textContent = images.length;
    document.getElementById("imgCount").textContent   = images.length;

    if (!images.length) {
      library.innerHTML = `<div style="color:#888">Nenhuma imagem na biblioteca.</div>`;
      if (picker) picker.innerHTML = `<div style="color:#888">Nenhuma imagem disponível.</div>`;
      return;
    }

    const renderCard = (img, withCheckbox = true) => `
      <div class="image-item" id="img-${img.id}">
        ${withCheckbox ? `<input type="checkbox" class="image-checkbox" data-id="${img.id}" style="position:absolute;top:8px;left:8px;z-index:2;width:16px;height:16px;accent-color:#F5C800">` : ""}
        <img src="${img.url}" alt="${img.nome || "imagem"}">
        ${withCheckbox ? `<button class="image-item-del" onclick="deletarImagem('${img.id}')">✕</button>` : ""}
        ${!withCheckbox ? `<button class="image-select-btn" onclick="usarImagemComoCapa('${img.url}')">Usar como capa</button>` : ""}
      </div>
    `;

    library.innerHTML = images.map(img => renderCard(img, true)).join("");
    if (picker) picker.innerHTML = images.map(img => renderCard(img, false)).join("");

  } catch (err) {
    console.error("Erro ao carregar imagens:", err);
    library.innerHTML = `<div style="color:red">Erro ao carregar imagens.</div>`;
  }
}

function handleImageUpload(files) {
  const validos = [...files].filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);

  if (!validos.length) {
    showToast("Nenhuma imagem válida (máx. 5MB).", "error");
    return;
  }

  let done = 0;
  validos.forEach(file => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await addDoc(collection(db, "imagens"), {
          url:  e.target.result,
          nome: file.name,
          data: serverTimestamp()
        });
        done++;
        if (done === validos.length) {
          showToast(`${done} imagem(ns) adicionada(s).`);
          renderImages();
          carregarDashboard();
        }
      } catch (err) {
        console.error("Erro ao salvar imagem:", err);
      }
    };
    reader.readAsDataURL(file);
  });
}

window.usarImagemComoCapa = (url) => {
  document.getElementById("fImage").value = url;
  atualizarPreviewCapa();
  showToast("Imagem de capa selecionada.");
  switchTab("new-article");
};

window.deletarImagem = async (id) => {
  if (!confirm("Excluir esta imagem?")) return;
  try {
    await deleteDoc(doc(db, "imagens", id));
    showToast("Imagem excluída.");
    renderImages();
    carregarDashboard();
  } catch (err) {
    console.error("Erro ao excluir imagem:", err);
    showToast("Erro ao excluir.", "error");
  }
};

// ─── ASSINANTES ───────────────────────────────────────────────────────────────
async function carregarAssinantes() {
  const tbody   = document.getElementById("subsTableBody");
  const empty   = document.getElementById("subsEmpty");
  if (!tbody) return;

  try {
    const q    = query(collection(db, "newsletter"), orderBy("data", "desc"));
    const snap = await getDocs(q);
    const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById("subsCount").textContent = subs.length;

    if (!subs.length) {
      tbody.innerHTML = "";
      if (empty) empty.style.display = "block";
      return;
    }

    if (empty) empty.style.display = "none";
    tbody.innerHTML = subs.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${s.email || "—"}</td>
        <td>
          <button class="btn btn-danger" style="padding:.4rem .8rem;font-size:.78rem"
              onclick="removerAssinante('${s.id}')">Remover</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Erro ao carregar assinantes:", err);
  }
}

window.removerAssinante = async (id) => {
  if (!confirm("Remover este assinante?")) return;
  try {
    await deleteDoc(doc(db, "newsletter", id));
    showToast("Assinante removido.");
    carregarAssinantes();
  } catch (err) {
    console.error("Erro ao remover:", err);
    showToast("Erro ao remover.", "error");
  }
};

async function exportarCSV() {
  try {
    const snap = await getDocs(collection(db, "newsletter"));
    const emails = snap.docs.map(d => d.data().email).filter(Boolean);

    if (!emails.length) { showToast("Sem assinantes para exportar."); return; }

    const csv  = ["email", ...emails].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "assinantes-vandalize.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado com sucesso.");
  } catch (err) {
    console.error("Erro ao exportar:", err);
    showToast("Erro ao exportar.", "error");
  }
}

// ─── EDITOR ───────────────────────────────────────────────────────────────────
window.execCmd = (cmd, value = null) => document.execCommand(cmd, false, value);
window.clearFormat = () => document.execCommand("removeFormat", false, null);
window.createLinkCmd = () => {
  const url = prompt("URL do link:");
  if (url) document.execCommand("createLink", false, url);
};
