# Registro de decisões

Continua o registro do pacote de conceito (`docs/concept-v0.1/06_Decisoes_e_Questoes_Abertas.md`). As hipóteses abertas continuam lá.

| ID | Data | Tema | Decisão | Status |
| --- | --- | --- | --- | --- |
| D01 | 06/11/2026 | Plataforma | Celular, Android e iOS | Decidido (conceito) |
| D02 | 06/11/2026 | Orientação | Retrato | Decidido (conceito) |
| D03 | 06/11/2026 | Câmera | 2.5D isométrica | Decidido (conceito) |
| D04 | 06/11/2026 | Loop | Sobrevivência com hordas e ataques automáticos | Decidido (conceito) |
| D05 | 06/11/2026 | Tom | Sátira social pesada | Decidido (conceito) |
| D06 | 06/11/2026 | Estilo | Personagens digitalizados, referência arcade anos 90 | Decidido (conceito) |
| D07 | 06/11/2026 | Escala | Personagens menores, arena maior | Decidido (conceito) |
| D08 | 06/11/2026 | Referência visual | Último mockup em retrato é a melhor direção atual | Decidido (conceito) |
| D09 | 06/11/2026 | Negócio | Gratuito com publicidade, nos moldes do Marble Division. Detalhes em `MONETIZACAO_ANUNCIOS.md` | Decidido |
| D10 | 06/11/2026 | Pilha técnica | Jogo web empacotado com Capacitor e AdMob, a mesma pilha do Marble Division | Proposta: confirmar depois do teste de desempenho no Capacitor |
| D11 | 06/11/2026 | Ferramentas | Skills de game dev instaladas no projeto (GameForge + agentes de design do Claude Code Game Studios), sem hooks | Feito |
| D12 | 06/11/2026 | Horda base | Telespectador Hipnotizado, que acorda em vez de morrer; gore só para inimigos do sistema. Spec: `design/MECH-001_telespectador.md` | Adotado (recomendação seguida com "siga"); falta o AC-8 em playtest |
| D13 | 06/11/2026 | Nomes | Todos os nomes fictícios; trocas em `design/ELENCO_E_NOMES_v0.2.md` | Adotado (recomendação seguida com "siga") |
| D14 | 06/11/2026 | Mapas | Vários tipos de mapa, todos bem brasileiros e com formato de jogo diferente. O mapa 1 é a orla do Rio de Janeiro (Orla do Desespero): calçadão de ondas, praia, morro com favela. Plano em `arte/GUIA_DE_PRODUCAO_DE_ARTE.md` | Decidido (mapa 1); mapas 2 a 5 em proposta |
| D15 | 06/11/2026 | Arte | A arte final sai do guia de produção, gerada com o ChatGPT pelo autor; o protótipo usa recortes do mockup como provisório | Decidido |
| D16 | 06/11/2026 | Arte no protótipo | Pacote de recortes v1 (`prototype/assets/`, manifesto em `asset_manifest.json`) integrado; mapa 1 em corredor; Juninho em 8% da área jogável e inimigos em 90% do Juninho, como no mockup | Feito; arte final pendente do guia |
| D17 | 06/11/2026 | Marca real (exceção) | O Telespectador C usa a camisa do Flamengo com o monograma CRF, a pedido do autor ao gerar a arte. É a única exceção à regra de nomes e marcas fictícios (D13). Clube e escudo são marcas registradas: antes de publicar na loja, licenciar ou trocar por uma camisa rubro-negra sem escudo | Aceito no protótipo; revisar antes da loja |
| D18 | 06/11/2026 | Horda animada e elenco | A horda usa só os telespectadores com caminhada em 16 direções (A, B e C por enquanto); os recortes de pose única do mockup ficam só como reserva. Enquanto a arte entra, o ajuste "Elenco completo desde o início" vem ligado: Golpista, Burocrata e Fiscal aparecem desde 00:00. Desligado, volta o ritmo normal (Golpista ~1:30, Burocrata ~5:00, Fiscal ~6:00), que é o que o bot de balanceamento mede | Feito |

## Pendentes

- Confirmar a pilha técnica (D10) depois do teste de desempenho no Capacitor.
- Resolver o escudo do Telespectador C (D17) antes de enviar para a loja: licença do clube ou camisa sem escudo.
