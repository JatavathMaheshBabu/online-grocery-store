(function(){
// Data - local product catalog
const PRODUCTS = [
{ id: 'salt', name: 'Salt', price: 2.00, category: 'Pantry', color:'#f97316' },
{ id: 'apple', name: 'Apple', price: 5.00, category: 'Fruits', color:'#ef4444' },
{ id: 'orange', name: 'Orange', price: 4.00, category: 'Fruits', color:'#f59e0b' },
{ id: 'oil', name: 'Oil', price: 8.00, category: 'Pantry', color:'#facc15' },
{ id: 'milk', name: 'Milk', price: 3.50, category: 'Dairy', color:'#60a5fa' },
{ id: 'bread', name: 'Bread', price: 2.50, category: 'Bakery', color:'#fb7185' },
{ id: 'rice', name: 'Rice (5kg)', price: 25.00, category: 'Grains', color:'#10b981' },
{ id: 'egg', name: 'Eggs (6)', price: 3.75, category: 'Dairy', color:'#a78bfa' }
];
  
// Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const tagsContainer = document.getElementById('tags');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearBtn = document.getElementById('clearBtn');
const openCartMobile = document.getElementById('openCartMobile');
const cartCountMobile = document.getElementById('cartCountMobile');
const CART_KEY = 'grocery_cart_v2';

// State
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
let filter = { q: '', category: 'all', tag: null };

// initialize categories & tags
const categories = Array.from(new Set(PRODUCTS.map(p => p.category)));
categories.forEach(cat => {
const opt = document.createElement('option'); opt.value = cat; opt.textContent = cat; categorySelect.appendChild(opt);
});

// create tag chips (category quick filters)
function renderTags(){
tagsContainer.innerHTML = '';
const allTag = document.createElement('button');
allTag.className = 'btn ghost'; allTag.textContent = 'All'; allTag.onclick = ()=> { filter.tag = null; filter.category='all'; categorySelect.value='all'; renderProducts();};
tagsContainer.appendChild(allTag);
categories.forEach(cat=>{
const b = document.createElement('button');
b.className = 'btn ghost';
b.textContent = cat;
b.onclick = ()=> { filter.tag = cat; filter.category = cat; categorySelect.value = cat; renderProducts(); };
tagsContainer.appendChild(b);
});
}
// product card factory
function createCard(p){
const el = document.createElement('article');
el.className = 'card';
el.innerHTML = `
<div class="img" aria-hidden="true" style="background:linear-gradient(135deg, ${p.color}, #ffffff22);color:#fff">
<div style="font-size:20px">${p.name.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
</div>
<div>
<h3 class="title">${escapeHtml(p.name)}</h3>
<div class="muted price">$${p.price.toFixed(2)}</div>
</div>
el.innerHTML = `
  ...
  <button class="btn primary" data-id="${p.id}">Add to cart</button>
  <button class="btn ghost" data-info="${p.id}">Info</button>
`;
return el;
}
// render products using current filter
function renderProducts(){
const q = (filter.q||'').trim().toLowerCase();
const byCategory = filter.category === 'all' ? (()=>true) : (p=>p.category === filter.category);
const byTag = filter.tag ? (p=>p.category === filter.tag) : (()=>true);
const results = PRODUCTS.filter(p=>{
const matchesQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
return matchesQ && byCategory(p) && byTag(p);
});
productGrid.innerHTML = '';
if(results.length === 0){
productGrid.innerHTML = '<div class="muted">No products found.</div>';
return;
}
results.forEach(p=> productGrid.appendChild(createCard(p)));
}
</div>
</div>
`;
cartItemsEl.appendChild(li);
});
}
cartTotalEl.textContent = '$' + total.toFixed(2);
cartCountMobile.textContent = count;
// update desktop cart count in header (if any)
// expose for debugging
window._cart = cart;
}
// escape helper
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
// initial render
renderTags();
renderProducts();
renderCart();

// events: product grid (delegation)
productGrid.addEventListener('click', (e)=>{
const add = e.target.closest('button[data-id]');
if(add){ addToCart(add.dataset.id); return; }
const info = e.target.closest('button[data-info]');
if(info){ const p = PRODUCTS.find(x=>x.id===info.dataset.info); alert(`${p.name}\nCategory: ${p.category}\nPrice: $${p.price.toFixed(2)}`); return; }
});
// cart interactions (delegation)
cartItemsEl.addEventListener('click', (e)=>{
const btnDec = e.target.closest('button[data-dec]');
if(btnDec){ const id = btnDec.dataset.dec; const idx = findIndex(id); if(idx>-1){ setQty(id, cart[idx].qty - 1); if(cart[idx] && cart[idx].qty<=0) removeFromCart(id); } return; }
const btnInc = e.target.closest('button[data-inc]');
if(btnInc){ const id = btnInc.dataset.inc; setQty(id, (cart.find(i=>i.id===id).qty + 1)); return; }
const btnRem = e.target.closest('button[data-remove]');
if(btnRem){ removeFromCart(btnRem.dataset.remove); return; }
});
// input change for qty
cartItemsEl.addEventListener('change', (e)=>{
const input = e.target.closest('input[data-input]');
if(input){ setQty(input.dataset.input, Number(input.value) || 1); }
});
// search and category
searchInput.addEventListener('input', (e)=>{ filter.q = e.target.value; renderProducts(); });
categorySelect.addEventListener('change', (e)=>{ filter.category = e.target.value; renderProducts(); });
// checkout & clear
checkoutBtn.addEventListener('click', ()=>{
if(cart.length === 0){ alert('Your cart is empty.'); return; }
const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
alert(`Checkout — Total: $${total.toFixed(2)}\\n(This is a demo.)`);
clearCart();
});
clearBtn.addEventListener('click', ()=>{ if(confirm('Clear cart?')) clearCart(); });
// mobile drawer open/close
let backdropEl = null;
openCartMobile.addEventListener('click', ()=>{
const isOpen = openCartMobile.getAttribute('aria-expanded') === 'true';
if(isOpen){ closeDrawer(); return; }
openDrawer();
});
function openDrawer(){
// create backdrop
backdropEl = document.createElement('div'); backdropEl.className='backdrop';
document.body.appendChild(backdropEl);
// clone cart into drawer (move element)
const drawer = document.getElementById('cart');
drawer.classList.add('drawer');
// show and set aria
openCartMobile.setAttribute('aria-expanded','true');
backdropEl.addEventListener('click', closeDrawer);
// ensure it is visible (in case CSS hidden)
drawer.style.display = 'block';
}
function closeDrawer(){
openCartMobile.setAttribute('aria-expanded','false');
if(backdropEl){ backdropEl.remove(); backdropEl=null; }
const drawer = document.getElementById('cart');
drawer.classList.remove('drawer');
drawer.style.display = '';
}
window.addEventListener('keydown', (e)=>{ if(e.key === 'c') { if(window.matchMedia('(max-width:900px)').matches) openDrawer(); } });
window.__Grocery = { addToCart, clearCart, cart };
})();
