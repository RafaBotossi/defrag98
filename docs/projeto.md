# Defrag98 — Projeto

## 1. Visão

Defrag98 é uma experiência web retrô inspirada no visual dos desfragmentadores de disco dos anos 90, especialmente na sensação visual do Windows 98.

O objetivo não é reproduzir literalmente um produto da Microsoft, mas criar uma experiência nostálgica original com:

- blocos/clusters coloridos se reorganizando;
- animação contínua e hipnótica;
- áudio generativo suave e agradável;
- estética CRT / desktop dos anos 90;
- modo de tela cheia;
- experiência que possa ficar rodando como ambientação/screen saver;
- funcionamento totalmente no navegador, sem backend obrigatório.

Nome provisório: **Defrag98**.

---

## 2. Objetivos

### Objetivo principal
Criar um site visualmente bonito, relaxante e nostálgico, no qual uma simulação de desfragmentação reorganiza milhares de blocos enquanto gera som procedural sincronizado.

### Objetivos secundários

- Ser leve e rápido.
- Funcionar bem em desktop.
- Ser publicável em Cloudflare Pages, Vercel ou GitHub Pages.
- Ter arquitetura simples.
- Permitir evolução futura com novos temas e modos visuais.
- Não depender de arquivos de áudio grandes.
- Ser visualmente interessante mesmo sem som.

---

## 3. Stack sugerida

- React
- TypeScript
- Vite
- HTML Canvas 2D
- Web Audio API
- CSS puro ou CSS Modules
- Vitest para testes unitários
- Playwright para testes end-to-end

Evitar bibliotecas pesadas sem necessidade.

---

## 4. Estrutura sugerida

```text
src/
  components/
    DefragWindow/
    ControlPanel/
    Legend/
    StatusBar/
    AudioControls/
  canvas/
    renderer.ts
    simulation.ts
    cluster.ts
    effects.ts
  audio/
    audioEngine.ts
    soundMapping.ts
  hooks/
    useDefragSimulation.ts
    useAudioEngine.ts
  state/
    settings.ts
  styles/
    globals.css
    crt.css
  App.tsx
  main.tsx

public/
  icons/

agents.md
projeto.md
README.md
```

---

## 5. Conceito visual

### Janela principal

A aplicação deve lembrar um utilitário de sistema antigo, mas sem copiar marcas ou interfaces proprietárias literalmente.

Elementos esperados:

- barra de título retrô;
- painel central de clusters;
- legenda de cores;
- percentual de progresso;
- contador de clusters;
- indicador de atividade;
- botões Start / Pause / Restart;
- controle de velocidade;
- controle de volume;
- opção Fullscreen;
- opção Relax Mode.

### Canvas

O canvas representa um disco dividido em células.

Exemplo:

```text
■■□□■□□■■■□■□□□■■□□■
□□■■□□■□□□■■□□■□□■■□
■□□□■■□□■□□□■■■□□□■□
```

Durante a execução, os blocos se movimentam gradualmente em direção a regiões organizadas.

A animação não deve simplesmente trocar o estado final instantaneamente.

Os blocos precisam transmitir sensação de movimento e atividade de disco.

---

## 6. Estados de cluster

Sugestão de tipos:

- FREE
- USED
- SYSTEM
- MOVING
- TARGET
- LOCKED
- RECENTLY_MOVED

Cada tipo possui representação visual própria.

As cores podem ser inspiradas em interfaces antigas, sem reproduzir fielmente uma paleta protegida.

---

## 7. Simulação

A simulação é fictícia, mas deve parecer coerente.

### Inicialização

Gerar um disco virtual contendo:

- blocos livres;
- arquivos pequenos;
- arquivos grandes;
- arquivos fragmentados;
- alguns blocos reservados;
- alguns blocos de sistema.

Cada arquivo virtual deve possuir:

```ts
interface VirtualFile {
  id: number;
  size: number;
  clusterIds: number[];
  colorGroup?: number;
}
```

### Processo de desfragmentação

Fluxo sugerido:

1. Analisar o próximo arquivo fragmentado.
2. Procurar uma região livre suficientemente grande.
3. Marcar origem e destino.
4. Mover clusters progressivamente.
5. Atualizar percentual.
6. Atualizar contador de movimentos.
7. Disparar eventos de áudio.
8. Repetir até atingir estado organizado.

Ao chegar em 100%:

- exibir `Optimization complete`;
- manter o estado por alguns segundos;
- opcionalmente reiniciar com nova fragmentação;
- modo Loop deve vir habilitado por padrão.

---

## 8. Performance

O canvas deve suportar milhares de células.

Regras:

- não renderizar cada cluster como componente React;
- React controla apenas UI e configurações;
- a grade é desenhada diretamente no Canvas;
- usar `requestAnimationFrame`;
- evitar allocations dentro do loop principal;
- usar arrays/typed arrays quando útil;
- calcular apenas os clusters alterados quando possível;
- limitar efeitos caros em dispositivos mais lentos.

Meta inicial:

- 60 FPS em desktop moderno;
- pelo menos 30 FPS em hardware mais simples.

---

## 9. Áudio generativo

O áudio deve ser gerado com Web Audio API.

Não usar música contínua obrigatória.

A ideia é transformar o movimento dos clusters em pequenos sons agradáveis.

### Mapeamento sugerido

Posição horizontal:

```text
esquerda -> frequência baixa
centro   -> frequência média
direita  -> frequência alta
```

Tipo de cluster pode alterar:

- timbre;
- envelope;
- volume;
- duração.

### Sons

- pequenos clicks;
- blips;
- tons curtos;
- ruído filtrado discreto;
- pequenas notas harmônicas quando blocos chegam ao destino.

### Regras

- áudio deve começar apenas após interação do usuário;
- volume padrão baixo;
- evitar sons agressivos;
- nunca tocar centenas de sons simultaneamente;
- aplicar rate limit / pooling;
- oferecer botão Mute.

---

## 10. Relax Mode

Modo focado em ambientação.

Ao ativar:

- esconder controles desnecessários;
- ocultar textos técnicos;
- manter apenas canvas, progresso discreto e som;
- reduzir efeitos de interface;
- permitir fullscreen.

Ideal para deixar aberto em segundo monitor.

---

## 11. CRT Mode

Opcional.

Efeitos permitidos:

- scanlines sutis;
- vignette muito leve;
- brilho de fósforo;
- pequena distorção de borda;
- ruído visual discreto.

Não exagerar.

O efeito não pode prejudicar legibilidade nem performance.

---

## 12. Easter eggs

Após longos períodos de execução, eventos raros podem acontecer.

Exemplos:

- padrão simétrico;
- onda atravessando o disco;
- pequenos desenhos abstratos;
- mensagem rara na barra de status;
- sequência sonora especial;
- modo screensaver temporário.

Frequência baixa.

Nunca interromper a experiência principal.

---

## 13. Modos planejados

### Classic
Interface retrô completa.

### Relax
Som + canvas com UI mínima.

### Screensaver
Tela cheia automática, poucos controles.

### Future / experimental

- DOS style;
- monochrome terminal;
- neon defrag;
- synthwave;
- hard drive diagnostic mode.

Não implementar todos no MVP.

---

## 14. MVP

O MVP deve conter apenas:

1. Tela principal retrô.
2. Canvas responsivo.
3. Geração de clusters.
4. Algoritmo visual de reorganização.
5. Progresso 0–100%.
6. Start/Pause/Restart.
7. Controle de velocidade.
8. Web Audio API.
9. Mute/volume.
10. Fullscreen.
11. Loop automático.
12. Layout desktop responsivo.

---

## 15. Roadmap

### Fase 1 — base

- iniciar React + Vite + TypeScript;
- criar layout;
- implementar canvas;
- gerar disco fragmentado.

### Fase 2 — engine

- criar arquivos virtuais;
- detectar fragmentação;
- criar fila de movimentos;
- animar clusters;
- calcular progresso.

### Fase 3 — áudio

- criar AudioEngine;
- mapear movimento -> notas;
- criar mute/volume;
- limitar eventos simultâneos.

### Fase 4 — acabamento

- CRT;
- fullscreen;
- relax mode;
- status messages;
- activity indicator.

### Fase 5 — qualidade

- testes;
- performance profiling;
- acessibilidade;
- mobile fallback;
- deploy.

---

## 16. UX

A experiência precisa começar rapidamente.

Fluxo esperado:

```text
abrir site
   ↓
visualizar disco fragmentado
   ↓
Start Defrag
   ↓
permissão implícita de áudio via interação
   ↓
clusters começam a se mover
   ↓
sons sincronizados
   ↓
100%
   ↓
pausa curta
   ↓
nova fragmentação
```

O usuário não precisa entender desfragmentação para aproveitar a experiência.

---

## 17. Responsividade

Prioridade: desktop.

Em telas pequenas:

- canvas continua funcional;
- controles podem virar painel inferior;
- reduzir número de clusters;
- CRT pode ser desabilitado automaticamente.

---

## 18. Acessibilidade

- botão claro de Mute;
- respeitar `prefers-reduced-motion`;
- opção para diminuir animação;
- contraste suficiente;
- controles via teclado;
- labels acessíveis.

---

## 19. Segurança

Projeto sem backend no MVP.

Não solicitar:

- dados pessoais;
- login;
- acesso ao disco real;
- permissões do sistema operacional.

A simulação é puramente visual.

Nunca tentar acessar ou representar arquivos reais do computador do usuário.

---

## 20. Deploy

Preferência:

1. Cloudflare Pages
2. Vercel
3. GitHub Pages

Build:

```bash
npm run build
```

Saída:

```text
dist/
```

---

## 21. Critérios de aceite do MVP

O MVP é considerado pronto quando:

- o site abre sem backend;
- a grade aparece fragmentada;
- Start inicia a animação;
- Pause congela a simulação;
- Restart gera novo disco;
- clusters parecem estar sendo reorganizados;
- progresso chega a 100%;
- áudio reage aos movimentos;
- volume e mute funcionam;
- fullscreen funciona;
- não há erros no console;
- a animação mantém boa fluidez;
- build de produção funciona.

---

## 22. Direção de implementação

Priorizar nesta ordem:

1. experiência visual;
2. performance;
3. sensação de movimento;
4. áudio;
5. fidelidade lógica da simulação.

Este não é um simulador técnico de filesystem.

É uma experiência visual e sonora inspirada em ferramentas antigas.

---

## 23. Regra de produto

Quando houver conflito entre "ser tecnicamente fiel" e "ser bonito, fluido e relaxante", priorizar a experiência visual, desde que a interface não afirme estar operando no disco real do usuário.
