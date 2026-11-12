# Revoada — protótipo

Jogo de tiro ao alvo para telão: cada pessoa usa o próprio celular como mira (giroscópio), sem instalar nada.

## Rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000`.

## Deixar acessível para os celulares (HTTPS é obrigatório)

Os navegadores só liberam o giroscópio em páginas HTTPS. O jeito mais rápido de testar é um túnel:

```bash
# em outro terminal, com o servidor rodando
npx cloudflared tunnel --url http://localhost:3000
```

Ele mostra um endereço `https://algo.trycloudflare.com`. **Abra esse endereço no computador do telão** (não o localhost), assim o QR code já aponta para o lugar certo. Alternativa: `ngrok http 3000`.

Para uso contínuo no shopping, publique em um serviço como Render, Railway ou Fly.io (precisa suportar WebSocket) e abra a URL do serviço no telão.

## Como jogar

1. Telão: abra a página principal e coloque em tela cheia (F11).
2. Jogadores escaneiam o QR code, digitam o nome e tocam em **Entrar**. No iPhone, aceitam o pedido de acesso ao movimento.
3. Seguram o celular como um controle, com o topo apontando para o telão, e tocam em **Centralizar**.
4. Enquanto esperam, já dá para treinar a mira nos pássaros.
5. Alguém clica em **Começar partida** no telão: 60 segundos, pássaro comum vale 100, o dourado vale 300.
6. Fim da partida: ranking por 12 segundos e volta ao lobby.

Sem giroscópio (ou testando pelo computador), o controle cai sozinho em **modo touchpad**: arrastar no quadro move a mira.

## Ajustes rápidos

- Sensibilidade: `RANGE_X` e `RANGE_Y` em `public/controller.html` (graus de giro para cruzar a tela).
- Duração da partida: `ROUND` em `public/screen.html`.
- Se a mira andar ao contrário em algum aparelho, os botões ⇆ e ⇅ do controle invertem os eixos (fica salvo no celular).

## Estrutura

- `server.js`: servidor Express + Socket.IO, repassa mira e tiros dos celulares para o telão e gera o QR code.
- `public/screen.html`: o jogo no telão (canvas).
- `public/controller.html`: o controle no celular.

## Próximos passos sugeridos

- Testar em vários modelos de celular (Android e iPhone) e ajustar sensibilidade.
- Roteador Wi-Fi próprio no estande, para latência baixa.
- Arte e sons próprios, tema do shopping ou de um patrocinador.
- Ranking do dia/semana e, se for captar contatos, termo de consentimento (LGPD).
