# Pedido de sons do jogo (08/11/2026)

O jogo já toca todos os sons abaixo (60), mas com versões provisórias feitas em código (`prototype/src/sons.js`). Elas servem para acertar quando cada som toca e o volume da mistura. Os sons gravados entram no lugar, um a um, sem mexer no resto. Gravados até agora (créditos em `CREDITOS_SONS.md`):

- `golpe`: 5 variações, Firefly, 08/11/2026; é também o som do capacete acertando.
- CC0 do OpenGameArt, aprovados pelo autor em 08/11/2026: `tapa`, `morte_horda`, `gemido`, `dano`, `morte`, `grito_funkeiro`, `quebra_madeira`, `quebra_plastico`, `baque`, `explosao` e `amb_orla`.

- CC0 do OpenGameArt, segunda rodada (08/11/2026): `xp`, `gorjeta`, `acorda`, `tiro` e `soco_chao`.

- CC0 do OpenGameArt, terceira rodada (08/11/2026): `nivel`, `mira` (a arma engatilhando), `urro`, `latido` e `lataria`.

## Como gerar

- **ElevenLabs, Sound Effects** (recomendado). Uso comercial exige o plano pago. Cole o prompt da tabela (em inglês, que funciona melhor) e ajuste a duração no campo de duração.
- **Bancos de licença livre** para os genéricos (vidro, mar, trânsito): Kenney (CC0), o pacote da GDC da Sonniss (livre de royalties) e o Freesound filtrado por CC0. Guarde a licença de cada arquivo.
- **Variações:** gere o número de versões da coluna "Var.". O jogo sorteia entre elas e ainda varia o tom, para a horda não soar repetida.

## Formato

- MP3, mono, 44,1 kHz, 128 kbps. Os ambientes vão em estéreo, com 30 s e o fim emendando no começo.
- Sem silêncio no começo (o som tem que sair junto com o golpe) e pico em −1 dB.
- Nome do arquivo: `<id>_<n>.mp3` (por exemplo, `tapa_1.mp3`, `tapa_2.mp3`). Pode mandar com outro nome, que eu renomeio, confiro e ponho no lugar (`prototype/assets/sons/`).
- Não precisa acertar o volume entre eles: o volume de cada um fica em `config.js` (`SONS`).
- Vozes: só gemido, grito e grunhido, sem palavras. A voz do apresentador da TV fica para um pedido à parte.

## Prioridade

1. **Avisos** (seção 4): é por eles que o jogador sabe que vai apanhar. Faz parte do "difícil e justo".
2. **Golpes, horda e Juninho** (seções 1 e 2): são os que mais tocam.
3. Habilidades, inimigos, interface e ambiente.

## 1. Juninho

| id | Quando toca | Var. | Duração | Prompt |
| --- | --- | --- | --- | --- |
| `dano` | Leva um golpe | 4 | 0,3 s | Young man short pained grunt when hit, video game, no words |
| `morte` | Cai (fim da partida) | 1 | 1,2 s | Young man final painful groan collapsing to the ground, body falling, video game |
| `nivel` | Sobe de nível | 1 | 0,6 s | Short bright arcade level up jingle, rising notes, punchy |
| `xp` | Pega o XP do chão | 3 | 0,1 s | Tiny soft pickup blip, high pitched, video game coin gem |
| `cura` | Pega coco, açaí, pastel ou milho | 2 | 0,4 s | Gentle healing pickup sound, soft rising chime |
| `gorjeta` | Pega dinheiro (gorjeta, propina, maleta) | 2 | 0,3 s | Coins and banknotes pickup, cash register ding, short |
| `pega` | Pega cadeira, mesa ou botijão para jogar | 2 | 0,2 s | Grabbing a plastic chair, quick scrape and lift |
| `arremesso` | Joga objeto, capacete ou maleta | 3 | 0,25 s | Fast throw whoosh, object flying through the air |

## 2. Golpes e horda

| id | Quando toca | Var. | Duração | Prompt |
| --- | --- | --- | --- | --- |
| `golpe` | Golpe genérico em inimigo | 5 | 0,15 s | Punchy body hit impact, cartoonish but heavy, video game brawler |
| `bonk` | Capacete acerta a cabeça | 3 | 0,2 s | Motorcycle helmet hitting a head, hollow plastic bonk |
| `tapa` | Chinelo acerta | 4 | 0,15 s | Rubber flip-flop slap on skin, loud crisp smack |
| `morte_horda` | Zumbi-telespectador cai | 5 | 0,35 s | Zombie body splat and fall, wet gore squelch, short |
| `morte_elite` | Elite ou chefão cai | 2 | 0,8 s | Heavy body collapsing hard, big gory impact, crowd gasp far away |
| `acorda` | Telespectador acorda (sai da hipnose) | 3 | 0,3 s | Old TV static burst cutting off, electric crackle |
| `gemido` | A horda geme por perto, de tempos em tempos | 6 | 0,8 s | Low zombie groan, hypnotized crowd moaning, single voice, no words |
| `quebra_plastico` | Cadeira, mesa ou banquinho de plástico quebra | 3 | 0,3 s | Plastic chair smashing and cracking into pieces |
| `quebra_madeira` | Engradado ou cadeira de praia quebra | 3 | 0,3 s | Wooden crate smashing, splintering wood |
| `baque` | Pneu cai | 2 | 0,2 s | Heavy rubber tire thudding on the ground, bounce |
| `explosao` | Maleta, botijão ou carro explodem | 3 | 1,2 s | Gas canister explosion, deep boom with debris, video game |
| `atropelo` | Carro ou moto atropela | 3 | 0,4 s | Car hitting a person, heavy thud and body tumble, brakes squeak |
| `buzina` | Carro vindo por trás, na faixa do Juninho | 2 | 0,4 s | Old small car horn honk, two short beeps, Brazilian street |
| `lataria` | Porrada no carro (capacete, chinelo, objeto) | 3 | 0,2 s | Hitting a car body panel, hollow metal dent clank, short |
| `pega_fogo` | Carro pega fogo e vai explodir (aviso) | 2 | 0,7 s | Car engine catching fire, gas whoosh ignition then crackling flames |

## 3. Habilidades

| id | Quando toca | Var. | Duração | Prompt |
| --- | --- | --- | --- | --- |
| `chinelo` | Chinelo Voador dispara | 3 | 0,2 s | Flip-flop thrown fast, whoosh with a flap |
| `boleto` | Boleto Atrasado (papéis girando) | 2 | 0,4 s | Paper sheets fluttering in the wind, swirling papers |
| `carimbo` | Carimbo Oficial cai | 2 | 0,35 s | Giant rubber stamp slamming on a desk, heavy official thump |
| `moto` | Mototáxi Amigo passa | 2 | 0,8 s | Small motorcycle passing by fast, 125cc engine rev |
| `megafone` | Megafone da TV (onda de som) | 2 | 0,4 s | Megaphone feedback squeal burst, loud distorted pulse |
| `gato` | Gato de Luz (choque) | 3 | 0,35 s | Electric zap, crackling arc between wires, short circuit |
| `latido` | Caramelo late | 3 | 0,4 s | Medium mutt dog barking twice, friendly but loud |
| `mordida` | Caramelo morde | 2 | 0,15 s | Dog bite snap with a short growl |
| `bola` | Bola da Altinha quica | 3 | 0,15 s | Soccer ball kick on the beach, firm hollow pop |
| `paredao` | Paredão de Som solta o grave | 2 | 0,6 s | Huge sub bass boom from a street sound system, funk kick drum, chest thump |

O Isopor de Picolé não tem som, a pedido do autor (08/11/2026): o gelo fica o tempo todo na tela e qualquer som cansa.

## 4. Inimigos e avisos (prioridade)

| id | Quando toca | Var. | Duração | Prompt |
| --- | --- | --- | --- | --- |
| `mira` | Traficante ou Chefe começa a mirar (aviso) | 1 | 0,3 s | Two short electronic warning beeps, laser sight lock on |
| `tiro` | Tiro do Traficante e rajada do Chefe | 4 | 0,3 s | Rifle gunshot, single shot, outdoor, punchy, video game |
| `radio` | Chefe chama reforço no rádio | 2 | 0,5 s | Walkie talkie static burst with a click, radio chatter noise, no words |
| `grito_funkeiro` | Funkeiro abre os braços antes da investida | 3 | 0,5 s | Aggressive man war cry before charging, short angry shout, no words |
| `urro` | Monstrão vai atacar (aviso da investida e do carro) | 2 | 1,0 s | Giant bodybuilder roar, deep beastly yell, flexing |
| `investida` | Monstrão corre | 2 | 0,7 s | Huge heavy footsteps stampede rushing forward, ground shaking |
| `soco_chao` | Monstrão soca o chão | 2 | 0,5 s | Giant fist slamming the ground, massive thud with rumble and debris |
| `anilha` | Monstrão joga a anilha | 2 | 0,5 s | Heavy steel gym weight plate thrown, metallic ring and roll |
| `carro_cai` | Carro jogado cai, ou o Monstrão bate em carro ou poste | 2 | 0,8 s | Car crashing down on the street, crunching metal and glass |
| `aviso_chao` | Aviso no chão (soco, anilha, faísca do curto) | 2 | 0,3 s | Short tense warning tone, rising alert, video game telegraph |
| `cata` | Cracudo cata o XP do chão | 2 | 0,2 s | Quick rummaging scratch, grabbing something from the ground |
| `roubo` | Trombadinha rouba e foge | 2 | 0,4 s | Sneaky whistle and quick footsteps running away |
| `multa` | Fiscal multa | 2 | 0,4 s | Traffic warden whistle blow, short sharp |

## 5. Crises, chefão e interface

| id | Quando toca | Var. | Duração | Prompt |
| --- | --- | --- | --- | --- |
| `crise` | A TV avisa que uma crise vem aí | 1 | 1,0 s | TV news alert sting, urgent breaking news jingle |
| `onda` | Ressaca: a onda corre na areia | 2 | 1,6 s | Big ocean wave crashing and rushing up the sand |
| `apagao` | Apagão começa | 1 | 0,9 s | Power outage, electrical hum dying down, click of lights going off |
| `faisca` | Gato de luz em curto: o choque | 3 | 0,3 s | Loud electric spark burst from a power line, sizzling |
| `chefe` | Chefão aparece | 1 | 1,5 s | Dramatic boss arrival sting, heavy brass and drums hit |
| `fase` | Chefão muda de fase | 1 | 0,6 s | Rising tension hit, boss enrages, short |
| `toque` | Toque em botão | 1 | 0,05 s | Soft UI button tap, short click |
| `carta` | Escolhe uma carta | 2 | 0,2 s | Card swipe and flip, satisfying UI select |
| `cofre` | Cofre ou maleta de cartas abre | 1 | 1,0 s | Treasure chest opening with coins, magical shimmer |
| `reliquia` | Pega a relíquia do trecho | 1 | 1,2 s | Legendary item pickup, shining choir chord, sparkle |
| `reliquia_sobe` | Achou a relíquia: o tempo para e o Juninho sobe no ar (D67) | 1 | 1,5 s | Magical power-up riser, rising choir and shimmering whoosh building tension, ends abruptly |
| `reliquia_estouro` | A relíquia entra no Juninho: clarão e onda (D67) | 1 | 1,8 s | Epic power-up impact, deep boom with bright heroic chord and sparkling tail |
| `super` | Usa a super da relíquia (D67) | 1 | 0,6 s | Heroic brass stab with a deep punch, special move activation |
| `super_pronta` | A carta da super encheu (D67) | 1 | 0,4 s | Short bright two-note chime, ability ready |
| `passagem` | Uma passagem se abre | 1 | 0,6 s | Gate unlocking, heavy latch clunk then rising tone |

## 6. Ambiente (em laço, 30 s, estéreo)

| id | Onde | Prompt |
| --- | --- | --- |
| `amb_orla` | Orla | Rio de Janeiro beach promenade ambience, waves, seagulls, distant traffic and street vendors, late afternoon, loop |
| `amb_morro` | Subida do Morro | Brazilian favela ambience, distant funk music, dogs barking far away, motorcycles, people talking indistinctly, loop |
