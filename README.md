# 💈 Barbearia · Sistema de Agendamento (Template)

Versão de **demonstração pública** de um sistema de agendamento e gestão que desenvolvi para uma barbearia real, hoje **em produção**.

> **Modo demonstração:** todos os dados são fictícios e ficam salvos só no navegador de quem acessa. Nenhuma informação é enviada a servidores.

## O que dá para testar

| Página | O que faz | Acesso |
|---|---|---|
| `index.html` | Site da barbearia: escolha de barbeiro, serviço, data e horário livre | Público |
| `admin.html` | Painel do dono: agenda de todos, serviços e preços, dashboard financeiro, bloqueios | Senha: `demo` |
| `barbeiro2.html` / `barbeiro3.html` | Painel de cada barbeiro: agenda própria, valores, horários especiais | Senha: `demo` |

Use o botão **"Restaurar dados"** na faixa dourada para voltar aos dados iniciais.

## Funcionalidades

- Grade de horários com **validação de conflitos** pela duração de cada serviço
- Bloqueio de dias e períodos, horários especiais por barbeiro
- Faturamento individual e financeiro por período
- Interface responsiva (celular e computador)

## Tecnologias

**Versão em produção:** HTML5, CSS3, JavaScript, Supabase (PostgreSQL), Vercel.
**Esta demo:** o acesso ao banco é substituído por `demo-db.js`, que simula a API do Supabase no navegador. O código dos painéis é o mesmo da versão real.

## Privacidade e segurança

- Telefones, chaves PIX e credenciais reais **não fazem parte** deste repositório, nem do histórico dele (repositório criado do zero).
- Fotos e nomes dos barbeiros publicados **com autorização** deles; contatos e chaves PIX não fazem parte do projeto.
- Clientes, endereço e depoimentos são ilustrativos.
- Cabeçalhos de segurança configurados em `vercel.json`.

## Créditos

Nome, logo e fotos da equipe usados com autorização do cliente e dos barbeiros.

---

Desenvolvido por **Paulo Henrique Guilhen Alves** · [Portfólio](https://paulohenrique-dev.vercel.app) · [LinkedIn](https://www.linkedin.com/in/paulo-henrique-guilhen)
