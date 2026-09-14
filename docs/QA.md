# Validação do MVP

Validação realizada em 13/09/2026, Windows, Node 24, Chromium automatizado.

- Build TypeScript/Vite aprovado.
- 9 testes Vitest aprovados: seed, conservação, destinos livres, blocos reservados fixos, contiguidade final, progresso, pausa, reset e listeners.
- Revisor independente executou 84 combinações de seed/tamanho sem falhas de integridade ou término.
- 2 fluxos Playwright aprovados: Start/Pause/Resume/Restart, 100%, loop, velocidade, mute, volume, Relax Mode, fullscreen, teclado e reduced motion.
- Desktop 1280 px e celular 390 px inspecionados visualmente por implementação e QA independente; sem BLOCKER/HIGH.
- Expansão visual: quatro temas verificados em 3440×1440 e 390×844, troca em pausa preserva progresso e redesenha o Canvas; preferência persiste ao recarregar. A janela usa mais de 97% da largura ultrawide. Controles clássicos de detalhes/legenda, Stop e entrada em Relax com detalhes ocultos cobertos por testes.
- Resize ao sair de fullscreen corrigido para redesenhar imediatamente, inclusive em reduced motion.
- Nenhum erro JavaScript capturado no fluxo principal.
- Amostra local de 180 frames: mediana e percentil 95 de 16,7 ms (~60 FPS). Reproduzir com o servidor aberto e `node site/scripts/profile.mjs`.
- Auditoria npm após remoção da infraestrutura inicial desnecessária: zero vulnerabilidades.

## Limitações e checklist manual

- [ ] Escutar notas com fones e alto-falantes; avaliar suavidade e conforto por vários minutos.
- [ ] Verificar volume e mute pela saída sonora física. A UI e a criação do contexto são exercitadas no navegador, mas a escuta subjetiva não foi certificada.
- [ ] Repetir sessão prolongada e medição de FPS/memória em hardware modesto.
- [ ] Conferir Safari e Firefox em dispositivos reais.
- [ ] Validar registro e execução das ferramentas WebMCP em um navegador com suporte à API; essa capacidade opcional não está disponível no ambiente de validação.

Os testes não acessam arquivos reais. As screenshots são artefatos locais ignorados pelo Git e publicadas como artefatos de CI.
