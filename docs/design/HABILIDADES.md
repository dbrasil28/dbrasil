# Habilidades: padrões, crescimento e evolução

Pedido do autor (07/11/2026): as habilidades eram diferentes no papel, mas na tela pareciam iguais (quase todas jogavam alguma coisa no inimigo mais perto). Agora cada uma tem um **padrão de ataque próprio**, que se reconhece de longe: vai e volta, rajada, órbita, cai do céu, arco, rastro no chão, atravessa a tela, aura, corrente e companheiro. Os números ficam em `WEAPONS` e `WEAPON_FX` (`prototype/src/config.js`). A página de revisão com a animação de cada uma foi aprovada pelo autor ("Pode fazer todas").

## Regras de crescimento

- Cada habilidade tem **5 níveis**. O nível 1 é a carta nova; cada nível seguinte soma o bônus da tabela aos anteriores (`weaponStats`).
- A cada nível do Juninho saem **3 cartas** sorteadas entre: subir uma habilidade que ele tem (peso 1,2), habilidade nova (peso 1,4; exclusiva do trecho 2,4), passiva nova ou subir passiva (peso 1).
- **4 vagas de habilidade** e **4 de passiva**; passiva vai até o nível 5.
- **Exclusivas:** o Picolé só é oferecido na Orla e o Mototáxi só no Morro. Quem pega leva para os próximos trechos.
- **Passivas valem para todas:** Raiva (+10% de dano), Café (−7% de recarga, multiplicando), Mochila (+10% de área: raio da órbita, poça, carimbo, explosão, megafone, latido), Tênis (+8% de velocidade), Marmita (+20 de vida), Ímã (+25% de coleta).
- **Evolução:** só uma no MVP. Capacete no nível 5 com o Tênis Gasto em qualquer nível vira **Entrega Expressa** (3 capacetes dourados que ricocheteiam 5 vezes). A carta de evolução aparece sempre primeiro e ocupa a vaga do Capacete.
- Com tudo no máximo: cartas de consolo (Pastel, cura 40; Hora Extra, +5% de dano permanente).

## As 11 habilidades

| Habilidade | Padrão na tela | Nv 1 | Crescimento (nv 2 → 5) |
|---|---|---|---|
| Capacete Bumerangue (inicial) | Vai e volta, acerta na ida e na volta | 1 capacete, 14 de dano, a cada 1,5 s, mirando a horda | +1 em leque · vai mais longe · +1 e recarga menor · +10 de dano |
| Chinelo Voador | Rajada em fila, um chinelo atrás do outro, na direção da horda (o mais perto); "PÁ!" | 2 chinelos de 14, atravessa 1 | +1 por rajada · +5 · atravessa +1 · chinelada de mãe: 2ª rajada no outro lado da horda |
| Boleto Atrasado | Boletos girando em volta do Juninho, com rastro, cobrando de quem encosta | 2 boletos de 14, 3,2 s girando a cada 3,8 s | +1 boleto · gira mais longe · mais rápido e +6 · +2 boletos e gira mais tempo |
| Carimbo Oficial | Sombra no chão, o carimbo cai do céu e deixa INDEFERIDO (lentidão) | 1 carimbo de 22 | +1 · maior · cai mais vezes e +8 · +1 e lentidão mais longa |
| Maleta de Dinheiro | Sobe em arco para um lado (alterna esquerda e direita), atravessa quem está embaixo na descida e explode em notas | 1 maleta de 40 | 2ª maleta (uma para cada lado) · explosão maior · +20 · mais frequente e mais longe |
| Isopor de Picolé (só Orla) | Poças geladas no caminho, atrás do Juninho: quem pisa fica lento | poça de 0,75 m, 4 de dano a cada 0,5 s | maiores · duram mais · 20% de chance de congelar · +3 e maiores |
| Mototáxi Amigo (só Morro) | Faixa vermelha piscando e "BI-BI!", e a moto rasga a viela | 40 de dano, a cada 4,2 s | +10 · moto mais larga · passa mais vezes · +1 moto e +5 |
| Megafone da TV | Círculo sempre ligado em volta dele: pulsa, machuca de leve e empurra | 6 por pulso (0,5 s), raio 1,9 m | maior · empurra mais · +3 · ainda maior e +2 |
| Gato de Luz | Choque em zigue-zague que pula de um inimigo para o vizinho e trava por um instante | 24 de dano, pula 3 | +2 pulos · pula mais longe · +10 · 2 choques de cada vez |
| Cachorro Caramelo | Vira-lata ao lado do Juninho, com a arte do autor: corre, dá o bote e morde ("NHAC!") 2 inimigos e volta. Parado, fica em guarda | 1 cachorro, 50 por mordida | mordida +20 · mais rápido · "AU AU!": depois de morder, late e a horda em volta recua · a matilha: mais 2 caramelos, e cada um morde 3 |
| Entrega Expressa (evolução) | Capacetes dourados que ricocheteiam | 3 capacetes de 30, 5 ricochetes | — |

### Por que o Capacete e o Chinelo miram a horda

O Capacete é a arma inicial. Na versão que ia para onde o Juninho anda, o primeiro nível demorava uns 27 s, porque quem foge tem a horda atrás e o capacete ia para o lado vazio. Mirando o mais perto, volta a uns 15 s. Com o Chinelo aconteceu o mesmo: indo para onde o Juninho anda, quase não causava dano (5 por segundo na arena de teste). O autor confirmou: "o chinelo precisa ser atirado em direção à horda".

## Equilíbrio medido

Na arena de teste, cada habilidade fica sozinha contra 40 inimigos de 60 de vida, com o Juninho andando em círculo por 20 s. O resultado é o dano por segundo:

| | Capacete | Chinelo | Boleto | Carimbo | Maleta | Picolé | Mototáxi | Megafone | Gato | Caramelo |
|---|---|---|---|---|---|---|---|---|---|---|
| nv 1 | 173 | 59 | 68 | 134 | 98 | 113 | 246 | 77 | 50 | 60 |
| nv 5 | 388 | 258 | 416 | 393 | 236 | 467 | 552 | 228 | 229 | 210 |

Antes do ajuste, o Chinelo dava 5, o Caramelo 16 e o Gato 23 no nível 1. As que acertam um inimigo de cada vez (Gato e Caramelo) ficam abaixo das de área nessa arena. O Megafone e o Boleto também empurram a horda.

Bot (60 partidas, sementes 1000 e 3000): 12 vitórias, contra 8 na versão anterior. A morte mediana passou de 158 a 167 s para 194 a 223 s. A diferença está dentro do ruído do bot. Confirmar em playtest com pessoas.

## Provisório e pendente

- O Cachorro Caramelo tem a arte do autor (caminhada, mordida e latido em 16 direções; `prototype/assets/personagens/caramelo/`). A mordida dura 0,36 s e o dano sai no quadro 3 de 6, quando a boca fecha; o latido, uma vez por corrida, empurra no pico. Falta a Parte 1 do pacote de caminhada e corrida: sem ela, a corrida usa a caminhada no ritmo máximo. Planejado com os achados da Orla: o faro, em que o Caramelo late na direção de um achado escondido por perto (`CARREIRA_E_ROTA.md`, seção 6). A moto, o choque e o megafone ainda são desenhados em código. Os boletos, o carimbo, o chinelo, a maleta e o capacete usam os ícones que já existiam.
- Falta evolução para 10 das 11 habilidades. Proposta a fazer: uma evolução por habilidade, cada uma ligada a uma passiva, como Capacete + Tênis.
- Enfeite no corpo do Juninho (o capacete na cabeça, o megafone na mão) só existe no megafone (o círculo). O resto fica para quando houver arte.
