# 🎨 Design System — Metalúrgica e Selaria Lageana

O Design System "Aço Inox sobre Preto" foi desenvolvido para transmitir robustez, sofisticação e confiança. Ele evoca a força do aço e o acabamento premium dos produtos oferecidos pela selaria.

---

## 1. Identidade Visual e Temática

O foco principal é o contraste forte entre fundos ultra-escuros (pretos e cinzas profundos) e fontes luminosas, acentuadas por gradientes e tons metálicos simulando Aço Inox.

*   **Fundo (Background)**: `#000000` absoluto para o corpo principal, trazendo profundidade infinita.
*   **Superfícies (Elevations)**: Utilização de `#0e0e0e`, `#141414` e `#1a1a1a` para destacar cartões, tabelas e modais do fundo principal.

---

## 2. Tipografia

A hierarquia tipográfica foi cuidadosamente pensada para ser clássica no branding e ultra-legível nos dados.

*   **Títulos e Branding**: `Cinzel` (Google Fonts). Uma fonte serifada de aspecto monumental, inspirada nas proporções clássicas romanas. Transmite tradição e o peso do metal. Utilizada em `<h1>` e cabeçalhos de grupos de produtos.
*   **Interface e Dados**: `Inter` (Google Fonts). Sem serifa, extremamente geométrica e limpa. Perfeita para ler números de preços, listas extensas e campos de formulário.

---

## 3. Paleta de Cores (Design Tokens)

Toda a paleta é controlada por variáveis CSS centralizadas no `:root`.

### Tons Metálicos (Aço Inox / Steel)
Estes tons são a base da marca, substituindo as tradicionais cores primárias "azuis" ou "vermelhas".
*   `--steel-50`: `#f4f6f8` (Brilho intenso)
*   `--steel-100`: `#e6e9ec`
*   `--steel-200`: `#c9d0d6` (Accent Strong)
*   `--steel-300`: `#aab1b8` (Inox Principal / Accent)
*   `--steel-600`: `#4f565c`
*   `--steel-700`: `#3a4046`

### Cores de Texto e Bordas
*   `--text`: `#ffffff` (Contraste máximo)
*   `--text-muted`: `#c7c7c7` (Subtítulos e instruções)
*   `--border`: `#2e2e2e` (Divisórias discretas)
*   `--border-strong`: `#3a3a3a`

### Call to Action e Brand Externo
*   **WhatsApp / Destaque**: `--whats: #25D366`. Utilizado para ações críticas finais ("Fazer Pedido") e para dar destaque a instruções cruciais.
*   **Feedback de Risco**: `--danger: #e14b4b`. Usado em alertas, campos obrigatórios não preenchidos e contadores flutuantes (para atrair atenção).

---

## 4. Componentes Principais

### Cartões de Produto (Mobile)
No celular, a tabela complexa se transforma em cartões independentes.
*   Fundo usa um gradiente de superfície (`linear-gradient(180deg, #131313 0%, #0e0e0e 100%)`).
*   Possui botões circulares metálicos ao invés de linhas inteiras clicáveis.

### Textos de Instrução ("Como Comprar")
Caixas de destaque que chamam atenção sem quebrar a elegância.
*   Fundo em gradiente suave.
*   Borda esquerda grossa e brilhante (usando a cor verde do WhatsApp).
*   Títulos em caixa-alta (`text-transform: uppercase`) e peso extra para legibilidade.

### Carrinho Flutuante (Floating Action Button)
*   Posição fixa no canto inferior direito.
*   Design totalmente em formato de **"Moeda de Aço"**: Fundo `linear-gradient(135deg, #f4f6f8 0%, #c9d0d6 50%, #aab1b8 100%)` e borda de 2px branca para simular reflexo.
*   Sombra de profundidade elevada e transição de flutuação (`transform: translateY`) ao sofrer *hover*.

### Botões (Buttons)
*   **Primário Metálico (`.btn-finish`)**: Fundo cinza-aço (`--accent`), sem bordas extras. Cor do texto escura para contraste reverso.
*   **Secundário Vazado (`.btn-export`)**: Fundo transparente, borda metálica fina (`1.5px solid var(--accent-border)`), texto metálico. Adquire cor sólida no *hover*.
*   **Whatsapp (`.btn-whatsapp`)**: Usa a cor verde natural da plataforma ou o próprio botão em aço inox para se mesclar ao sistema de design, mas com comportamento de envio. No projeto, padronizou-se em botão sólido em inox.

---

## 5. Guias de Animação e Espaçamentos

*   **Transições**: Todos os elementos interativos usam `transition: 0.15s` até `0.3s` para mudanças de cor, borda e fundo. O fechamento e abertura de menus laterais (como a gaveta do carrinho) usam `cubic-bezier(.4,0,.2,1)` para um deslize natural e não mecânico.
*   **Espaçamento**: O sistema utiliza escala baseada em múltiplos de 4px (ex: `8px`, `12px`, `16px`, `24px`).
*   **Arredondamentos**: `6px` para campos pequenos, `10px` para cartões de tamanho médio, e `999px` para elementos tipo "pílula" (pill) ou botões flutuantes.
