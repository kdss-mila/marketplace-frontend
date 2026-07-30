# Super Market Shop: como funciona um marketplace completo construído do zero

Construir um marketplace do zero exige ir além de uma vitrine de produtos. É preciso pensar em pagamentos, perfis de usuário, estoque, frete, comprovantes e repasses financeiros. O **Super Market Shop** nasceu exatamente com esse desafio: um MVP inspirado no modelo do Mercado Livre, desenvolvido com **React**, **.NET 9** e **PostgreSQL**, cobrindo todo o ciclo de uma compra, do catálogo até o repasse ao vendedor.

**Autora:** Kamila dos Santos Souza

**Todos os direitos reservados.** Este material, incluindo o código, a documentação e o conteúdo aqui descrito, é de propriedade de Kamila dos Santos Souza. Reprodução, distribuição ou uso comercial sem autorização prévia são proibidos.

Neste artigo, explico como a aplicação funciona por dentro e por fora: a estrutura do projeto, as jornadas de comprador, vendedor e administrador, o fluxo completo de um pedido, a arquitetura do frontend e do backend, a API REST, o banco de dados, as integrações externas e como executar tudo localmente. O objetivo é que qualquer pessoa de perfil técnico ou não, consiga entender o que foi construído e por que cada decisão faz sentido no contexto de um MVP.

---

## O que é o Super Market Shop

O Super Market Shop é um marketplace web em formato MVP (produto mínimo viável). Na prática, isso significa que a aplicação cobre as funcionalidades essenciais de uma plataforma de compra e venda online, sem a complexidade de integrações bancárias automatizadas ou logística real de transportadoras.

O modelo de negócio adotado é o de **marketplace com pagamento PIX manual**. Quando um comprador finaliza um pedido, o sistema exibe a chave Pix da plataforma. O comprador realiza a transferência por fora do sistema e envia o comprovante pela própria interface. Um administrador analisa o comprovante e, ao aprovar, o pedido avança no fluxo: estoque é debitado, o vendedor é notificado e um repasse financeiro é gerado.

Essa abordagem simplifica o MVP de forma intencional. Não há gateway de pagamento, taxas de adquirente ou webhooks bancários. Em contrapartida, o fluxo financeiro fica transparente e controlado manualmente, adequado para demonstração, portfólio e aprendizado.

A aplicação reconhece **três papéis de usuário**:

- **Comprador** — navega, compra e acompanha pedidos.
- **Vendedor** — publica anúncios, gerencia vendas e informa rastreio.
- **Administrador** — modera usuários, categorias, pagamentos e repasses.

Do ponto de vista tecnológico, o Super Market Shop é dividido em duas partes principais: o **frontend**, uma aplicação React que roda no navegador, e o **backend**, uma API REST construída em .NET 9 que centraliza regras de negócio, persistência e integrações. Os dados ficam em **PostgreSQL**; arquivos (imagens de produtos e comprovantes de pagamento) são armazenados na nuvem via **Cloudflare R2**.

[INSERIR IMAGEM: capa]

Legenda sugerida: Página inicial do Super Market Shop, marketplace MVP desenvolvido por Kamila dos Santos Souza.

---

## Estrutura do projeto

O projeto está organizado em dois repositórios independentes.

O repositório **marketplace-backend** concentra toda a API: controllers HTTP, casos de uso, acesso ao banco de dados, autenticação JWT, upload de arquivos e configuração de dependências. É aqui que as regras de negócio são aplicadas e validadas.

O repositório **marketplace-frontend** contém a interface do Super Market Shop: páginas, componentes visuais, gerenciamento de estado no navegador e comunicação com a API. A aplicação é construída com React, TypeScript e Vite.

**Como frontend e backend se comunicam**

Em ambiente de desenvolvimento, o frontend roda na porta 5173 e o backend na porta 5066. O Vite (ferramenta de build do frontend) possui um proxy configurado: toda requisição que começa com `/api` é encaminhada automaticamente para o backend. Isso elimina problemas de CORS durante o desenvolvimento e permite que o frontend trate a API como se estivesse no mesmo endereço.

Em produção, o frontend pode ser servido como arquivos estáticos atrás de um reverse proxy que também roteia `/api` para o backend, ou pode apontar diretamente para a URL pública da API por meio de uma variável de ambiente.

**Traduzindo:** o usuário interage apenas com o navegador. Por trás, cada clique gera uma requisição HTTP para a API .NET. A API consulta o PostgreSQL para dados persistentes (usuários, produtos, pedidos) e o Cloudflare R2 para arquivos (imagens e comprovantes). O frontend nunca acessa o banco ou o storage diretamente, tudo passa pela API.

---

## Perfis de usuário e jornadas

Cada tipo de usuário tem uma jornada distinta dentro do Super Market Shop. O sistema garante que cada perfil acesse somente o que lhe compete, por meio de autenticação JWT e controle de papéis (roles).

### Comprador

O comprador é o usuário padrão registrado na plataforma. Ao criar uma conta, recebe automaticamente o papel de comprador.

Sua jornada começa na home, onde visualiza produtos em destaque e pode navegar por categorias. A página de busca permite filtrar anúncios por texto ou departamento. Na página de detalhe de um produto, o comprador vê preço, descrição, imagens, estoque disponível e informações do vendedor.

É possível salvar produtos nos favoritos (persistidos localmente no navegador, por usuário) e adicionar itens ao carrinho. O carrinho calcula subtotal, permite informar endereço de entrega (com preenchimento automático a partir do CEP) e simula o custo de frete.

No checkout, acessível apenas após login, o comprador confirma o pedido e recebe a chave Pix da plataforma. Em seguida, envia o comprovante de pagamento. O histórico de pedidos fica disponível em `/conta/pedidos`, com acompanhamento de status em tempo real.

### Vendedor

O vendedor é um usuário com papel elevado que pode publicar e gerenciar anúncios. Antes de operar plenamente, precisa completar o **onboarding**: informar tipo de documento (CPF ou CNPJ), número do documento, chave Pix para recebimentos e CEP de origem (usado no cálculo de frete simulado).

Após o onboarding, o vendedor acessa o painel em `/vendedor/anuncios`, onde lista, cria e exclui produtos. O formulário de novo anúncio permite upload de imagens para a nuvem (Cloudflare R2) antes de salvar o produto. Em `/vendedor/vendas`, acompanha pedidos pagos, enviados ou entregues e informa o código de rastreio quando o produto é despachado.

### Administrador

O administrador tem visão global da plataforma. Em `/admin/usuarios`, lista todos os cadastros e pode banir ou desbanir contas. Em `/admin/categorias`, gerencia a árvore de departamentos (criação, edição e exclusão).

O painel de pagamentos (`/admin/pagamentos`) concentra pedidos com status "Em Análise", ou seja, compradores que já enviaram comprovante e aguardam aprovação. Ao aprovar, o administrador dispara a debitação de estoque, a mudança de status para "Pago" e a criação automática de um repasse financeiro ao vendedor.

Em `/admin/repasses`, controla quais repasses já foram pagos manualmente ao vendedor.

[INSERIR IMAGEM: login]

Legenda sugerida: Autenticação por e-mail e senha; após o login, o sistema direciona cada usuário conforme seu papel.

[INSERIR IMAGEM: painel vendedor ou admin]

Legenda sugerida: Cada perfil acessa apenas as funcionalidades permitidas pelo sistema.

**Traduzindo:** o Super Market Shop não é apenas uma loja, é uma plataforma com três atores interdependentes. O comprador gera demanda, o vendedor oferta produtos e o administrador garante que o fluxo financeiro seja confiável antes de liberar repasses.

---

## Fluxo completo de um pedido

Entender o ciclo de vida de um pedido é a chave para compreender toda a aplicação. Cada etapa envolve ações de um ou mais papéis e transições de status bem definidas.

**Passo 1 — Compra**

O comprador adiciona um ou mais produtos ao carrinho. Na tela do carrinho, informa o CEP de entrega. O sistema consulta o ViaCEP e preenche automaticamente rua, bairro, cidade e estado. Complemento e número são informados manualmente. O frete é calculado por uma fórmula simulada (mock), baseada no peso do produto e nos CEPs de origem e destino.

**Passo 2 — Criação do pedido**

No checkout, o comprador confirma a compra. A API valida se há estoque suficiente, registra o pedido e define o status inicial: **Aguardando Comprovante**. A resposta inclui a chave Pix da plataforma para pagamento.

**Passo 3 — Envio do comprovante**

O comprador realiza a transferência Pix externamente e faz upload do comprovante pela interface. O arquivo é enviado ao Cloudflare R2 e a URL fica associada ao pedido. O status muda para **Em Análise**.

**Passo 4 — Aprovação pelo administrador**

O administrador visualiza o pedido pendente, confere o comprovante e aprova. Nesse momento, três coisas acontecem de forma atômica: o estoque do produto é debitado, o status do pedido passa para **Pago** e um registro de **repasse** é criado para o vendedor. O repasse inclui o valor do produto, o frete, a comissão da plataforma (10% sobre o valor do produto) e o valor líquido a ser repassado.

**Passo 5 — Envio pelo vendedor**

O vendedor visualiza a venda no painel e, ao despachar o produto, informa o código de rastreio. O status avança para **Enviado**.

**Passo 6 — Repasse ao vendedor**

O administrador, após realizar a transferência Pix manual ao vendedor, marca o repasse como pago no sistema.

**Sequência de status em resumo:**

Aguardando Comprovante → Em Análise (upload do comprovante) → Pago (aprovação do admin) → Enviado (rastreio informado pelo vendedor) → Entregue (confirmação futura).

Cada transição é controlada por regras no backend. Não é possível, por exemplo, informar rastreio antes do pedido ser pago, ou aprovar um pedido que ainda não tem comprovante.

[INSERIR IMAGEM: checkout]

Legenda sugerida: Momento em que o comprador recebe a chave Pix para pagamento manual.

[INSERIR IMAGEM: admin pagamentos]

Legenda sugerida: Administrador analisa comprovantes e aprova pedidos pendentes.

[INSERIR IMAGEM: vendas vendedor]

Legenda sugerida: Vendedor acompanha vendas pagas e informa o código de rastreio.

**Traduzindo:** esse fluxo replica, em escala reduzida, a operação real de um marketplace. A diferença é que pagamentos e repasses são manuais, o que torna o MVP viável sem integrações bancárias, mas já demonstra toda a lógica de negócio necessária.

---

## Frontend: como a interface funciona

A interface do Super Market Shop foi construída com tecnologias modernas e amplamente adotadas no mercado. A escolha por ferramentas consolidadas facilita manutenção, evolução e serve como referência de portfólio.

### Stack tecnológica

- **React 18** — biblioteca para construção de interfaces reativas.
- **Vite 6** — ferramenta de build e servidor de desenvolvimento, extremamente rápida.
- **TypeScript** — tipagem estática que reduz erros e melhora a legibilidade do código.
- **Tailwind CSS** — estilização utility-first, com design system consistente.
- **Componentes no estilo shadcn/ui** — primitivos acessíveis baseados em Radix UI, adaptados manualmente ao projeto.

Formulários utilizam **React Hook Form** com validação via **Zod**. Navegação entre páginas é feita com **React Router DOM** (versão 7). Requisições HTTP usam **Axios**.

### Organização por funcionalidades

O código-fonte do frontend está dividido em módulos por domínio de negócio (feature-based):

- **auth** — login, registro e schemas de validação.
- **catalog** — home, busca, detalhe de produto, favoritos e componentes de vitrine.
- **checkout** — carrinho, checkout e histórico de pedidos.
- **seller-panel** — painel do vendedor, cadastro de produtos, vendas e onboarding.
- **backoffice** — painéis administrativos de usuários, categorias, pagamentos e repasses.

Essa organização mantém cada funcionalidade isolada, facilitando localizar e modificar código sem impactar outras áreas.

### Layouts e navegação

A aplicação utiliza três layouts visuais distintos:

- **Layout de catálogo** — usado na home, busca e favoritos; foco em descoberta de produtos.
- **Layout principal** — usado em detalhe de produto, login, registro, carrinho, checkout e pedidos.
- **Layout de painel** — usado nas áreas de vendedor e administrador, com menu lateral dedicado.

### Estado global

O gerenciamento de estado não utiliza bibliotecas externas como Redux. Em vez disso, três **Context Providers** do React centralizam o estado compartilhado:

- **AuthProvider** — armazena usuário logado e token JWT, com persistência em localStorage.
- **CartProvider** — gerencia itens do carrinho, endereço de entrega e cotação de frete.
- **FavoritesProvider** — mantém favoritos por usuário, também persistidos localmente.

Ao recarregar a página, o AuthProvider restaura a sessão salva e valida o token chamando a API. Se o token estiver inválido ou expirado, o logout é automático.

### Proteção de rotas

Algumas páginas exigem autenticação (checkout, pedidos). Outras exigem um papel específico: rotas `/vendedor/*` só são acessíveis por vendedores; rotas `/admin/*` só por administradores. Componentes dedicados (`ProtectedRoute` e `RoleRoute`) interceptam a navegação e redirecionam usuários não autorizados.

### Comunicação com a API

Todas as requisições passam por uma instância centralizada do Axios. Um interceptor lê o token JWT do localStorage e o injeta no header `Authorization: Bearer` de cada chamada. Em desenvolvimento, a base URL é `/api` (proxy para o backend); em produção, aponta para a URL configurada.

**Fluxo de autenticação no navegador:** login → API devolve token JWT → token salvo no localStorage → interceptor anexa token em todas as requisições → ao recarregar, sessão é restaurada e validada.

[INSERIR IMAGEM: detalhe produto]

Legenda sugerida: Página de detalhe com informações do anúncio.

[INSERIR IMAGEM: carrinho]

Legenda sugerida: Carrinho com cálculo de frete e endereço de entrega.

[INSERIR IMAGEM: novo produto]

Legenda sugerida: Vendedor publica anúncio com upload de imagem para a nuvem.

**Traduzindo:** o frontend é a porta de entrada do usuário. Toda a experiência visual desde a vitrine até o painel administrativo, passa por essa camada, que se comunica exclusivamente com a API REST do backend.

---

## Backend: arquitetura e camadas

O backend do Super Market Shop foi projetado com **Domain-Driven Design (DDD)** em camadas, separando responsabilidades de forma clara. A API roda em **.NET 9** e expõe 28 endpoints REST documentados via Swagger.

### Os seis projetos

A solução .NET é composta por seis projetos interdependentes:

- **Marketplace.Api** — camada de entrada HTTP. Contém os controllers que recebem requisições, aplicam autenticação e delegam para casos de uso. Também abriga o `Program.cs` (configuração da aplicação), middleware global de exceções e Swagger.

- **Marketplace.Application** — camada de aplicação. Concentra os casos de uso (use cases), DTOs de entrada e saída, validadores FluentValidation e exceções de negócio customizadas (como `UnauthorizedException` e `NotFoundException`).

- **Marketplace.Domain** — núcleo do domínio. Define entidades (User, Product, Order, Repasse, Category), enums (OrderStatus, UserRole), interfaces de repositórios e serviços, e classes de configuração tipadas (JwtSettings, PlatformSettings, R2Settings).

- **Marketplace.Repository** — camada de persistência. Implementa repositórios PostgreSQL usando **Dapper** (micro-ORM leve). Também contém o migrador de banco (**DbUp**) que aplica scripts SQL na inicialização.

- **Marketplace.Infrastructure** — serviços de infraestrutura. Implementa geração e validação de JWT, resolução do usuário logado, upload para Cloudflare R2 e calculadora de frete simulada.

- **Marketplace.Setup** — composition root. Registra todas as dependências no container de injeção de dependências (DI), conectando interfaces às implementações concretas.

### Fluxo interno de uma requisição

Quando uma requisição HTTP chega à API, o controller correspondente a recebe, extrai os dados do body ou query string e chama o caso de uso adequado. O caso de uso aplica as regras de negócio, consulta repositórios para ler ou gravar dados e, quando necessário, invoca serviços de infraestrutura (storage, frete, JWT).

A camada de API delega para casos de uso na camada de aplicação. Os casos de uso consultam repositórios (dados) e serviços de infraestrutura (JWT, storage, frete). Tudo depende apenas do domínio, que concentra os modelos e contratos centrais do negócio.

### Validação e tratamento de erros

Entradas são validadas com **FluentValidation** antes de chegar à lógica de negócio. Erros de validação, autorização ou regras de domínio são capturados por um middleware global que devolve respostas padronizadas no formato `{ "message": "..." }`, sempre em português, com códigos HTTP adequados (400, 401, 403, 404, 502).

### Documentação interativa

A API expõe documentação Swagger em `/swagger`, permitindo testar endpoints diretamente no navegador, incluindo autenticação Bearer para rotas protegidas.

[INSERIR IMAGEM: swagger]

Legenda sugerida: Documentação interativa dos 28 endpoints da API.

**Traduzindo:** a arquitetura em camadas garante que regras de negócio não fiquem misturadas com detalhes de HTTP ou SQL. Cada camada tem uma responsabilidade clara, o que facilita testes, manutenção e evolução futura do sistema.

---

## API REST: endpoints e autenticação

A API expõe 28 rotas agrupadas por domínio. Todas ficam sob o prefixo `/api`.

### Autenticação

- **POST /api/auth/login** — recebe e-mail e senha, devolve usuário e token JWT.
- **POST /api/auth/register** — cria nova conta com papel de comprador.
- **GET /api/auth/me** — retorna dados do usuário logado (requer token).

Senhas são armazenadas com hash **BCrypt**. O token JWT (padrão HS256) contém claims de identificação: id, e-mail, nome e papel (role). A expiração padrão é de 8 horas.

### Catálogo (acesso público)

- **GET /api/products** — listagem com filtros opcionais de texto, categoria e subcategorias.
- **GET /api/products/:id** — detalhe de um produto.
- **GET /api/categories** — árvore de categorias.

### Pedidos (comprador autenticado)

- **POST /api/orders** — cria pedido e devolve chave Pix.
- **POST /api/orders/:id/receipt** — upload de comprovante (multipart).
- **GET /api/orders/me** — histórico de pedidos do comprador logado.

### Frete e endereço (acesso público)

- **POST /api/shipping/quote** — cotação simulada de frete.
- **GET /api/shipping/address/:cep** — consulta endereço via ViaCEP.

### Vendedor (requer papel seller)

- **GET /api/seller/products** — produtos do vendedor logado.
- **POST /api/seller/products** — cria anúncio.
- **POST /api/seller/products/upload-image** — upload de imagem para R2.
- **PUT /api/seller/products/:id** — atualiza produto.
- **DELETE /api/seller/products/:id** — remove produto.
- **GET /api/seller/sales** — vendas com status Pago, Enviado ou Entregue.
- **PATCH /api/seller/sales/:id/tracking** — informa código de rastreio.
- **POST /api/seller/onboarding** — completa cadastro de vendedor.

### Administrador (requer papel admin)

- **GET /api/admin/users** — lista usuários.
- **PATCH /api/admin/users/:id/ban** — bane ou desbane usuário.
- **GET/POST/PUT/DELETE /api/admin/categories** — CRUD de categorias.
- **GET /api/admin/orders** — pedidos aguardando aprovação (Em Análise).
- **POST /api/admin/orders/:id/approve** — aprova pagamento.
- **GET /api/admin/repasses** — lista repasses.
- **POST /api/admin/repasses/:id/mark-paid** — marca repasse como pago.

### Contratos e convenções

Todas as respostas JSON seguem **camelCase** com campos nulos explícitos. Status de pedido são strings em português com acentuação literal: "Aguardando Comprovante", "Em Análise", "Pago", "Enviado", "Entregue". Papéis de usuário são minúsculos: "buyer", "seller", "admin". Datas seguem o formato ISO-8601 em UTC. Preços são decimais em reais.

[INSERIR IMAGEM: resposta login]

Legenda sugerida: Após o login, a API devolve o usuário e o token JWT para autenticação.

**Traduzindo:** a API é o contrato entre frontend e backend. Cada endpoint tem autenticação, validação e regras de negócio bem definidas, garantindo que a interface e a lógica server-side permaneçam sincronizadas.

---

## Banco de dados e persistência

O Super Market Shop utiliza **PostgreSQL** como banco de dados principal. O acesso é feito via **Dapper**, um micro-ORM que executa SQL direto sem Entity Framework. Essa escolha traz performance e controle explícito sobre as queries.

### Migrações automáticas

Scripts SQL são versionados e aplicados automaticamente na inicialização da API, usando a biblioteca **DbUp**. Dois scripts compõem a base:

- **001_init_schema.sql** — cria as tabelas do sistema.
- **002_seed_data.sql** — insere dados de demonstração (usuários, categorias, produtos, pedidos e repasses).

Os scripts são idempotentes: executar novamente não causa erro nem duplicação.

### Tabelas principais

- **users** — armazena contas de usuários com e-mail, nome, CPF, papel (role), flag de banimento e hash de senha.

- **seller_profiles** — dados complementares do vendedor: tipo e número de documento, chave Pix, CEP de origem, endereço de origem e flag de onboarding completo. Relacionada a users por chave estrangeira.

- **categories** — categorias de produtos em estrutura de árvore (campo parent_id permite subcategorias).

- **products** — anúncios com título, descrição, preço, estoque, categoria, vendedor, peso e dimensões (largura, altura, comprimento).

- **product_images** — URLs de imagens associadas a cada produto, com posição para ordenação.

- **orders** — pedidos com referências a comprador, vendedor e produto; inclui quantidade, valores, status, endereço de entrega, URL do comprovante e código de rastreio.

- **repasses** — registros financeiros gerados após aprovação de pedido, com valor do produto, frete, comissão, valor líquido e flag de pagamento.

### Relacionamentos

Cada pedido referencia um comprador (users), um vendedor (users) e um produto (products). Imagens pertencem a produtos. Perfis de vendedor estendem usuários. Repasses derivam de pedidos aprovados. Categorias podem ter categorias pai, formando hierarquia.

### Dados de demonstração

A migration inicial cria três usuários de teste, todos com senha `123456`:

- Comprador: comprador@teste.com
- Vendedor: vendedor@teste.com
- Admin: admin@teste.com

Também semeia quatro categorias, seis produtos, dois pedidos e um repasse, permitindo explorar todos os fluxos imediatamente após subir a aplicação.

**Traduzindo:** o banco é a memória persistente do marketplace. Toda informação que precisa sobreviver a reinicializações, contas, anúncios, pedidos, repasses, vive nessas tabelas, acessadas exclusivamente pelo backend.

---

## Integrações externas

Apesar de ser um MVP, o Super Market Shop se conecta a serviços externos para funcionalidades específicas.

### Cloudflare R2

Armazenamento de objetos compatível com a API S3 da Amazon. Utilizado para dois tipos de arquivo:

- **Imagens de produtos** — enviadas pelo vendedor no cadastro de anúncios (pasta `produtos/` no bucket).
- **Comprovantes de pagamento** — enviados pelo comprador no checkout (pasta `receipts/` no bucket).

O banco de dados guarda apenas a URL pública do arquivo, nunca o binário. O fluxo de upload funciona em duas etapas: primeiro o arquivo vai para o R2 via endpoint dedicado; depois, ao salvar o produto ou confirmar o comprovante, a URL retornada é persistida.

### ViaCEP

Serviço público brasileiro de consulta de CEP. Quando o comprador digita um CEP no carrinho ou checkout, a API consulta o ViaCEP e retorna rua, bairro, cidade e estado. O complemento e o número continuam sendo informados manualmente.

### Frete simulado

O cálculo de frete utiliza uma fórmula mock baseada em peso do produto e distância simulada entre CEPs de origem e destino. Não há integração com Correios, Melhor Envio ou transportadoras reais. Adequado para demonstração; em produção, seria substituído por uma API de cotação real.

### PIX manual

Não existe gateway de pagamento. A chave Pix exibida no checkout pertence à plataforma (configurável em `PlatformSettings.PixKey`). Todo o fluxo de confirmação de pagamento é manual: comprovante, análise humana e aprovação.

[INSERIR IMAGEM: upload ou comprovante]

Legenda sugerida: Arquivos enviados para a nuvem; o banco guarda apenas a referência (URL).

**Traduzindo:** as integrações externas complementam o MVP sem adicionar complexidade desnecessária. R2 resolve armazenamento de arquivos; ViaCEP melhora a experiência de endereço; frete e pagamento permanecem simulados de propósito.

---

### Pontos fortes

Apesar do escopo reduzido, o Super Market Shop entrega um fluxo completo de marketplace: catálogo, carrinho, checkout PIX, upload de comprovante, aprovação administrativa, repasse financeiro, gestão de vendedores e backoffice. O código está organizado, documentado e pronto para servir como referência de portfólio full stack.

---

## Conclusão

O Super Market Shop demonstra que é possível construir um marketplace funcional com catálogo, checkout, gestão de vendedores e backoffice administrativo, utilizando tecnologias modernas e uma arquitetura bem definida. Do ponto de vista do comprador, a experiência cobre descoberta, compra e acompanhamento. Do ponto de vista do vendedor, há onboarding, publicação de anúncios e gestão de vendas. Do ponto de vista do administrador, existe controle sobre usuários, categorias, pagamentos e repasses.

Tecnicamente, o projeto combina um frontend React com Vite e TypeScript, um backend .NET 9 em camadas DDD, persistência PostgreSQL via Dapper, autenticação JWT, armazenamento Cloudflare R2 e integração ViaCEP, tudo conectado por uma API REST com 28 endpoints documentados.

Construir este MVP foi um exercício completo de engenharia de software: desde a modelagem de domínio e regras de negócio até a experiência do usuário e deploy. Cada camada foi pensada para ser compreensível, evolutiva e representativa de um sistema real.

**Autora:** Kamila dos Santos Souza

**Todos os direitos reservados.** Este material, incluindo o código, a documentação e o conteúdo aqui descrito, é de propriedade de Kamila dos Santos Souza. Reprodução, distribuição ou uso comercial sem autorização prévia são proibidos.

Se este artigo foi útil, sinta-se à vontade para comentar, compartilhar ou entrar em contato. Adoraria ouvir sua opinião sobre abordagens de marketplace, arquitetura full stack ou desenvolvimento de MVPs.

#DesenvolvimentoWeb #React #DotNet #Marketplace #Portfolio #FullStack

---

## Post-resumo para o feed (opcional)

Use o texto abaixo como post curto no feed do LinkedIn, com link para o artigo completo:

---

Construí um marketplace completo do zero — e documentei tudo.

O Super Market Shop é um MVP inspirado no Mercado Livre, com fluxo real de compra: catálogo, carrinho, checkout via PIX, upload de comprovante, aprovação administrativa e repasse ao vendedor.

No artigo, explico:

- Como funcionam as jornadas de comprador, vendedor e administrador
- O fluxo completo de um pedido, do carrinho ao repasse
- A arquitetura full stack: React + .NET 9 + PostgreSQL + Cloudflare R2

Projeto desenvolvido por Kamila dos Santos Souza.

Leia o artigo completo: [link do artigo]

#DesenvolvimentoWeb #React #DotNet #Marketplace #FullStack

---

## Instruções para publicação no LinkedIn

1. Copie o conteúdo deste arquivo (da Introdução até as hashtags) para o editor de Artigos do LinkedIn.
2. Nos pontos marcados com `[INSERIR IMAGEM: ...]`, use o botão "Adicionar mídia" e faça upload da screenshot correspondente.
3. Defina a imagem de capa do artigo (sugestão: screenshot da home).
4. Revise ortografia e estilo antes de publicar.
5. Opcionalmente, publique o post-resumo no feed com link para o artigo.

### Checklist de imagens

1. Capa — Home do Super Market Shop (/)
2. Login — Tela de autenticação
3. Painel — Vendedor ou admin
4. Checkout — Chave Pix e resumo do pedido
5. Admin — Pagamentos pendentes (/admin/pagamentos)
6. Vendedor — Vendas com rastreio (/vendedor/vendas)
7. Detalhe — Página do produto (/produto/:id)
8. Carrinho — Itens e frete (/carrinho)
9. Novo produto — Formulário com upload (/vendedor/anuncios/novo)
10. Swagger — Documentação da API (/swagger)
11. Resposta login — Token JWT no Swagger ou DevTools
12. Upload — Comprovante ou imagem de produto
13. Terminal — Backend e frontend rodando (opcional)
