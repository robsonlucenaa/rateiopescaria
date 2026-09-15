# Plano: participação por despesa

## O que será feito
- Adicionar, no cadastro de despesa, uma escolha entre todos os participantes ou pessoas específicas.
- Permitir alterar essa participação depois que a despesa já estiver cadastrada.
- Mostrar em cada despesa quem participa daquele rateio.
- Atualizar o resumo e as sugestões de pagamento para dividir cada despesa somente entre as pessoas selecionadas.

## Compatibilidade
- Despesas antigas, sem seleção gravada, continuarão considerando todos os participantes.

## Detalhes técnicos
- Ampliar o formato salvo de cada despesa com os IDs dos participantes do rateio.
- Ajustar a validação, os formulários e o cálculo de saldos sem alterar a estrutura do banco.
- Testar inclusão, edição e cálculo com participação total e parcial.
