# Equilíbrio — GitHub Pages

Esta é a versão **100% estática** do Equilíbrio para publicar diretamente no GitHub Pages.

## Publicação
1. Extraia a pasta `Equilíbrio`.
2. Coloque o conteúdo dela na raiz do seu repositório GitHub.
3. No GitHub, abra **Settings → Pages**.
4. Em **Source**, escolha **Deploy from a branch**.
5. Selecione a branch principal e `/ (root)**.
6. Salve. O arquivo de entrada é `index.html`.

## O que foi removido
- `server.js`
- `package.json`
- SQLite
- necessidade de Node.js/Termux para executar o site

## Banco local
O projeto usa **IndexedDB**, banco de dados nativo do navegador, para guardar usuários, check-ins, gatilhos, planos e dados de apoio. A sessão usa armazenamento local.

O cadastro verifica se o e-mail já existe e o login verifica se a senha corresponde à conta cadastrada. A senha não fica armazenada em texto puro; é usado hash SHA-256 com salt.

### Limitação importante
Como o GitHub Pages só hospeda arquivos estáticos, esta autenticação é adequada para **protótipo, trabalho acadêmico e demonstração**, mas não deve ser tratada como autenticação de produção. Os dados ficam no navegador daquele dispositivo e não são compartilhados com outros dispositivos.

Para produção, a aplicação precisaria de um backend seguro e banco de dados no servidor.

## Funcionalidades incluídas
- Login e cadastro
- Objetivo do usuário
- Check-in diário
- Humor, consumo, craving 0–10 e gatilhos
- Mapa de gatilhos
- Plano de prevenção
- Apoio rápido e mensagem para pessoa de confiança
- Recompensas por número de check-ins
- Progresso
- Conteúdos educativos
- Tema claro/escuro
- Exportação dos dados
- Exclusão da conta e dados locais
- Layout responsivo

## Segurança e saúde
O Equilíbrio é uma ferramenta de apoio/educação e não substitui diagnóstico ou acompanhamento profissional.

A abstinência de álcool pode ser perigosa em pessoas com dependência. O sistema não orienta interrupção abrupta sem avaliação médica. Em situação de risco imediato, procure atendimento de emergência ou uma pessoa de confiança.
