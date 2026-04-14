# VANDALIZE — Jornalismo Cultural Independente
## Documentação do Projeto

---

## 📁 Estrutura de Arquivos

```
vandalize/
├── index.html              ← Página inicial (hero + cards + manifesto + newsletter)
├── artigo.html             ← Página de artigo individual
├── sobre.html              ← Página "Sobre"
├── src/
│   ├── style.css           ← Todos os estilos (variáveis, nav, hero, admin, etc.)
│   └── app.js              ← Lógica do frontend público (carrega artigos, hero, newsletter)
├── admin/
│   ├── index.html          ← Login do painel admin
│   ├── painel.html         ← Painel editorial completo
│   └── admin.js            ← Toda a lógica do painel (CRUD, imagens, assinantes)
└── README.md               ← Este arquivo
```

---

## 🚀 Como Usar

### Frontend Público
Abra `index.html` em qualquer servidor web local (VSCode Live Server, XAMPP, etc.)
- Não precisa de backend — usa **localStorage** para persistência
- Artigos são carregados automaticamente do painel admin

### Painel Admin
Acesse `admin/index.html`

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `vandalize2026`

Para alterar, edite as linhas no `admin/index.html`:
```js
if (user === 'admin' && pass === 'vandalize2026') {
```

---

## ✏️ Funcionalidades do Painel

### 📰 Matérias
- Criar nova matéria com editor de texto rico
- Editar matérias existentes
- Publicar ou salvar como rascunho
- Excluir matérias
- Filtrar por categoria

### 🖼️ Imagens
- Upload de imagens (PNG, JPG, WEBP — máx 5MB)
- Drag & drop
- Seleção múltipla para exclusão
- Biblioteca de imagens para usar como capa de matérias

### 📧 Assinantes
- Lista todos os e-mails cadastrados via newsletter
- Remover assinantes individualmente
- Exportar lista em CSV

---

## 🎨 Identidade Visual
- **Cores:** Preto `#111010`, Amarelo/Dourado `#F5C800`, Vermelho `#E03C2C`, Creme `#F5F0E8`
- **Fontes:** Playfair Display (títulos), Barlow Condensed (labels/nav), Barlow (corpo)
- **Estilo:** Editorial bold, inspirado em jornais independentes europeus

---

## 📦 Deploy

### Opção 1 — Estático (GitHub Pages, Netlify, Vercel)
Suba a pasta inteira. Funciona sem backend.

### Opção 2 — Servidor próprio (Apache/Nginx)
Coloque a pasta em `www/` ou `public_html/`. Não precisa de PHP ou Node.

### Opção 3 — Backend real (próximos passos)
Para multi-usuário ou banco de dados real, considere:
- **Backend:** Node.js + Express ou Next.js
- **Banco:** PostgreSQL + Prisma
- **Auth:** JWT ou NextAuth
- **Storage:** Cloudinary ou S3 para imagens
- **CMS:** Pode migrar para Payload CMS ou Sanity mantendo o mesmo frontend

---

## 🔧 Personalização Rápida


```

### Adicionar nova categoria
Em `admin/admin.js`:
```js
const CATEGORIES = {
  musica: 'MÚSICA',
  // adicione aqui:
  fotografia: 'FOTOGRAFIA',
  ...
};
```
E adicione o `<option>` nos selects de `painel.html`.

### Mudar cor dourada
`src/style.css` linha 7:
```css
--gold: #F5C800;
```

---

## 📝 Categorias Disponíveis
- `musica` → MÚSICA
- `carnaval` → CARNAVAL
- `capoeira` → CAPOEIRA
- `noite` → NOITE
- `investigacao` → INVESTIGAÇÃO