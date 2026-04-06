# 2. Requirements
Este capítulo descreve os requisitos do sistema WildLog, divididos em requisitos funcionais e requisitos não funcionais.
Os requisitos funcionais definem as funcionalidades que o sistema deve fornecer aos utilizadores "O quê?", enquanto os requisitos não funcionais estabelecem características e restrições relacionadas com desempenho, segurança, usabilidade e qualidade do sistema "Como?".

_______

## 2.1. Functional Requirements

### 2.1.1. Authentication Module
#### RF01 - Registo de Utilizador
O sistema deve permitir que novos utilizadores criem uma conta.
#### RF02 - Autenticação de Utilizador
O sistema deve permitir que utilizadores registados iniciem sessão na plataforma.
#### RF03 - Verificação de Email
O sistema deve enviar um email de verificação após o registo do utilizador para confirmar a validade do endereço de email.
#### RF04 - Recuperação de Password
O sistema deve permitir que os utilizadores recuperem a sua palavra-passe através de um mecanismo de redefinição por email.

### 2.1.2. Account Management Module
#### RF05 - Edição de Perfil
O sistema deve permitir que os utilizadores editem as suas informações de perfil.
#### RF06 - Password Management
O sistema deve permitir que os utilizadores alterem a sua palavra-passe.

### 2.1.3. Publications Module
#### RF07 - Criação de Publicação
O sistema deve permitir que os utilizadores criem uma nova publicação, titulo, descrição e upload de imagens sempre com localização associada.
#### RF08 - Edição de Publicação
O sistema deve permitir que os utilizadores editem as suas publicações existentes.
#### RF09 - Visibilidade da Publicação
O sistema deve permitir que os utilizadores definam e alterem a visibilidade da publicação como pública ou privada.
#### RF10 - Eliminação de Publicações
O sistema deve permitir que os utilizadores eliminem publicações que tenham criado.
#### RF11 - Visualização de Publicações
O sistema deve permitir que os utilizadores visualizem publicações disponíveis publicas de outros utilizadores e as seus posts privados.

### Public Post Creation
TODO

### 2.1.4. Environmental Ethics Verification Module
#### RF12 - Captura da Imagem Inicial
O sistema deve permitir que o utilizador capture uma imagem inicial do acampamento através da aplicação.
#### RF13 - Validação de Contexto de Campismo
O sistema deve analisar a imagem inicial para verificar a presença de elementos associados ao acampamento.
#### RF14 - Captura da Imagem Final
O sistema deve solicitar ao utilizador uma segunda imagem do local após o término do acampamento.
#### RF15  - Correspondência de Cenário
O sistema deve verificar se a segunda imagem corresponde ao mesmo local e enquadramento da imagem inicial.
#### RF16 - Verificação de Impacto Ambiental
O sistema deve analisar a imagem final para garantir que não existem vestígios de comportamentos ambientalmente inadequados.
#### RF17 - Validação de Publicação
O sistema deve apenas permitir que a publicação seja tornada pública após a validação bem-sucedida do processo de verificação ambiental.

### 2.1.5. Interactive Map Module

#### RF18 - Visualização de Mapa
O sistema deve fornecer um mapa interativo para os utilizadores visualizarem as localizações associadas às publicações.
#### RF19 - Navegação no Mapa
O sistema deve permitir que os utilizadores naveguem pelo mapa através de zoom e deslocamento.
#### RF20 - Marcadores de Publicações
O sistema deve apresentar marcadores no mapa que representem as localizações das publicações públicas.
_______

## Non-Functional Requirements

#### RNF01 - Usabilidade
A interface da plataforma deve ser intuitiva e de fácil utilização, permitindo que utilizadores com diferentes níveis de experiência tecnológica consigam utilizar a aplicação.
#### RNF02 - Segurança
O sistema deve garantir a segurança das contas dos utilizadores através de mecanismos adequados de autenticação e proteção das credenciais armazenadas.
#### RNF03 - Desempenho
O sistema deve responder às ações do utilizador num tempo inferior a 2 segundos em condições normais de utilização.
#### RNF04 - Disponibilidade
A plataforma deve estar disponível continuamente para acesso através da web.
#### RNF05 - Compatibilidade e Responsividade
O sistema deve ser compatível com os principais navegadores web modernos e responsivo para diferentes tamanhos de ecrã, incluindo dispositivos móveis.
#### RNF06 - Escalabilidade
A arquitetura do sistema deve permitir suportar o aumento do número de utilizadores e publicações sem degradação significativa do desempenho.
#### RNF07 - Integridade dos Dados
O sistema deve garantir a consistência e integridade dos dados armazenados na base de dados.
#### RNF08 - Captura de Imagens na Aplicação
As imagens utilizadas no processo de verificação ambiental devem ser captadas diretamente através da aplicação, não sendo permitido o upload de imagens externas.
#### RNF09 - Processamento de Imagem
O sistema deve utilizar algoritmos de computer vision para analisar e comparar as imagens utilizadas no processo de verificação ambiental.
