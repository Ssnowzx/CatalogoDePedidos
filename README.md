# 🐴 Catálogo de Pedidos — Metalúrgica e Selaria Lageana

Um catálogo digital premium, rápido e extremamente seguro para listagem de produtos, arreamentos e ferragens, permitindo a geração de pedidos de vendas diretamente no navegador com integração nativa ao WhatsApp.

---

## 🚀 Funcionalidades e Atualizações Recentes

### 1. Interface Premium ("Aço Inox" sobre Dark Mode)
*   **Design Sofisticado**: Utilização de paletas de cores metálicas, contrastando com um fundo negro profundo para uma experiência visual de alta qualidade.
*   **Tipografia Refinada**: Adoção de **Cinzel** para cabeçalhos e **Inter** para dados, trazendo um aspecto elegante e profissional.
*   **Responsividade Completa**: Adaptado minuciosamente para todos os dispositivos, com "Cards" em dispositivos móveis que proporcionam uma leitura confortável como em um app nativo.

### 2. Experiência de Compra Otimizada
*   **Instruções Intuitivas**: Adicionado um texto explicativo logo no início para ajudar os clientes a entenderem a mecânica de compra.
*   **Carrinho Flutuante (Floating Cart)**: Um botão metálico de carrinho flutuante acompanha o cliente pela página quando rola para baixo, proporcionando acesso instantâneo ao pedido a qualquer momento.
*   **Busca em Tempo Real**: Filtros combinados de texto e categoria com resposta em milissegundos.

### 3. Segurança e Robustez (Hardening)
*   **Modelo de Segurança Zero-Trust no Front-end**: O aplicativo considera que o usuário pode manipular a DOM. Para evitar fraudes nos preços:
    *   **Catálogo Congelado (`Object.freeze`)**: Os preços e nomes oficiais não podem ser modificados no contexto da execução.
    *   **Validação Autorizada**: Cada adição ao carrinho faz um *lookup* na fonte oficial dos dados para garantir o valor correto.
*   **Prevenção de Injeção**: Apenas textos sanitizados são exportados ou enviados pelo WhatsApp (remoção de caracteres de controle e *markdown* indesejado).

### 4. Integração de Pagamento e Compartilhamento
*   **Formato de Saída Duplo**: O cliente pode exportar o comprovante em formato `.txt` seguro e formatado ou **enviar direto via WhatsApp** formatado em negrito e itálico, pronto para o atendimento da loja.

---

## 💻 Estrutura Técnica (Padrão Vercel)

O projeto foi refatorado para uma estrutura modular, limpa e preparada para ser subida diretamente na **Vercel** com zero configuração extra:

```text
/
├── index.html       # Arquivo principal de entrada
├── css/
│   └── styles.css   # Variáveis CSS, layout e responsividade avançada
├── js/
│   ├── app.js       # Lógica do carrinho, segurança e DOM
│   └── dados.js     # Fonte de dados oficial em JSON-like
└── DESIGN_SYSTEM.md # Documentação completa da UI/UX
```

Para detalhes sobre cores, tipografia, estilo dos botões e identidade visual, consulte a **[Documentação do Design System](./DESIGN_SYSTEM.md)**.

---

## 📖 Como usar e testar

1.  Hospede o projeto na **Vercel** ou abra o `index.html` diretamente em seu navegador.
2.  Leia o quadro de instruções no topo da página.
3.  Utilize o campo de busca ou os filtros para localizar um produto.
4.  Clique no botão `+` para adicionar itens. Role a página para ver o **Carrinho Flutuante** aparecer!
5.  Abra o carrinho (clicando no cabeçalho ou no botão flutuante) e preencha seus dados de cliente.
6.  Aperte **Revisar Pedido** e escolha se quer baixar o recibo ou abrir a conversa direto no WhatsApp da Selaria Lageana.

---
*Pronto para produção e deploy automático.*
