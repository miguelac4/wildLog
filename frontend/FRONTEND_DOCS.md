# 📚 WildLog Frontend — Documentação Completa

> Guia detalhado de toda a estrutura do frontend React para aprendizagem.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias Usadas](#-tecnologias-usadas)
3. [Estrutura de Diretórios](#-estrutura-de-diretórios)
4. [Ficheiros Raiz](#-ficheiros-raiz)
5. [Código Fonte (src/)](#-código-fonte-src)
6. [Estilos (styles/)](#-estilos-styles)
7. [Configuração (config/)](#-configuração-config)
8. [Utilitários (utils/)](#-utilitários-utils)
9. [Assets Públicos (public/)](#-assets-públicos-public)
10. [Deploy e Build](#-deploy-e-build)
11. [Fluxo da Aplicação](#-fluxo-da-aplicação)
12. [Limpeza Realizada (Code Cleaning)](#-limpeza-realizada-code-cleaning)
13. [Ficheiros para Eliminar Manualmente](#-ficheiros-para-eliminar-manualmente)

---

## 🌍 Visão Geral

O WildLog é uma rede social para amantes da natureza e vida selvagem. O frontend é uma **SPA (Single Page Application)** construída com React. Atualmente tem 3 páginas:

| Rota        | Página    | Descrição                                    |
|-------------|-----------|----------------------------------------------|
| `/`         | Home      | Landing page com vídeo de fundo e CTAs       |
| `/login`    | Login     | Formulário de autenticação                   |
| `/register` | Register  | Formulário de criação de conta com validação |

A app é servida em dois domínios:
- **`rh360.pt/wildlog`** — em subpasta (base: `/wildlog/`)
- **`wild-log.com`** — na raiz do domínio (base: `/`)

---

## 🛠 Tecnologias Usadas

| Tecnologia        | Versão   | Para quê                                         |
|-------------------|----------|--------------------------------------------------|
| **React**         | ^18.2.0  | Biblioteca principal de UI (componentes)         |
| **React DOM**     | ^18.2.0  | Renderização do React no browser (DOM)           |
| **React Router**  | ^6.20.0  | Navegação SPA (rotas sem reload de página)       |
| **Vite**          | ^5.0.8   | Bundler + Dev Server (substituto do Webpack)     |
| **@vitejs/plugin-react** | ^4.2.0 | Plugin para JSX transform e Fast Refresh    |

### Porquê Vite em vez de Create React App (CRA)?
- **Mais rápido**: Vite usa ES modules nativos em dev (sem bundle)
- **Menor**: O output de produção é mais leve
- **Mais moderno**: CRA está deprecated desde 2023
- **Configurável**: `vite.config.js` é simples e flexível

---

## 📁 Estrutura de Diretórios

```
frontend/
├── index.html              ← HTML base (ponto de entrada do Vite)
├── package.json            ← Dependências e scripts npm
├── vite.config.js          ← Configuração do Vite (build, dev server)
├── .htaccess               ← Configuração Apache (routing, cache, HTTPS)
├── FRONTEND_DOCS.md        ← Este ficheiro de documentação
│
├── public/                 ← Assets estáticos (copiados tal qual para dist/)
│   ├── .htaccess           ← Fallback htaccess (redundante — ver notas)
│   └── media/              ← Vídeos e imagens
│       ├── banner.mp4      ← Vídeo de fundo da Home (fullscreen)
│       ├── logo.jpg        ← Logo original
│       ├── logoText.jpg    ← Logo com texto (não usado atualmente)
│       ├── logoTextWM.png  ← Logo com texto e marca de água (não usado)
│       └── logoWM.png      ← Logo com marca de água (usado na Home)
│
├── src/                    ← Código fonte React
│   ├── main.jsx            ← Entry point — monta o React no DOM
│   ├── App.jsx             ← Componente raiz — configura o Router
│   ├── App.css             ← Estilos do App (vazio — reservado para layout global)
│   ├── index.css           ← Estilos globais (reset, fontes, body)
│   │
│   ├── pages/              ← Componentes de página (1 por rota)
│   │   ├── Home.jsx        ← Landing page com vídeo e botões
│   │   ├── Login.jsx       ← Formulário de login
│   │   └── Register.jsx    ← Formulário de registo com validação
│   │
│   ├── styles/             ← Ficheiros CSS por página/componente
│   │   ├── Home.css        ← Estilos da Home (vídeo, overlay, botões)
│   │   └── Auth.css        ← Estilos partilhados Login + Register
│   │
│   ├── config/             ← Configurações da app
│   │   └── mediaConfig.js  ← URLs centralizadas dos assets de mídia
│   │
│   └── utils/              ← Funções utilitárias
│       └── validateMediaPaths.js  ← Debug: valida URLs de mídia (dev only)
│
└── dist/                   ← Output do build (gerado por npm run build)
    ├── index.html          ← HTML processado pelo Vite
    ├── .htaccess           ← Copiado de public/.htaccess
    ├── media/              ← Copiado de public/media/
    └── assets/             ← JS e CSS minificados com hash no nome
        ├── index-XXXXX.js
        └── index-XXXXX.css
```

---

## 📄 Ficheiros Raiz

### `index.html`
- **O que é**: O único ficheiro HTML da app. O Vite injeta os scripts e CSS aqui.
- **`<div id="root">`**: Ponto de montagem do React. Toda a app é renderizada dentro deste div.
- **`<script type="module" src="/src/main.jsx">`**: Em dev, o Vite serve o JSX diretamente. Em build, é substituído pelo bundle.

### `package.json`
- **`scripts.dev`**: Inicia o servidor de desenvolvimento (`vite`)
- **`scripts.build`**: Gera a versão de produção (`vite build`)
- **`scripts.preview`**: Serve localmente a versão de produção (`vite preview`)
- **`dependencies`**: Bibliotecas usadas em runtime (React, React Router)
- **`devDependencies`**: Ferramentas de build (Vite, plugins, types)

### `vite.config.js`
- **`base`**: Caminho base da app. Muda conforme o domínio de deploy.
- **`plugins: [react()]`**: Ativa JSX, Fast Refresh e otimizações React.
- **`publicDir: 'public'`**: Define a pasta de assets estáticos.
- **`build.outDir: 'dist'`**: Onde o build de produção é gerado.

### `.htaccess` (raiz)
Configuração Apache para:
1. **SPA Routing**: Redireciona todas as rotas para `index.html` (necessário porque o React Router gere as rotas no browser, mas o Apache precisa saber para não dar 404).
2. **HTTPS**: Força `https://`
3. **Compressão gzip**: Reduz o tamanho das respostas (~60% menor)
4. **Cache**: Assets estáticos cached por 1 mês, HTML nunca cached

---

## ⚛️ Código Fonte (src/)

### `main.jsx` — Entry Point

```
Fluxo: index.html → main.jsx → App.jsx → páginas
```

Este é o primeiro ficheiro JavaScript executado. Faz:
1. Importa estilos globais (`index.css`)
2. Cria a root do React com `ReactDOM.createRoot()`
3. Renderiza `<App />` dentro de `<React.StrictMode>`

**React.StrictMode**: Wrapper que ativa avisos extras em desenvolvimento (renderização dupla para detetar side effects, avisos de APIs deprecated). Não afeta produção.

### `App.jsx` — Componente Raiz + Router

Configura o **React Router**, o sistema de navegação da SPA:
- **`<BrowserRouter>`** (alias `Router`): Usa a History API do browser para URLs limpas (ex: `/login` em vez de `/#/login`)
- **`basename`**: Prefixo adicionado a todas as rotas. Detectado automaticamente pelo hostname.
- **`<Routes>`**: Container de rotas (só uma rota pode estar ativa de cada vez)
- **`<Route path="/" element={<Home />} />`**: Quando o URL é `/`, renderiza o componente `Home`

**Conceito importante — SPA vs MPA**:
- Numa SPA, o browser carrega `index.html` UMA vez. A navegação entre páginas é feita pelo JavaScript (React Router) sem recarregar a página.
- Isto é mais rápido mas requer configuração server-side (`.htaccess`) para que qualquer URL retorne o `index.html`.

### `pages/Home.jsx` — Landing Page

Componente funcional com:
- **`useNavigate()`**: Hook do React Router que retorna uma função para navegar programaticamente (ex: `navigate('/login')`)
- **`MEDIA_URLS`**: URLs dos assets importados de `mediaConfig.js`
- **`<video autoPlay muted loop>`**: `muted` é obrigatório para autoplay funcionar nos browsers modernos

### `pages/Login.jsx` — Formulário de Login

Demonstra **Controlled Components**:
- O valor de cada `<input>` é controlado pelo state React (`value={email}`)
- Cada mudança chama `onChange` que atualiza o state (`setEmail(e.target.value)`)
- No submit, `preventDefault()` evita o reload da página

**TODO**: Integrar com API backend (`POST /api/auth/login`)

### `pages/Register.jsx` — Formulário de Registo

Demonstra conceitos avançados:
- **Estado como objeto**: `useState({ username: '', email: '', ... })` — melhor que múltiplos `useState` para formulários grandes
- **Handler genérico**: Um único `handleChange` serve todos os inputs usando `[name]: value` (computed property names do ES6)
- **Validação client-side**: Verifica campos obrigatórios e match de passwords antes do submit
- **Conditional rendering**: `{errors.field && <span>...</span>}` — só mostra o erro se existir

**TODO**: Integrar com API backend (`POST /api/auth/register`)

---

## 🎨 Estilos (styles/)

### `index.css` — Estilos Globais

- **Google Fonts**: Importa "Figtree" (400, 500, 600, 700) — fonte moderna e legível
- **Reset CSS**: Remove margens e paddings default dos browsers
- **`box-sizing: border-box`**: Faz com que padding e border sejam incluídos na largura/altura (evita surpresas com layout)
- **`overflow: hidden`**: Previne scroll na página Home (vídeo fullscreen)

### `App.css` — Reservado para Layout Global

Atualmente vazio. Destinado a estilos de layout global futuro (navbar, footer, grid principal).

### `Home.css` — Estilos da Landing Page

Técnicas usadas:
- **`position: fixed` no vídeo**: O vídeo fica fixo atrás de tudo
- **`::before` pseudo-element**: Overlay preto semi-transparente sobre o vídeo (legibilidade)
- **`z-index` layering**: Vídeo (0) → Overlay (1) → Bolha (2) → Conteúdo (3)
- **CSS Animations**: `@keyframes slideUp`, `slideDown`, `float`
- **`object-fit: cover`**: O vídeo preenche todo o espaço sem distorcer
- **Botões pill**: `border-radius: 50px` cria o formato arredondado
- **Responsive design**: Media queries para tablet (768px) e mobile (480px)

### `Auth.css` — Estilos das Páginas de Autenticação

Partilhado entre Login e Register. Técnicas:
- **Gradient background**: `linear-gradient(135deg, ...)` — diagonal
- **Glassmorphism lite**: Card branco com `rgba(255, 255, 255, 0.95)` e `box-shadow`
- **Pseudo-elements decorativos**: Bolhas animadas com `radial-gradient`
- **Focus states**: Input com borda verde e sombra suave ao focar
- **Transições**: Hover effects suaves com `transition: all 0.3s ease`

---

## ⚙️ Configuração (config/)

### `mediaConfig.js` — URLs Centralizadas de Mídia

**Problema resolvido**: A app corre em dois domínios com paths diferentes:
- `rh360.pt/wildlog/media/banner.mp4`
- `wild-log.com/media/banner.mp4`

Em vez de hardcodar paths em cada componente, este ficheiro centraliza todos os URLs e ajusta automaticamente baseado no hostname.

**Como funciona**:
1. Deteta o hostname (`window.location.hostname`)
2. Se for `wild-log.com` → basename = `""` (raiz)
3. Se for qualquer outro → basename = `"/wildlog"` (subpasta)
4. Exporta objeto com URLs completos

**Para adicionar novos assets**:
1. Coloca o ficheiro em `public/media/`
2. Adiciona entrada ao objeto `MEDIA_URLS`
3. Importa onde precisares: `import { MEDIA_URLS } from '../config/mediaConfig'`

---

## 🔧 Utilitários (utils/)

### `validateMediaPaths.js` — Validação de Debug

Utilitário opcional para verificar se os URLs de mídia estão corretos. **Não é importado em produção** — pode ser usado manualmente na consola do browser durante o desenvolvimento.

> ⚠️ **NOTA**: Este ficheiro pode ser eliminado. Foi mantido apenas como referência.

---

## 🖼 Assets Públicos (public/)

Tudo em `public/` é copiado diretamente para `dist/` durante o build, sem processamento.

| Ficheiro          | Tamanho aprox. | Usado em    | Descrição                    |
|-------------------|----------------|-------------|------------------------------|
| `media/banner.mp4`    | Grande     | Home.jsx    | Vídeo de fundo fullscreen    |
| `media/logoWM.png`    | Pequeno    | Home.jsx    | Logo com marca de água       |
| `media/logo.jpg`      | Pequeno    | Nenhum      | Logo original (não usado)    |
| `media/logoText.jpg`  | Pequeno    | Nenhum      | Logo com texto (não usado)   |
| `media/logoTextWM.png`| Pequeno    | Nenhum      | Logo texto + WM (não usado)  |

> Os ficheiros marcados como "não usado" podem ser removidos para reduzir o tamanho do build, ou mantidos para uso futuro.

---

## 🚀 Deploy e Build

### Scripts npm

```bash
# Desenvolvimento local (com HMR)
npm run dev

# Build para rh360.pt/wildlog (base: /wildlog/)
npm run build

# Build para wild-log.com (base: /)
npm run build -- --mode production-root

# Preview local do build de produção
npm run preview
```

### Processo de Deploy Manual

1. Executa o build correto (ver acima)
2. Conecta via FTP ao servidor
3. Para **rh360.pt**: Upload de `dist/*` para `public_html/wildlog/`
4. Para **wild-log.com**: Upload de `dist/*` para `public_html/`
5. Copia o `.htaccess` da raiz do frontend para a raiz do domínio no servidor
6. Limpa cache do browser (Ctrl+Shift+Del)

---

## 🔄 Fluxo da Aplicação

```
1. Browser pede https://rh360.pt/wildlog
        ↓
2. Apache (.htaccess) redireciona para index.html
        ↓
3. index.html carrega main.jsx (via Vite/bundle)
        ↓
4. main.jsx monta <App /> no DOM (#root)
        ↓
5. App.jsx deteta hostname → define basename
        ↓
6. React Router verifica a rota (/) → renderiza <Home />
        ↓
7. Home.jsx carrega vídeo e assets via MEDIA_URLS
        ↓
8. Utilizador clica "Entrar" → navigate('/login')
        ↓
9. React Router renderiza <Login /> (sem reload!)
```

---

## 📖 Conceitos React para Aprender

Organizados por ficheiro onde são demonstrados:

| Conceito                    | Ficheiro        | Descrição                                      |
|-----------------------------|-----------------|-------------------------------------------------|
| JSX                         | Todos .jsx      | HTML-like syntax dentro de JavaScript           |
| Componentes Funcionais      | Todos .jsx      | Funções que retornam JSX                        |
| `useState` Hook             | Login, Register | Gerir estado local do componente                |
| Controlled Components       | Login           | Inputs cujo valor é controlado pelo React state |
| Event Handling              | Login, Register | `onChange`, `onSubmit`, `onClick`                |
| `useNavigate` Hook          | Home, Login     | Navegação programática com React Router         |
| Conditional Rendering       | Register        | `{condition && <element>}`                      |
| Computed Property Names      | Register        | `[name]: value` para handlers genéricos        |
| CSS Modules (manual)        | Todos           | 1 ficheiro CSS por componente/página            |
| Pseudo-elements CSS         | Home.css        | `::before`, `::after` para overlays             |
| CSS Animations              | Home.css        | `@keyframes` para animações                     |
| Responsive Design           | Home/Auth.css   | Media queries para mobile                       |
| Environment Variables       | vite.config.js  | `import.meta.env.DEV` / mode                    |

---

*Documentação gerada durante code cleaning — Março 2026*

