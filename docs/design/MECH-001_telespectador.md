# MECH-001 Telespectador Hipnotizado

**Status:** Implementado. Critérios AC-1 a AC-7 verificados; AC-8 aguarda playtest.

**Fantasia:** a cidade está hipnotizada pela TV Caos. O Juninho não mata quem está na frente dele: ele *acorda* essas pessoas, uma por uma, e a audiência da emissora cai.

Substitui o "Cidadão Revoltado" do conceito v0.1. Motivo: o pacote pede que o humor mire estruturas, não vítimas. Matar cidadãos aos milhares invertia a sátira e restringia anúncios (ver `docs/ANALISE_CONCEITO_v0.1.md`, ponto 1).

## Regras

1. O Telespectador Hipnotizado é a horda base: persegue o jogador em linha reta e causa dano por contato, com os mesmos números do antigo Cidadão Revoltado.
2. Ao chegar a 0 de vida, ele **acorda**:
   - sai da lista de inimigos;
   - solta uma gema de XP;
   - conta no contador de derrubados;
   - vira um efeito visual que anda para longe do jogador a `walkSpeed` e some em `fadeS`.
3. O telespectador que acorda **não gera sangue nem manchas**, com o gore ligado ou desligado. No lugar entra um chiado de TV (partículas brancas e azuis) e um "?" sobre a cabeça.
4. Quem acordou não colide, não causa dano e não pode ser atingido.
5. Cada telespectador acordado tira `audienceLoss` da audiência da TV Caos, que nunca cai abaixo de `audienceFloor`. Elites e chefes continuam *aumentando* a audiência, porque são espetáculo.
6. Inimigos que representam o sistema (Golpista, Burocrata, Fiscal, Político, Rival, Especulador) continuam com gore teatral, que pode ser desligado.
7. Leitura visual: halo azul de tela em volta da cabeça, olhos vidrados e braços esticados para a frente. Quem acordou aparece sem halo, com a mão na cabeça.

## Constantes de tuning (`prototype/src/config.js`, objeto `WAKE`)

| Nome | Unidade | Padrão | Faixa | Notas |
| --- | --- | --- | --- | --- |
| `walkSpeed` | m/s | 1,6 | 0,8–2,5 | Mais rápido que isso chama atenção demais |
| `fadeS` | s | 1,4 | 0,8–2,5 | Acima de 2,5 s polui a tela em pico de horda |
| `maxFx` | unidades | 60 | 20–120 | Limite de desempenho; os mais antigos somem primeiro |
| `audienceLoss` | milhões | 0,0008 | 0–0,005 | Só feedback no ticker por enquanto |
| `audienceFloor` | milhões | 0,1 | 0–0,5 | |

## Casos de borda

- Chefe derrotado: toda a horda visível acorda junto, sem sangue.
- Segunda chance por anúncio: os telespectadores em volta acordam.
- Mais de `maxFx` acordados ao mesmo tempo: o mais antigo some na hora.
- Perfis Falsos (iscas do Golpista) não acordam: são digitais e somem com um chiado verde.

## Critérios de aceite

| ID | Verificação | Método | Quem verifica |
| --- | --- | --- | --- |
| AC-1 | Derrotar um telespectador não cria mancha nem partícula de sangue | `prototype/tests/mech001.test.mjs` | agente |
| AC-2 | Quem acordou se afasta do jogador e some depois de `fadeS` | teste | agente |
| AC-3 | Continua soltando XP e contando no contador | teste | agente |
| AC-4 | Quem acordou não está na lista de inimigos e não causa dano | teste | agente |
| AC-5 | Inimigos do sistema mantêm o gore, e o ajuste de gore desliga as manchas | teste | agente |
| AC-6 | O número de acordados respeita `maxFx`, e a audiência respeita o piso | teste | agente |
| AC-7 | O balanceamento não muda: vitórias do bot dentro de ±10 pontos do valor anterior (40 partidas) | `node tools/balance-report.mjs 40 alternar` | agente |
| AC-8 | 4 de 5 testadores descrevem a horda como "hipnotizados pela TV" (ou parecido) sem explicação, e ninguém diz que matou pessoas comuns | playtest (`docs/PLAYTEST_FASE0.md`) | humano |

Resultado do AC-7 em 06/11/2026: 35/40 vitórias (88%) depois da mudança, contra 34/40 (85%) antes.

## Critério de corte

Se o AC-8 falhar duas vezes depois de ajustes visuais, reforçar a leitura (cabeça de TV, antena, fio do controle remoto) antes de mexer na regra.
