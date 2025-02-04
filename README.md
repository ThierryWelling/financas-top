# Financasia - Aplicativo de Gestão Financeira

Um aplicativo moderno e intuitivo para gestão financeira pessoal, desenvolvido com as mais recentes tecnologias web.

## Tecnologias Utilizadas

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Supabase (Banco de dados e Autenticação)
- OpenAI API / Google Gemini (Integração com IA)
- Prisma (ORM)
- shadcn/ui (Componentes UI)
- Lucide Icons

## Requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Chave de API da OpenAI ou Google Gemini

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis necessárias

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Autenticação de usuários
- Dashboard financeiro
- Gestão de receitas e despesas
- Categorização de transações
- Relatórios e análises
- Integração com IA para insights financeiros
- Interface moderna e responsiva

## Estrutura do Projeto

```
src/
  ├── app/           # Rotas e páginas
  ├── components/    # Componentes reutilizáveis
  ├── lib/          # Utilitários e configurações
  ├── hooks/        # Custom hooks
  └── types/        # Definições de tipos TypeScript
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. 