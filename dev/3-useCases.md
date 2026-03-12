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
| Utilizador | Alterar password  | *              |
| Utilizador | Eliminar conta    | *              |

### 2.1.2. Publications

| Actor      | Process            | Critical State |
|------------|--------------------|----------------|
| Utilizador | Criar post         |                |
| Utilizador | Editar post        |                |
| Utilizador | Eliminar post      |                |
| Utilizador | Visualizar post    |                |
| Utilizador | Interagir com post |                |

### 2.1.3. Environmental Ethics Verification

| Actor      | Process             | Critical State |
|------------|---------------------|----------------| 

<hr style="height:3px;background:rgba(250,209,2,0.17);border:none">

## 2.2. Critical Use Cases

### 2.2.1. Registar uma conta

#### Cabeçalho
Nome: Registar uma conta

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

____

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
|                                                            | 5 Sistema altera o estado da conta para **verificada**    |
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

____

### 2.2.3. Recuperar password

#### Cabeçalho

Nome: Recuperar password

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

____