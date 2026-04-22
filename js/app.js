/* ═══════════════════════════════════════════════════════════
   TABELA DE PRODUTOS — Metalúrgica e Selaria Lageana
   ───────────────────────────────────────────────────────────
   ⚠ MODELO DE SEGURANÇA
   Aplicativo front-end puro: o cliente controla o próprio
   navegador e sempre pode, em teoria, alterar JS/DOM.
   NÃO CONFIE no preço/total da mensagem do WhatsApp. Ao
   receber um pedido SEMPRE recalcule na tabela oficial antes
   de confirmar. O app aplica hardening em profundidade
   (freeze do catálogo, lookup autoritativo, sanitização,
   CSP, limites), mas nada disso substitui a conferência
   manual do vendedor.
   ═══════════════════════════════════════════════════════════ */
'use strict';

// ─── CONFIG ──────────────────────────────────────────────
const WHATSAPP_NUMBER = '5549999831358';
const MAX_QTY       = 9999;
const MAX_NAME_LEN  = 80;
const MAX_PHONE_LEN = 20;
const MAX_OBS_LEN   = 300;
const MAX_METHOD    = 20;

// ─── FONTE OFICIAL DE PREÇOS ─────────────────────────────
// Congela o catálogo para impedir mutação acidental pelo app.
Object.freeze(dados);
dados.forEach(Object.freeze);

// Índice canônico por chave (categoria|produto|tipo).
// Toda adição ao carrinho passa por aqui — chaves que não
// existem no catálogo são rejeitadas silenciosamente.
const productIndex = new Map();
dados.forEach(d => productIndex.set(`${d.c}|${d.p}|${d.t}`, d));

// ─── UTILIDADES ──────────────────────────────────────────
const norm = s => (s || '').toString().toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu, '');

const fmt = n => (Number.isFinite(n) ? n : 0)
  .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const today = () => new Date().toLocaleDateString('pt-BR');

// Sanitiza texto digitado pelo cliente: tira chars de controle,
// asteriscos (quebram markdown do WhatsApp) e comprime espaços.
function cleanInput(s, maxLen) {
  return (s || '').toString()
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function clampQty(n) {
  const v = parseInt(n, 10);
  if (!Number.isFinite(v) || v < 1) return 0;
  return Math.min(v, MAX_QTY);
}

// ─── GRUPOS ──────────────────────────────────────────────
const catOrder = [];
const grupos = dados.reduce((acc, it) => {
  if (!acc[it.c]) { acc[it.c] = []; catOrder.push(it.c); }
  acc[it.c].push(it);
  return acc;
}, {});
catOrder.sort((a, b) => a.localeCompare(b, 'pt-BR'));

const catSel = document.getElementById('cat');
catOrder.forEach(c => {
  const o = document.createElement('option');
  o.value = c;
  o.textContent = c;
  catSel.appendChild(o);
});

// ─── TABELA ──────────────────────────────────────────────
const tbody = document.getElementById('tbody');
const emptyDiv = document.getElementById('empty');

function renderTable(qText = '', qCat = '') {
  tbody.textContent = '';
  let count = 0;
  const q = norm(qText);

  catOrder.forEach(cat => {
    if (qCat && qCat !== cat) return;
    const items = (grupos[cat] || []).filter(({ p, t }) =>
      norm(`${cat} ${p} ${t}`).includes(q)
    );
    if (!items.length) return;

    // Cabeçalho do grupo
    const trG = document.createElement('tr');
    trG.className = 'group-row';
    const tdG = document.createElement('td');
    tdG.colSpan = 5;
    tdG.appendChild(document.createTextNode(cat + ' '));
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = `${items.length} item(s)`;
    tdG.appendChild(pill);
    trG.appendChild(tdG);
    tbody.appendChild(trG);

    // Linhas de produto
    items.forEach(({ c, p, t, v }) => {
      const key = `${c}|${p}|${t}`;
      const tr  = document.createElement('tr');
      tr.className = 'data-row';

      const tdCat  = document.createElement('td');
      tdCat.textContent = c;

      const tdProd = document.createElement('td');
      const spanP  = document.createElement('span');
      spanP.className = 'product-title';
      spanP.textContent = p;
      tdProd.appendChild(spanP);

      const tdTipo = document.createElement('td');
      tdTipo.className = 'tipo-col';
      tdTipo.textContent = t;

      const tdPrice = document.createElement('td');
      tdPrice.className = 'price';
      tdPrice.textContent = fmt(v);

      const tdAdd = document.createElement('td');
      tdAdd.className = 'add-col';
      const btn = document.createElement('button');
      btn.className = 'btn btn-add';
      btn.type = 'button';
      btn.dataset.key = key;
      btn.setAttribute('aria-label', 'Adicionar ao pedido');
      btn.textContent = '+';
      tdAdd.appendChild(btn);

      tr.append(tdCat, tdProd, tdTipo, tdPrice, tdAdd);
      tbody.appendChild(tr);
      count++;
    });
  });

  emptyDiv.classList.toggle('hidden', count > 0);
  syncAddButtons();
}

document.getElementById('q').addEventListener('input', e =>
  renderTable(e.target.value, catSel.value));
catSel.addEventListener('change', e =>
  renderTable(document.getElementById('q').value, e.target.value));

tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add');
  if (btn) addToCart(btn.dataset.key);
});

// ─── CARRINHO ────────────────────────────────────────────
const cart = new Map();   // key → { c, p, t, v, qty }

function saveCart() {
  localStorage.setItem('cartBarracao', JSON.stringify(Array.from(cart.entries())));
}

function loadCart() {
  try {
    const saved = localStorage.getItem('cartBarracao');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.forEach(([k, v]) => {
        const src = productIndex.get(k);
        if (src) {
          cart.set(k, { c: src.c, p: src.p, t: src.t, v: src.v, qty: clampQty(v.qty) });
        }
      });
    }
  } catch(e) {}
}

const cartDrawer = document.getElementById('cartDrawer');
const cartBody   = document.getElementById('cartBody');
const cartQty    = document.getElementById('cartQty');
const cartSum    = document.getElementById('cartSum');

document.getElementById('btnCart').addEventListener('click', () =>
  cartDrawer.classList.add('open'));
const floatingCartBtn = document.getElementById('floatingCart');
if (floatingCartBtn) {
  floatingCartBtn.addEventListener('click', () => cartDrawer.classList.add('open'));
}
document.getElementById('btnCloseCart').addEventListener('click', () =>
  cartDrawer.classList.remove('open'));

// addToCart RECUSA chaves que não estão no catálogo oficial.
// Preço e descrição são SEMPRE lidos do catálogo, nunca do DOM.
function addToCart(key) {
  const src = productIndex.get(key);
  if (!src) return;
  const cur = cart.get(key) || { c: src.c, p: src.p, t: src.t, v: src.v, qty: 0 };
  // Re-sincroniza com o catálogo a cada adição (ignora qualquer mutação)
  cur.c = src.c; cur.p = src.p; cur.t = src.t; cur.v = src.v;
  cur.qty = Math.min(cur.qty + 1, MAX_QTY);
  cart.set(key, cur);
  renderCart();
  syncAddButtons();
}

function renderCart() {
  cartBody.textContent = '';
  let total = 0;
  let qty = 0;

  cart.forEach((item, key) => {
    // Re-valida contra catálogo a cada render — se sumiu, pula
    const src = productIndex.get(key);
    if (!src) { cart.delete(key); return; }
    item.v = src.v; // força preço oficial

    total += item.v * item.qty;
    qty   += item.qty;

    const tr = document.createElement('tr');

    const tdNome = document.createElement('td');
    tdNome.textContent = item.p;
    if (item.t !== '--') {
      tdNome.appendChild(document.createTextNode(' '));
      const span = document.createElement('span');
      span.className = 'cart-variant';
      span.textContent = `(${item.t})`;
      tdNome.appendChild(span);
    }

    const tdUnit = document.createElement('td');
    tdUnit.className = 'hide-sm';
    tdUnit.textContent = fmt(item.v);

    const tdQty = document.createElement('td');
    const input = document.createElement('input');
    input.className = 'qty-input';
    input.type = 'number';
    input.inputMode = 'numeric';
    input.min = '1';
    input.max = String(MAX_QTY);
    input.value = String(item.qty);
    input.dataset.key = key;
    tdQty.appendChild(input);

    const tdSub = document.createElement('td');
    tdSub.textContent = fmt(item.v * item.qty);

    const tdDel = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'btn btn-del';
    btn.type = 'button';
    btn.dataset.key = key;
    btn.setAttribute('aria-label', 'Remover item');
    btn.textContent = '✕';
    tdDel.appendChild(btn);

    tr.append(tdNome, tdUnit, tdQty, tdSub, tdDel);
    cartBody.appendChild(tr);
  });

  cartQty.textContent = String(qty);
  cartSum.textContent = fmt(total);
  const floatBadge = document.getElementById('floatingCartQty');
  if (floatBadge) floatBadge.textContent = String(qty);

  saveCart();
}

cartBody.addEventListener('change', e => {
  const input = e.target.closest('.qty-input');
  if (!input) return;
  const key = input.dataset.key;
  if (!cart.has(key)) return;
  const newQty = clampQty(input.value);
  if (newQty > 0) {
    cart.get(key).qty = newQty;
    input.value = String(newQty);
  } else {
    cart.delete(key);
    syncAddButtons();
  }
  renderCart();
});

cartBody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-del');
  if (!btn) return;
  cart.delete(btn.dataset.key);
  renderCart();
  syncAddButtons();
});

function syncAddButtons() {
  document.querySelectorAll('#tbody .btn-add').forEach(btn => {
    btn.classList.toggle('added', cart.has(btn.dataset.key));
  });
}

// ─── VALIDAÇÃO ───────────────────────────────────────────
const requiredFields = [
  { id: 'clientName',     validate: v => cleanInput(v, MAX_NAME_LEN).length >= 2 },
  { id: 'clientLastName', validate: v => cleanInput(v, MAX_NAME_LEN).length >= 2 },
  { id: 'paymentMethod',  validate: v => v.trim().length > 0 },
];

function validateForm() {
  let ok = true;
  requiredFields.forEach(({ id, validate }) => {
    const el = document.getElementById(id);
    const valid = validate(el.value);
    el.classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  return ok;
}

requiredFields.forEach(({ id }) => {
  const el = document.getElementById(id);
  const evt = el.tagName === 'SELECT' ? 'change' : 'input';
  el.addEventListener(evt, () => el.classList.remove('invalid'));
});

// ─── FINALIZAR ───────────────────────────────────────────
const modal       = document.getElementById('modal');
const btnFinish   = document.getElementById('btnFinish');
const modalClose  = document.getElementById('modalClose');
const btnModalClose2 = document.getElementById('btnModalClose2');
const btnSendWhats   = document.getElementById('btnSendWhats');
const btnDownload    = document.getElementById('btnDownload');

document.getElementById('orderDate').value = today();

btnFinish.addEventListener('click', () => {
  if (!cart.size) { alert('Seu pedido está vazio! Adicione produtos antes de continuar.'); return; }
  if (!validateForm()) {
    const first = document.querySelector('.cart-form .invalid');
    if (first) first.focus();
    return;
  }
  buildReceipt();
  modal.classList.add('show');
});
[modalClose, btnModalClose2].forEach(b => b.addEventListener('click', () =>
  modal.classList.remove('show')));

// Snapshot confiável: sempre re-lê preços do catálogo oficial e
// re-calcula o total. É este objeto que gera o recibo e o envio.
function snapshotOrder() {
  const items = [];
  let subtotal = 0;
  cart.forEach((item, key) => {
    const src = productIndex.get(key);
    if (!src) return;
    const qty = clampQty(item.qty);
    if (qty === 0) return;
    const unit = src.v;
    subtotal += unit * qty;
    items.push({ c: src.c, p: src.p, t: src.t, v: unit, qty });
  });
  return {
    client: cleanInput(document.getElementById('clientName').value, MAX_NAME_LEN) + ' ' + cleanInput(document.getElementById('clientLastName').value, MAX_NAME_LEN),
    date:   today(),
    method: cleanInput(document.getElementById('paymentMethod').value,  MAX_METHOD),
    obs:    cleanInput(document.getElementById('observations').value,   MAX_OBS_LEN),
    items,
    total:  Math.round(subtotal * 100) / 100,
  };
}

function buildReceipt() {
  const order = snapshotOrder();

  // receiptDetails — sem innerHTML, tudo via textContent
  const details = document.getElementById('receiptDetails');
  details.textContent = '';
  const detailList = [
    ['Cliente',   order.client],
    ['Data',      order.date],
    ['Pagamento', order.method],
    ['Total',     fmt(order.total), 'total-value'],
  ];
  detailList.forEach(([label, val, cls]) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label;
    p.appendChild(strong);
    const span = document.createElement(cls ? 'b' : 'span');
    if (cls) span.className = cls;
    span.textContent = val;
    p.appendChild(span);
    details.appendChild(p);
  });
  if (order.obs) {
    const p = document.createElement('p');
    p.className = 'receipt-obs';
    const strong = document.createElement('strong');
    strong.textContent = 'Observações';
    p.appendChild(strong);
    p.appendChild(document.createTextNode(order.obs));
    details.appendChild(p);
  }

  // receiptItems
  const wrap = document.getElementById('receiptItems');
  wrap.textContent = '';
  const table = document.createElement('table');
  table.className = 'cart-table receipt-items-table';
  const thead = document.createElement('thead');
  const trH = document.createElement('tr');
  ['Produto', 'Unit.', 'Qtd', 'Total'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trH.appendChild(th);
  });
  thead.appendChild(trH);
  table.appendChild(thead);
  const tb2 = document.createElement('tbody');
  order.items.forEach(it => {
    const tr = document.createElement('tr');
    const nome = it.t !== '--' ? `${it.p} (${it.t})` : it.p;
    [nome, fmt(it.v), String(it.qty), fmt(it.v * it.qty)].forEach(v => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    tb2.appendChild(tr);
  });
  table.appendChild(tb2);
  wrap.appendChild(table);

  btnSendWhats.onclick = () => sendToWhatsApp(order);
  btnDownload.onclick  = () => downloadTxt(order);
}

function buildOrderText(o) {
  const lines = [
    '==============================',
    '  METALÚRGICA E SELARIA LAGEANA',
    '          NOVO PEDIDO',
    '==============================',
    '',
    `Cliente: ${o.client}`,
    `Data: ${o.date}`,
    `Forma de Pagamento: ${o.method}`,
  ];
  if (o.obs) lines.push(`Observações: ${o.obs}`);
  lines.push('', '------------------------------', '          ITENS', '------------------------------');
  o.items.forEach(it => {
    const nome = `${it.p}${it.t !== '--' ? ' (' + it.t + ')' : ''}`;
    lines.push(nome);
    lines.push(`   ${it.qty} un x ${fmt(it.v)} = ${fmt(it.v * it.qty)}`);
    lines.push('');
  });
  lines.push('------------------------------');
  lines.push(`TOTAL GERAL: ${fmt(o.total)}`);
  lines.push('==============================');
  lines.push('(!) Preços sujeitos a conferência pelo vendedor.');
  return lines.join('\n');
}

function buildWhatsMessage(o) {
  const lines = [
    '*🔧 METALÚRGICA E SELARIA LAGEANA*',
    '*NOVO PEDIDO*',
    '',
    `*Cliente:* ${o.client}`,
    `*Data:* ${o.date}`,
    `*Pagamento:* ${o.method}`,
  ];
  if (o.obs) lines.push(`*Observações:* ${o.obs}`);
  lines.push('', '─────────────', '*ITENS*', '─────────────');
  o.items.forEach(it => {
    const nome = `${it.p}${it.t !== '--' ? ' (' + it.t + ')' : ''}`;
    lines.push(`• ${nome}`);
    lines.push(`   ${it.qty} un × ${fmt(it.v)} = *${fmt(it.v * it.qty)}*`);
  });
  lines.push('─────────────');
  lines.push(`*TOTAL: ${fmt(o.total)}*`);
  lines.push('');
  lines.push('_Preços sujeitos a conferência pelo vendedor._');
  return lines.join('\n');
}

function sendToWhatsApp(o) {
  const msg = buildWhatsMessage(o);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  openExternal(url);
}

function downloadTxt(o) {
  const text = buildOrderText(o);
  const safeName = o.client.replace(/\s+/g, '-').replace(/[^\w\-]/g, '') || 'cliente';
  const safeDate = o.date.replace(/\//g, '-');
  const filename = `pedido-${safeName}-${safeDate}.txt`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openExternal(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── INIT ─────────────────────────────────────────────────
loadCart();
renderTable();
renderCart();

// Scroll handler para mostrar/esconder carrinho flutuante
window.addEventListener('scroll', () => {
  if (floatingCartBtn) {
    if (window.scrollY > 100) {
      floatingCartBtn.classList.add('visible');
    } else {
      floatingCartBtn.classList.remove('visible');
    }
  }
});
