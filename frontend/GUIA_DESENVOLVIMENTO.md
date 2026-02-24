# 🐾 WildLog - Rede Social de Natureza

Uma plataforma moderna para amantes da natureza e vida selvagem, desenvolvida com React e Vite.

## Características

- ✨ Landing page profissional com design moderno
- 🔐 Páginas de Login e Registo
- 📱 Design responsivo (mobile, tablet, desktop)
- 🎨 Interface intuitiva com cores verde natureza
- ⚡ Performance otimizada com Vite

## Estrutura do Projeto

```
src/
├── App.jsx              # Componente principal com rotas
├── App.css              # Estilos globais
├── main.jsx             # Ponto de entrada
├── index.css            # Estilos base
├── pages/
│   ├── Home.jsx         # Página inicial
│   ├── Login.jsx        # Página de login
│   └── Register.jsx     # Página de registo
└── styles/
    ├── Home.css         # Estilos da home
    └── Auth.css         # Estilos de autenticação
```

## Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd wildlog
```

2. Instale as dependências:
```bash
npm install
```

## Como Usar

### Desenvolvimento

Para iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação abrirá em `http://localhost:5173`

### Build para Produção

Para criar um build otimizado:
```bash
npm run build
```

### Preview do Build

Para pré-visualizar o build:
```bash
npm run preview
```

## Páginas

### 🏠 Home (/)
- Landing page com apresentação da WildLog
- Botões para Login e Registo

### 🔑 Login (/login)
- Formulário de autenticação
- Email e palavra-passe
- Link para página de registo

### ✍️ Register (/register)
- Formulário de criação de conta
- Validação de campos
- Confirmação de palavra-passe

## Tecnologias Utilizadas

- **React** 18.2.0 - Biblioteca JavaScript
- **React Router DOM** 6.20.0 - Roteamento
- **Vite** 5.0.8 - Build tool
- **CSS3** - Estilos com animações

## Design

O design segue uma paleta de cores verde baseada na natureza:
- Verde escuro: #1b4332
- Verde principal: #4caf50
- Fundo escuro: #051f15
- Branco: #ffffff

Implementadas animações suaves e transições para melhor experiência do utilizador.

## Próximas Features

- [ ] Feed de posts
- [ ] Perfil de utilizador
- [ ] Sistema de comentários
- [ ] Busca de utilizadores
- [ ] Notificações em tempo real
- [ ] Sistema de mensagens
- [ ] Integração com mapa para localizações

## Contribuições

Contribuições são bem-vindas! Por favor, faça um fork do projeto e envie um pull request.

## Licença

Este projeto está sob licença MIT. Veja o ficheiro LICENSE para mais detalhes.

## Autor

WildLog - Uma comunidade para amantes da natureza 🌿

