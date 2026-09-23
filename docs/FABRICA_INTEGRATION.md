# Contrato de integração com a Fábrica

## Entrada

A oportunidade aprovada no Radar deve ser convertida em um `EditorialBrief`.

Exemplo:

```json
{
  "title": "You Just Got Laid Off. Now What?",
  "problem": "The reader has just lost a job unexpectedly and needs to understand the shock, regain stability and take sensible first steps.",
  "target_reader": "English-speaking professional recently laid off, generally 25-55, reading within the first days after the event.",
  "promise": "Help the reader understand the emotional and practical disruption, recover perspective, and leave with a grounded plan for what comes next.",
  "language": "en",
  "target_words": 12000,
  "product_type": "ebook_plus_action_pack",
  "tone": "human, calm, intelligent, non-patronizing, practical",
  "constraints": [
    "Main manuscript must read as a real short non-fiction book.",
    "No workbook prompts inside normal chapters.",
    "No LinkedIn-style one-line dramatic prose.",
    "Checklist belongs in a separate Action Pack."
  ]
}
```

## Saída

`EditorialResult`:

- `status`: approved | failed
- `manuscript`: texto aprovado
- `sources`: fontes utilizadas
- `approvals`: histórico de gates
- `revision_count`
- `action_pack`: material auxiliar separado, quando existir

## Estados de UI recomendados na Fábrica

- Researching
- Validating sources
- Defining audience
- Architecting book
- Writing
- Developmental review
- Line editing
- Style QA
- Fact checking
- Publishing QA
- Awaiting editorial approval
- Approved for design
- Returned for revision
- Failed after revision limit

## Regra de interface

O usuário deve poder abrir cada etapa e ver:
- agente responsável;
- entrada;
- saída;
- decisão;
- motivo da reprovação;
- para qual estágio voltou.

Não usar um único estado genérico `running` para o pipeline editorial.
