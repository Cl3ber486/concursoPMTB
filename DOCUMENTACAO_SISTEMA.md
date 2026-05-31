# Documentação do Sistema de Inscrição para Concurso Público

Esta documentação detalha a arquitetura, estrutura de pastas e passos de implementação utilizados na criação do frontend da plataforma de inscrições, a fim de guiar futuros desenvolvimentos e manutenções.

## 1. Tecnologias Utilizadas
- **React (v18+)**: Biblioteca principal para construção das interfaces.
- **Vite**: Bundler e ferramenta de desenvolvimento (escolhida pela performance).
- **React Router DOM (v6+)**: Gerenciamento de rotas e navegação entre o formulário do candidato e a área do administrador.
- **Recharts**: Biblioteca utilizada para renderizar os gráficos no Dashboard do Admin.
- **Lucide-React**: Conjunto de ícones leves utilizados no sistema (ex: ícones de usuários, menu, check, etc).
- **Vanilla CSS (CSS Puro)**: Utilizado em substituição a frameworks como Tailwind para garantir flexibilidade máxima e controle total sobre o "glassmorphism" e animações.

## 2. Estrutura de Pastas e Arquitetura

O código foi organizado dentro do diretório `src/` da seguinte forma:

```text
src/
├── components/          # Componentes globais e reutilizáveis (UI)
│   ├── Button.jsx       # Botões (Primary e Secondary)
│   ├── Card.jsx         # Container base branco com sombra (Glass/Premium feel)
│   ├── Header.jsx       # Cabeçalho padrão com o logo da Prefeitura
│   ├── Input.jsx        # Campos de texto padronizados
│   ├── Radio.jsx        # Componente de seleção de botões Radio
│   └── Select.jsx       # Componente de caixas de seleção dropdown
│
├── pages/               # Páginas e fluxos principais divididos por domínios
│   ├── public/          # Área do Candidato
│   │   ├── PublicLayout.jsx          # Layout base para os candidatos
│   │   ├── StartScreen.jsx           # Tela 0: Inscrições Abertas
│   │   ├── PersonalDataStep.jsx      # Tela 1: Dados Pessoais
│   │   ├── AddressStep.jsx           # Tela 2: Endereços
│   │   ├── SpecialConditionsStep.jsx # Tela 3: PCD e Lactante
│   │   └── ReviewStep.jsx            # Tela 4: Confirmação de dados
│   │
│   └── admin/           # Área do Administrador
│       ├── AdminLayout.jsx           # Navbar superior e menu secundário
│       ├── AdminLogin.jsx            # Tela de Login do sistema
│       ├── Dashboard.jsx             # Visão geral (Cards de estatística e Gráficos)
│       ├── SubscriberList.jsx        # Tabela completa de inscritos
│       └── UserManagement.jsx        # Gerenciamento de operadores e datas
│
├── index.css            # Variáveis globais do Design System e reset
├── main.jsx             # Entrypoint da aplicação React
└── App.jsx              # Configuração do React Router
```

## 3. Design System e Estilos

As definições de cores e layout base estão no arquivo `src/index.css`.
Caso precise alterar a cor primária (roxo/azul) futuramente, basta alterar a variável `--primary-color` no seletor `:root`.

```css
:root {
  --primary-color: #4c3ce6;
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  /* ... outras variáveis */
}
```

## 4. Roteamento (`App.jsx`)

O sistema de rotas foi construído usando componentes aninhados (Nested Routes).

- O `/` renderiza o `PublicLayout`. Todos os steps do formulário ficam dentro de `/inscricao/...`.
- O `/admin` sem caminhos extras renderiza a tela de Login.
- O `/admin` seguido de recursos (ex: `/admin/dashboard`) passa pelo `AdminLayout`, que renderiza o cabeçalho do painel.

### Como adicionar uma nova etapa no formulário:
1. Crie o novo arquivo na pasta `src/pages/public/`.
2. Utilize o componente `<Card>` para envolver o conteúdo.
3. Importe os inputs necessários.
4. Adicione a nova rota dentro da rota `/` no arquivo `App.jsx`.
5. Atualize os botões `navigate('/proxima-etapa')` nas telas anterior e posterior para não quebrar o fluxo.

### Como adicionar uma nova aba no Painel Admin:
1. Crie a página em `src/pages/admin/`.
2. No arquivo `AdminLayout.jsx`, adicione um novo objeto na constante `navItems`: `{ path: '/admin/novo', icon: SeuIcone, label: 'Novo Menu' }`.
3. Adicione a `<Route>` correspondente no arquivo `App.jsx` dentro do bloco do AdminLayout.

## 5. Como Iniciar o Projeto Localmente

Na raiz do projeto (`/concursoPMTB`), execute:

```bash
# 1. Instalar dependências (caso seja clonado do zero)
npm install

# 2. Rodar o servidor de desenvolvimento
npm run dev
```

O sistema ficará disponível em `http://localhost:5173`.
