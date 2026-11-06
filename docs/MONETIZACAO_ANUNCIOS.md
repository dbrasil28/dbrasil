# Monetização com publicidade

**Decisão (06/11/2026):** jogo gratuito para celular, que gera receita com anúncios, nos moldes do Marble Division Argentina (do mesmo autor).

## Onde entram os anúncios

| Ponto | Formato | Regra | Por quê |
| --- | --- | --- | --- |
| **Segunda chance** ao morrer | Recompensado (opcional) | 1 por turno. Volta com 50% da vida, quem está a até 3,5 m cai e fica 2,5 s invulnerável | É o momento em que o jogador mais quer assistir. No bot, as vitórias sobem de 75% para 85%: a recompensa vale o vídeo sem deixar o jogo fácil |
| **Trocar as cartas** de melhoria | Recompensado (opcional) | 2 por turno | Dá controle sobre a build, sem ser obrigatório |
| **Fim do turno** (ao sair da tela de resultado) | Intersticial | Nunca durante a partida nem depois da 1ª partida da sessão; no mínimo 3 min entre um e outro; pula se o jogador viu um recompensado nos últimos 90 s | Com partidas de 8 a 10 min, dá no máximo 1 por partida |
| **Banner** | Banner | Só nos menus, desligado por padrão, nunca na partida | Em retrato a tela é estreita, e um banner cobriria a horda e o joystick |
| **Compra "Sem anúncios"** | Compra no app | Tira intervalos e banner; os vídeos com recompensa continuam opcionais | Padrão do mercado: quem paga não perde as recompensas |

Para a versão publicada, vale somar uma **carência de alguns dias após a instalação** sem intersticial; o Marble Division usa 2 dias. Isso protege a retenção nos primeiros dias, quando o jogador ainda está decidindo se fica.

Quando existir meta-progressão (moedas, desbloqueios), entram dois pontos naturais de recompensado: **dobrar as moedas do fim do turno** e uma **maleta grátis por dia**.

### Tema

A TV Caos já é o narrador do jogo, então o anúncio entra como **"Intervalo comercial"**. No protótipo, os anúncios simulados são de marcas fictícias do universo do jogo (Construtora Especula & Filhos, Banco Juros Amigos…).

Uma regra importante: **assistir anúncio nunca aumenta a Corrupção.** Isso puniria o jogador por ajudar a pagar o jogo e faria piada com os anunciantes reais que vão aparecer ali.

## Regras das redes de anúncio que afetam o conteúdo

- **Violência e gore.** O Google restringe anúncios em "conteúdo chocante". Desde 2023, imagens de gameplay ficam fora dessa restrição, **exceto** tortura, violência sexual, violência contra menores e **violência contra pessoas reais conhecidas**. Conteúdo restrito recebe menos lances e rende menos. Consequência para o jogo: **nomes fictícios para todos os políticos e figuras** passam a ser obrigatórios, e o gore fica teatral.
- **Classificação etária.** Provavelmente 16 ou 18 anos. O jogo não é para crianças: não entrar no programa Famílias do Google e configurar a classificação máxima dos anúncios na rede.
- **Consentimento e privacidade.** Formulário de consentimento do Google (UMP), opção de privacidade nos ajustes, pedido de rastreamento no iOS (ATT) e política de privacidade (LGPD).

## Quanto rende (ordem de grandeza)

Não há uma referência confiável e atual só do Brasil. As estimativas públicas ficam em torno de **US$ 1 a 3 a cada mil vídeos com recompensa no Android**, e o iOS paga mais. Os dados da Appodeal para a América Latina no 4º trimestre de 2024 indicam US$ 1,8 (Android) e US$ 3,4 (iOS) para recompensados, e US$ 1,3 e US$ 2,2 para intersticiais.

Conta de exemplo: 10 mil jogadores por dia × 1,5 anúncio cada × US$ 2 por mil ≈ **US$ 30 por dia**. Com esses valores, a receita depende de volume. Duas coisas aumentam o volume: recompensados que o jogador *quer* ver e mercados além do Brasil.

## Pilha técnica

A mesma do Marble Division: **jogo web empacotado com Capacitor, AdMob via plugin**, só no app nativo (no navegador não há anúncio).

O módulo `prototype/src/ads.js` já separa as duas camadas:

- **Provedor:** quem mostra o anúncio. No protótipo é simulado. No app entra o provedor do AdMob com a mesma interface: `start()`, `showInterstitial()` e `rewarded.ready()` / `rewarded.show()`.
- **Regras:** frequência, pontos de anúncio e registro para métricas. Funcionam igual com qualquer provedor.

Para a produção, o desenho em **Canvas 2D** do protótipo deve migrar para **WebGL** (Phaser ou PixiJS), para aguentar 300 inimigos num Android de entrada. Isso precisa ser medido ainda na Fase 0, **dentro do Capacitor**, num aparelho fraco.

## Métricas para acompanhar

- % de jogadores que assistem pelo menos 1 vídeo com recompensa por dia.
- Anúncios por jogador por dia e intersticiais por partida.
- Taxa de aceitação da segunda chance e de abandono do vídeo no meio.
- Retenção no dia 1 e no dia 7, com teste A/B da frequência do intersticial.

O protótipo já exporta os dados de anúncio da partida e da sessão no JSON de métricas da tela de resultado.
