# 3. Use Cases
Cada caso de uso representa uma interação específica entre um utilizador e o sistema, detalhando as ações realizadas e os resultados esperados.

<hr style="height:3px;background:rgba(250,209,2,0.17);border:none">

## 2.1. Use Cases

### 2.1.1. Authentication

| Actor      | Process                 | Critical State |
|------------|-------------------------|----------------|
| Visitante  | Visualizar feed público |                |
| Visitante  | Registar uma conta      | *              |
| Visitante  | Confirmar o email       | *              |
| Utilizador | Fazer login             |                |
| Utilizador | Fazer logout            |                |
| Utilizador | Recuperar password      | *              |

### 2.1.2. Account Management

| Actor      | Process           | Critical State |
|------------|-------------------|----------------|
| Utilizador | Visualizar perfil |                |
| Utilizador | Editar perfil     |                |
| Utilizador | Alterar avatar    |                |
| Utilizador | Alterar password  |                |
| Utilizador | Eliminar conta    |                |

### 2.1.3. Publications

| Actor      | Process                    | Critical State |
|------------|----------------------------|----------------|
| Utilizador | Criar post                 | *              |
| Utilizador | Editar post                |                |
| Utilizador | Eliminar post              |                |
| Utilizador | Visualizar posts (mapa)    |                |
| Utilizador | Visualizar posts (feed)    |                |
| Utilizador | Visualizar posts (near-by) | *              |
| Utilizador | Interagir com post         | *              |

### 2.1.4. Environmental Ethics Verification

| Actor   | Process                                | Critical State |
| ------- | -------------------------------------- | -------------- |
| Sistema | Validar ética ambiental da publicação  | *              |


<hr style="height:3px;background:rgba(250,209,2,0.17);border:none">

## 2.2. Critical Use Cases

### 2.2.1. Registar uma conta

#### Cabeçalho
Nome: Registar uma conta

Actor principal:
Visitante

Resumo:
Permite que um visitante crie uma nova conta na plataforma,
fornecendo as informações necessárias para autenticação.

Referências:
- RF01 – Registar utilizador
- RF03 – Enviar email de verificação

#### Cenário Principal (fluxo típico)
| Ação do Actor                                   | Resposta do Sistema                               |
| ----------------------------------------------- | ------------------------------------------------- |
| 1 Visitante seleciona "Registar conta"          |                                                   |
|                                                 | 2 Sistema apresenta formulário de registo         |
| 3 Visitante introduz username, email e password |                                                   |
| 4 Visitante submete o formulário                |                                                   |
|                                                 | 5 Sistema valida os dados                         |
|                                                 | 6 Sistema cria a conta em estado "não verificada" |
|                                                 | 7 Sistema envia email de verificação              |
|                                                 | 8 Sistema apresenta mensagem de confirmação       |

#### Cenários Alternativos

##### A1 – Email já registado

| Nº | Alternativa                        |
| -- | ---------------------------------- |
| 5  | Sistema detecta email já registado |
| 6  | Sistema apresenta mensagem de erro |
| 7  | Caso de utilização termina         |

##### A2 – Dados inválidos

| Nº | Alternativa                              |
| -- | ---------------------------------------- |
| 5  | Sistema detecta campos inválidos         |
| 6  | Sistema apresenta mensagens de validação |

__

### 2.2.3. Confirmar o email

#### Cabeçalho
Nome: Confirmar o email

Actor principal:
Visitante

Resumo:
Permite que um utilizador valide o seu endereço de email após o registo de uma conta.
O sistema envia automaticamente um email contendo um link com um token de verificação. Ao aceder ao link, o sistema valida o token e ativa a conta.

Referências:
RF03 – Enviar email de verificação

#### Cenário Principal (fluxo típico)

| Ação do Actor                                              | Resposta do Sistema                                       |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| 1 Visitante recebe email de verificação após o registo     |                                                           |
| 2 Visitante abre o email e seleciona o link de verificação |                                                           |
|                                                            | 3 Sistema recebe o token de verificação                   |
|                                                            | 4 Sistema valida o token                                  |
|                                                            | 5 Sistema altera o estado da conta para *verificada*    |
|                                                            | 6 Sistema invalida o token de verificação                 |
|                                                            | 7 Sistema apresenta mensagem de confirmação               |
|                                                            | 8 Sistema redireciona o utilizador para a página de login |

#### Cenários Alternativos

##### A1 – Token inválido ou expirado

| Passo | Alternativa                                         |
| ----- | --------------------------------------------------- |
| 4     | Sistema detecta token inválido ou expirado          |
| 5     | Sistema apresenta mensagem de erro                  |
| 6     | Utilizador pode solicitar novo email de verificação |

#### A2 – Conta já verificada

| Passo | Alternativa                                    |
| ----- | ---------------------------------------------- |
| 4     | Sistema detecta que a conta já foi verificada  |
| 5     | Sistema informa que o email já está confirmado |
| 6     | Sistema redireciona para a página de login     |

__

### 2.2.4. Recuperar password

#### Cabeçalho
Nome: Recuperar password

Actor principal:
Visitante

Resumo:
Permite que um utilizador recupere o acesso à conta através
de um email de redefinição de password.

Referências:
RF04 – Recuperação de password

#### Cenário Principal (fluxo típico)

| Ação do Actor                                               | Resposta do Sistema                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| 1 Utilizador seleciona "Esqueci-me da password"             |                                                            |
|                                                             | 2 Sistema apresenta formulário para introdução do email    |
| 3 Utilizador introduz email                                 |                                                            |
| 4 Utilizador submete pedido                                 |                                                            |
|                                                             | 5 Sistema valida o email                                   |
|                                                             | 6 Sistema gera token de recuperação                        |
|                                                             | 7 Sistema envia email com link de recuperação              |
|                                                             | 8 Sistema apresenta mensagem de confirmação                |
| 9 Utilizador abre o email e seleciona o link de recuperação |                                                            |
|                                                             | 10 Sistema valida o token de recuperação                   |
|                                                             | 11 Sistema apresenta formulário para redefinir password    |
| 12 Utilizador introduz nova palavra-passe e confirmação     |                                                            |
| 13 Utilizador submete o formulário                          |                                                            |
|                                                             | 14 Sistema valida as duas palavras-passe                   |
|                                                             | 15 Sistema atualiza a palavra-passe na base de dados       |
|                                                             | 16 Sistema invalida o token de recuperação                 |
|                                                             | 17 Sistema redireciona o utilizador para a página de login |

#### Cenários Alternativos

##### A1 – Email não existe

| Passo | Alternativa                         |
| ----- | ----------------------------------- |
| 5     | Sistema não encontra o email        |
| 6     | Sistema apresenta mensagem genérica |
| 7     | Caso de utilização termina          |

##### A2 — Token inválido ou expirado

| Passo | Alternativa                                |
| ----- | ------------------------------------------ |
| 10    | Sistema detecta token inválido ou expirado |
| 11    | Sistema apresenta mensagem de erro         |
| 12    | Utilizador pode solicitar nova recuperação |

##### A3 — Passwords não coincidem

| Passo | Alternativa                                    |
| ----- | ---------------------------------------------- |
| 14    | Sistema detecta que as passwords não coincidem |
| 15    | Sistema apresenta mensagem de erro             |
| 16    | Utilizador pode corrigir os campos             |

__

### 2.2.5. Criar post

#### Cabeçalho
Nome: Criar post

Actor principal:
Utilizador

Resumo:
Permite que um utilizador crie uma nova publicação na plataforma, incluindo título, descrição, localização geográfica e imagens.
O sistema valida os dados, processa e otimiza as imagens, e define o estado da publicação consoante a visibilidade escolhida.

Referências:
RF07 – Criação de publicação
RF09 - Visibilidade da publicação

#### Cenário Principal (fluxo típico)
| Ação do Actor                                          | Resposta do Sistema                                        |
| ------------------------------------------------------ |------------------------------------------------------------|
| 1 Utilizador seleciona "Criar post"                    |                                                            |
|                                                        | 2 Sistema apresenta formulário de criação de post          |
| 3 Utilizador introduz título, descrição e localização  |                                                            |
| 4 Utilizador adiciona uma ou mais imagens              |                                                            |
| 5 Utilizador escolhe visibilidade (pública ou privada) |                                                            |
| 6 Utilizador submete o formulário                      |                                                            |
|                                                        | 7 Sistema valida os dados obrigatórios                     |
|                                                        | 8 Sistema valida o tamanho das imagens (máx. 5MB cada)     |
|                                                        | 9 Sistema processa e comprime imagens para formato *WebP* |
|                                                        | 10 Sistema faz upload das imagens para o servidor          |
|                                                        | 11 Sistema cria o registo do post na base de dados         |
|                                                        | 12 Sistema associa imagens ao post                         |
|                                                        | 13 Sistema define estado do post:                          |
|                                                        | → *"pending_review"* se público                          |
|                                                        | → *"private"* se privado                                 |
|                                                        | 14 Sistema guarda data de criação                          |
|                                                        | 15 Sistema apresenta confirmação ao utilizador             |
|                                                        | 16 Sistema redireciona para visualização do post ou feed   |

#### Cenários Alternativos

##### A1 – Dados obrigatórios em falta
| Passo | Alternativa                                  |
| ----- | -------------------------------------------- |
| 7     | Sistema detecta campos obrigatórios em falta |
| 8     | Sistema apresenta mensagens de validação     |
| 9     | Utilizador pode corrigir os dados            |

##### A2 - Imagem excede tamanho permitido
| Passo | Alternativa                            |
| ----- | -------------------------------------- |
| 8     | Sistema detecta imagem superior a 5MB  |
| 9     | Sistema rejeita a imagem               |
| 10    | Sistema apresenta mensagem de erro     |
| 11    | Utilizador pode selecionar nova imagem |

##### A3 - Falha no upload das imagens
| Passo | Alternativa                           |
| ----- | ------------------------------------- |
| 10    | Ocorre erro durante upload            |
| 11    | Sistema cancela o processo de criação |
| 12    | Sistema apresenta mensagem de erro    |

##### A4 - Falha no processamento das imagens
| Passo | Alternativa                              |
| ----- | ---------------------------------------- |
| 9     | Sistema não consegue converter para WebP |
| 10    | Sistema apresenta erro                   |
| 11    | Caso de utilização termina               |

##### A5 - Publicação privada
| Passo | Alternativa                                  |
| ----- | -------------------------------------------- |
| 13    | Sistema define visibilidade como *privada* |
| 14    | Post fica visível apenas para o utilizador   |
| 15    | Não é enviado para validação ambiental       |

##### A6 - Publicação pública (validação ambiental)
| Passo | Alternativa                                   |
| ----- | --------------------------------------------- |
| 13    | Sistema define estado como *pending_review* |
| 14    | Post fica pendente de validação ambiental     |
| 15    | Post não é visível publicamente até aprovação |

__

### 2.2.6. Visualizar posts (near-by)

#### Cabeçalho
Nome: Visualizar posts (near-by)

Actor principal:
Utilizador

Resumo:
Permite que um utilizador explore publicações geograficamente próximas através de um mapa interativo.
O sistema apresenta posts com base na área visível do mapa ou na proximidade do utilizador, carregando dinamicamente os dados conforme a navegação.

Referências:
RF11 – Visualização de publicações

#### Cenário Principal (fluxo típico)
| Ação do Actor                                            | Resposta do Sistema                                         |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| 1 Utilizador acede à funcionalidade de exploração (mapa) |                                                             |
|                                                          | 2 Sistema inicializa o mapa interativo                      |
|                                                          | 3 Sistema obtém localização atual (quando permitido)        |
|                                                          | 4 Sistema calcula área geográfica visível                   |
|                                                          | 5 Sistema solicita ao backend os posts dentro da área       |
|                                                          | 6 Sistema filtra apenas posts visíveis (ex: *approved*)   |
|                                                          | 7 Sistema apresenta os posts no mapa como marcadores (pins) |
| 8 Utilizador navega no mapa (zoom, pan ou rotação)       |                                                             |
|                                                          | 9 Sistema deteta evento de movimento (ex: onMoveEnd)      |
|                                                          | 10 Sistema recalcula a nova área visível                    |
|                                                          | 11 Sistema solicita novos posts ao backend                  |
|                                                          | 12 Sistema atualiza os marcadores no mapa                   |
| 13 Utilizador observa os posts apresentados              |                                                             |
| 14 Utilizador seleciona um marcador (post)               |                                                             |
|                                                          | 15 Sistema apresenta detalhes do post (ex: card ou modal)   |

#### Cenários Alternativos

##### A1 – Localização não permitida
| Passo | Alternativa                                              |
| ----- | -------------------------------------------------------- |
| 3     | Utilizador recusa acesso à localização                   |
| 4     | Sistema utiliza área padrão (ex: global ou última vista) |
| 5     | Fluxo continua normalmente                               |

##### A2 – Nenhum post encontrado na área
| Passo | Alternativa                                 |
| ----- | ------------------------------------------- |
| 6     | Sistema não encontra posts na área          |
| 7     | Sistema apresenta mensagem "Sem resultados" |
| 8     | Utilizador pode mover o mapa                |

##### A3 - Posts não aprovados ou privados
| Passo | Alternativa                                              |
| ----- | -------------------------------------------------------- |
| 6     | Sistema exclui posts com estado *pending_review*       |
|       | Sistema exclui posts *privados* de outros utilizadores |
|       | Apenas posts válidos são apresentados                    |

##### A4 – Carregamento incremental (lazy loading)
| Passo | Alternativa                                            |
| ----- | ------------------------------------------------------ |
| 11    | Sistema utiliza paginação por cursor                   |
| 12    | Sistema adiciona novos posts sem remover os existentes |
| 13    | Interface mantém fluidez e performance                 |

__

### 2.2.7. Interagir com post

#### Cabeçalho
Nome: Interagir com post

Actor principal:
Utilizador

Resumo:
Permite que um utilizador interaja com uma publicação através de diferentes ações, incluindo marcar como favorito, comentar ou utilizar gestos de swipe para guardar ou ignorar posts.
O sistema regista essas interações e atualiza o estado da publicação em tempo real.

Referências:
RFXX - Marcar publicação como favorita
RFXX - Comentar publicação
RFXX – Interações por swipe (guardar/ignorar)

#### Cenário Principal (fluxo típico)
| Ação do Actor                                                | Resposta do Sistema                   |
| ------------------------------------------------------------ | ------------------------------------- |
| 1 Utilizador visualiza um post                               |                                       |
| 2 Utilizador escolhe uma ação (favoritar, comentar ou swipe) |                                       |
|                                                              | 3 Sistema recebe a ação do utilizador |

##### Fluxo A – Marcar como favorito
| Ação do Actor                       | Resposta do Sistema                          |
| ----------------------------------- | -------------------------------------------- |
| 4A Utilizador seleciona "favoritar" |                                              |
|                                     | 5A Sistema regista o like/favorito           |
|                                     | 6A Sistema atualiza contador de favoritos    |
|                                     | 7A Sistema atualiza interface (estado ativo) |

##### Fluxo B – Comentar publicação
| Ação do Actor                       | Resposta do Sistema                         |
| ----------------------------------- | ------------------------------------------- |
| 4B Utilizador escreve um comentário |                                             |
| 5B Utilizador submete o comentário  |                                             |
|                                     | 6B Sistema valida o conteúdo                |
|                                     | 7B Sistema guarda o comentário              |
|                                     | 8B Sistema atualiza lista de comentários    |
|                                     | 9B Sistema atualiza contador de comentários |

##### Fluxo C – Swipe para guardar ou ignorar
| Ação do Actor                                     | Resposta do Sistema                   |
| ------------------------------------------------- | ------------------------------------- |
| 4C Utilizador faz swipe para a direita (guardar)  |                                       |
|                                                   | 5C Sistema regista post como guardado |
|                                                   | 6C Sistema apresenta próximo post     |
| 7C Utilizador faz swipe para a esquerda (ignorar) |                                       |
|                                                   | 8C Sistema regista ação de "skip"     |
|                                                   | 9C Sistema apresenta próximo post     |

#### Cenários Alternativos

##### A1 – Utilizador não autenticado
| Passo | Alternativa                               |
| ----- | ----------------------------------------- |
| 3     | Sistema deteta utilizador não autenticado |
| 4     | Sistema bloqueia ação                     |
| 5     | Sistema redireciona para login            |

##### A2 – Erro ao registar interação
| Passo | Alternativa                        |
| ----- |------------------------------------|
| 5A    | Ocorre erro ao guardar interação   |
| 6A    | Sistema apresenta mensagem de erro |

##### A3 - Post indisponivel
| Passo | Alternativa                   |
| ----- | ----------------------------- |
| 1     | Post foi removido ou alterado |
| 2     | Sistema impede interação      |
| 3     | Sistema atualiza feed         |

____

### 2.2.8. Validar ética ambiental da publicação

#### Cabeçalho

Nome: Validar ética ambiental da publicação

Actor principal:  
Sistema

Resumo:  
Permite ao sistema avaliar automaticamente se uma publicação respeita princípios de ética ambiental, através da análise de imagens utilizando modelos de computer vision.  
O sistema verifica a presença de atividade de campismo, a consistência entre imagens e a existência de impactos negativos no ambiente, determinando se a publicação pode ser aprovada.

Referências:  
RF15 – Validação automática de ética ambiental  
RF16 – Processamento de imagens com computer vision  
RF17 – Classificação de impacto ambiental

#### Cenário Principal (fluxo típico)

| Ação do Actor                                              | Resposta do Sistema                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| 1 Sistema recebe publicação com imagens (estado pending)    |                                                                   |
|                                                            | 2 Sistema seleciona duas imagens para análise                     |
|                                                            | 3 Sistema analisa a primeira imagem                               |
|                                                            | 4 Sistema deteta objetos relacionados com campismo               |
|                                                            | 5 Sistema analisa a segunda imagem                               |
|                                                            | 6 Sistema compara o fundo/ambiente entre as duas imagens         |
|                                                            | 7 Sistema confirma que ambas pertencem à mesma região            |
|                                                            | 8 Sistema analisa a segunda imagem para detetar lixo ou danos    |
|                                                            | 9 Sistema avalia os resultados das análises                      |
|                                                            | 10 Sistema determina conformidade ambiental                      |
|                                                            | 11 Sistema atualiza o estado da publicação:                      |
|                                                            | → *approved* se estiver conforme                               |
|                                                            | → *rejected* se violar princípios ambientais                   |
|                                                            | 12 Sistema guarda o resultado da validação                       |

---

#### Cenários Alternativos

##### A1 – Não são detetados objetos de campismo

| Passo | Alternativa                                                |
| ----- | ---------------------------------------------------------- |
| 4     | Sistema não deteta elementos de campismo                   |
| 5     | Sistema considera validação inconclusiva ou inválida       |
| 6     | Publicação pode ser rejeitada ou marcada para revisão      |

---

##### A2 – Imagens não correspondem à mesma localização

| Passo | Alternativa                                                |
| ----- | ---------------------------------------------------------- |
| 6     | Sistema deteta inconsistência entre fundos                 |
| 7     | Sistema assume possível manipulação ou erro               |
| 8     | Publicação é rejeitada                                     |

---

##### A3 – Detetado lixo ou danos ambientais

| Passo | Alternativa                                                |
| ----- | ---------------------------------------------------------- |
| 8     | Sistema identifica lixo ou impacto negativo                |
| 9     | Sistema classifica como violação ambiental                 |
| 10    | Publicação é rejeitada                                     |

---

##### A4 – Falha no processamento de imagens

| Passo | Alternativa                                                |
| ----- | ---------------------------------------------------------- |
| 3/5   | Ocorre erro no modelo de computer vision                   |
| 6     | Sistema não consegue concluir análise                      |
| 7     | Publicação é marcada para revisão manual ou rejeitada      |

---

##### A5 – Resultado inconclusivo

| Passo | Alternativa                                                |
| ----- | ---------------------------------------------------------- |
| 9     | Sistema não consegue determinar resultado com confiança    |
| 10    | Publicação é marcada como *pending_review*               |
| 11    | Requer validação manual                                    |