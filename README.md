# Defrag98

Uma experiência retrô de desfragmentação **inteiramente virtual**, com Canvas 2D e áudio generativo. Nenhum arquivo ou disco real é acessado.

## Executar

Node.js 22.13+ e npm.

```sh
npm --prefix site ci
npm run dev
```

Abra a URL exibida pelo Vite. Clique em **Start Defrag** para iniciar os movimentos e habilitar áudio. Pause congela o processo; Restart gera outro disco (continua rodando se já estava em execução). Volume inicial: 18%. Auto loop aguarda quatro segundos após 100% antes de gerar outro disco.

## Implementado

- React + TypeScript + Vite, sem backend ou biblioteca visual pesada.
- 4.096 clusters no desktop e 1.024 em telas inicialmente menores que 600 px.
- Arquivos virtuais de tamanhos variados, seed determinística, blocos de sistema e reservados fixos, fila de transferências para espaços livres.
- Start, Pause, Resume, Restart, velocidade de 0,25× a 16× e progresso real da fila.
- Web Audio com notas pentatônicas, envelopes suaves, máximo de quatro vozes e limitação de eventos.
- Mute, volume, fullscreen, loop, Relax Mode e CRT sutil.
- Teclado nativo, labels acessíveis, redução de movimento do sistema e controle manual.
- Canvas independente de React, pausa de avanço em aba oculta, renderização ociosa evitada e suporte a resize/DPR.

A interface aproveita a largura da tela, inclusive ultrawide, e oferece quatro visualizações: **Original**, **Windows 98**, **Futuristic** e **Rainbow**. A troca altera janela, controles, legenda e Canvas sem reiniciar o disco. A preferência fica salva neste navegador. O tema Windows 98 recria a aparência clássica com blocos ciano, fundo branco e controles Stop/Pause/Legend/Hide Details; mantém os recursos da simulação web, sem ser uma cópia pixel a pixel do executável original.

Screensaver automático e Easter eggs permanecem fora do escopo atual.

## Validar

```sh
npm test
npm run build
npm --prefix site exec playwright install chromium
npm run test:e2e
```

Build estático em `dist/` na raiz (e `site/dist/`). `npm run preview` serve o build local. Testes Vitest verificam determinismo, conservação de clusters, blocos fixos, integridade de transferências, pausa, reset e conclusão. Playwright cobre fluxos principais, teclado, fullscreen, loop e viewport móvel. Veja [QA](docs/QA.md) para evidências e limitações.

## Arquitetura

- `site/src/canvas/simulation.ts`: dados, planejamento de movimentos e relógio determinístico.
- `site/src/canvas/renderer.ts`: desenho Canvas, resize e invalidação.
- `site/src/audio/audioEngine.ts`: contexto e síntese sonora após gesto do usuário.
- `site/src/App.tsx`: controles, ciclo de animação e loop.
- `site/src/webmcp.ts`: leitura de status e pausa quando o navegador oferece essa API opcional.

A estrutura inicial do Sites foi adaptada para uma SPA estática Vite: o projeto não necessita servidor, RSC, banco, autenticação ou componentes de UI adicionais. Essa decisão segue o escopo leve de [projeto.md](docs/projeto.md).

## Publicação e Git

`main` é a branch principal de [RafaBotossi/defrag98](https://github.com/RafaBotossi/defrag98). O workflow de CI executa testes, build e Playwright em pushes e pull requests. Após validar um push na `main`, publica automaticamente `dist/` no [GitHub Pages](https://rafabotossi.github.io/defrag98/). Nas configurações do Pages, a origem é **GitHub Actions**.

Cloudflare Pages: diretório raiz do repositório; comando `npm --prefix site ci && npm run build`; saída `dist`. Os headers de segurança e cache estão em `site/public/_headers`. Vercel: mesmas configurações de build/saída. GitHub Pages: publique o conteúdo de `dist`; os assets usam caminhos relativos para suportar `/defrag98/`.

A configuração `.openai/hosting.json` também permite publicação privada via Sites. Credenciais nunca são gravadas no repositório.

As especificações originais permanecem em `docs/agents.md`, `docs/projeto.md` e `docs/README.md`.
