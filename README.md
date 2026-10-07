# Equilíbrio — MVP organizado

Projeto local de apoio à redução/interrupção do consumo de álcool, com Node.js + SQLite nativo.

## Estrutura

- `server.js` — API e servidor local
- `data/equilibrio.db` — banco SQLite criado automaticamente
- `public/index.html` — login
- `public/cadastro.html` — cadastro
- `public/principal.html` — painel inicial
- `public/checkin.html` — check-in diário
- `public/recompensas.html` — recompensas por número de check-ins
- `public/gatilhos.html` — mapa de gatilhos
- `public/plano.html` — plano de prevenção
- `public/apoio.html` — pessoa de confiança
- `public/conteudos.html` — biblioteca educativa
- `public/progresso.html` — progresso
- `public/configuracoes.html` — configurações e tema
- `public/css/style.css` — estilos
- `public/scripts/` — JavaScript separado por responsabilidade
- `public/imagens/` — logo e imagem ilustrativa substituíveis

## Executar no Termux

```bash
cd Equilíbrio
node server.js
```

Abra no navegador:

`http://localhost:3000`

O projeto não usa dependências externas. O backend usa `node:sqlite`, `crypto` e módulos nativos do Node.

## Autenticação

- Cadastro verifica se o e-mail já existe.
- Login verifica se o e-mail existe.
- A senha é comparada com hash `scrypt` + salt.
- Senhas não são armazenadas em texto puro.
- A sessão atual fica em memória; reiniciar o servidor exige novo login.

## Recompensas

As recompensas são baseadas na quantidade total de check-ins registrados, não em uma sequência de dias sem beber. Os nomes das empresas e descontos são exemplos para você substituir.

## Imagens

Você pode substituir manualmente:
- `public/imagens/logo.svg`
- `public/imagens/auth-illustration.svg`

sem precisar alterar o restante do sistema.

> Este MVP é educacional/de apoio e não diagnostica transtornos. Em situações de uso pesado, a interrupção abrupta do álcool pode causar abstinência perigosa e deve ser avaliada por profissional de saúde.
