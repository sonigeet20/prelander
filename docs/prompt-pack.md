# LLM Prompt Pack

## Brand extraction → Fact Pack JSON
Schema:
- brandName
- category
- tone
- benefits[]
- limitations[]
- pricing[]
- trustSignals[]
- policyLinks[]
- riskyClaims[]

## Keyword generation → Clusters JSON
Schema:
- clusterName
- intent
- keywords[]
- score

## Landing page generation → Blocks JSON
Schema:
- h1
- intro
- features[]
- useCases[]
- faq[]
- trust
- disclosure
- footer

## Compliance rewrite → Safe copy JSON
Schema:
- safeCopy
- disclosures[]
- redFlags[]
