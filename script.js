const products = [
  ['Sunday Linen Trouser',68,'clothing','Washed linen · 3 colours','photo-1594633312681-425c7b97ccd1','Just arrived'],
  ['Everyday Cotton Shirt',74,'clothing','Organic cotton · 4 colours','photo-1596755094514-f87e34085b2c',''],
  ['Little Carryall Bag',92,'accessories','Recycled leather · 2 colours','photo-1584917865442-de89df76afd3','Almost gone'],
  ['Sunday Knit Sweater',86,'clothing','Responsible wool · 3 colours','photo-1551488831-00ddcb6c6bd3',''],
  ['Weekend Wrap Dress',98,'clothing','Soft cotton · 2 colours','photo-1539109136881-3be0616acf4b','New'],
  ['Everywhere Tote',48,'accessories','Recycled canvas · 3 colours','photo-1590874103328-eac38a683ce7',''],
  ['Soft Form Tee',38,'clothing','Organic cotton · 5 colours','photo-1521572163474-6864f9cf17ab','Bestseller'],
  ['Easy Day Cardigan',110,'clothing','Responsible wool · 2 colours','photo-1576566588028-4147f3842f27',''],
  ['Sunday Market Shirt',79,'clothing','Linen blend · 3 colours','photo-1603252109303-2751441dd157',''],
  ['Everyday Crossbody',84,'accessories','Recycled leather · 2 colours','photo-1548036328-c9fa89d128fa',''],
  ['Soft Structure Blazer',145,'clothing','Tencel blend · 2 colours','photo-1591047139829-d91aecb6caea',''],
  ['Easy Rib Tank',34,'clothing','Organic cotton · 4 colours','photo-1503342217505-b0a15ec3261c',''],
  ['Cloud Knit Scarf',42,'accessories','Responsible wool · 3 colours','photo-1601924994987-69e26d50dc26',''],
  ['Daylight Midi Skirt',72,'clothing','Washed cotton · 3 colours','photo-1583496661160-fb5886a0aaaa',''],
  ['Good Form Jumpsuit',118,'clothing','Tencel blend · 2 colours','photo-1548624149-f3b4c8b7a6c4',''],
  ['Little Things Pouch',29,'accessories','Recycled canvas · 3 colours','photo-1590874103328-eac38a683ce7',''],
  ['Slow Morning Hoodie',88,'clothing','Organic cotton · 2 colours','photo-1556821840-3a63f95609a7',''],
  ['Everyday Bucket Hat',36,'accessories','Linen blend · 2 colours','photo-1521369909029-2afed882baee',''],
  ['Soft Hours Maxi Dress',124,'clothing','Washed linen · 2 colours','photo-1566174053879-31528523f8ae',''],
  ['Studio Weekend Bag',105,'accessories','Recycled canvas · 2 colours','photo-1553062407-98eeb64c6a62','']
].map(([name,price,category,details,image,tag], index) => ({id:index+1,name,price,category,details,image,tag}));

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const bagCount = document.querySelector('.bag-count');
const bagButton = document.querySelector('.bag-button');
const toast = document.querySelector('.toast');
const cartDrawer = document.querySelector('.cart-drawer');
const cartItems = document.querySelector('.cart-items');
const cartStorageKey = 'forme-studio-cart-v1';
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
let toastTimer;
let revealObserver;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2400);
}

function renderProducts(filter = 'all') {
  const grid = document.querySelector('.product-grid');
  const visibleProducts = products.filter(product => filter === 'all' || product.category === filter);
  grid.innerHTML = visibleProducts.map(product => `
    <article class="product-card" data-category="${product.category}">
      <div class="product-image-wrap">
        <img src="https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=900&q=80" alt="${product.name}" loading="lazy">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
        <button class="favorite-button" aria-label="Save ${product.name}" aria-pressed="false">♡</button>
        <button class="quick-add" data-product-id="${product.id}">Add to bag <span>+</span></button>
      </div>
      <div class="product-info"><div><h3>${product.name}</h3><p>${product.details}</p></div><span class="price">$${product.price}</span></div>
    </article>`).join('');
  document.querySelector('.product-count').textContent = `${String(visibleProducts.length).padStart(2,'0')} pieces`;
  document.querySelector('.carousel-viewport').scrollLeft = 0;
  updateCarousel();
  if (revealObserver) grid.querySelectorAll('.product-card').forEach((card,index) => {
    card.classList.add('is-revealed');
    card.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
    revealObserver.observe(card);
  });
}

function updateCarousel() {
  const viewport = document.querySelector('.carousel-viewport');
  const cards = document.querySelectorAll('.product-card');
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  if (!viewport || !prev || !next) return;
  const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const firstVisible = cards.length && cards[0].getBoundingClientRect().width
    ? Math.min(cards.length, Math.floor((viewport.scrollLeft + 8) / (cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(document.querySelector('.product-grid')).columnGap || 0))) + 1)
    : 1;
  document.querySelector('.carousel-position').innerHTML = `${String(firstVisible).padStart(2,'0')} <i></i> ${String(cards.length).padStart(2,'0')}`;
  prev.disabled = viewport.scrollLeft <= 2;
  next.disabled = viewport.scrollLeft >= maxScroll - 2 || maxScroll === 0;
}

function saveCart() { localStorage.setItem(cartStorageKey, JSON.stringify(cart)); }
function cartQuantity() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function updateCart() {
  const quantity = cartQuantity();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  bagCount.textContent = quantity;
  bagButton.setAttribute('aria-label', `Shopping bag, ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
  document.querySelector('.drawer-count').textContent = `(${quantity})`;
  document.querySelector('.cart-subtotal strong').textContent = `$${subtotal.toFixed(2)}`;
  document.querySelector('.cart-empty').hidden = cart.length > 0;
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item"><img src="https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=180&q=75" alt="">
      <div class="cart-item-info"><strong>${item.name}</strong><span>$${item.price}</span>
        <div class="quantity-control"><button data-cart-action="minus" data-id="${item.id}" aria-label="Remove one ${item.name}">−</button><span>${item.quantity}</span><button data-cart-action="plus" data-id="${item.id}" aria-label="Add one ${item.name}">+</button></div>
      </div><button class="remove-item" data-cart-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button></div>`).join('');
  saveCart();
}

function openCart() {
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden','false');
  document.body.classList.add('cart-open');
  document.querySelector('.cart-close').focus();
}
function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden','true');
  document.body.classList.remove('cart-open');
  bagButton.focus();
}

renderProducts();
updateCart();

const carouselViewport = document.querySelector('.carousel-viewport');
document.querySelector('.carousel-prev').addEventListener('click', () => carouselViewport.scrollBy({left:-carouselViewport.clientWidth,behavior:'smooth'}));
document.querySelector('.carousel-next').addEventListener('click', () => carouselViewport.scrollBy({left:carouselViewport.clientWidth,behavior:'smooth'}));
carouselViewport.addEventListener('scroll', updateCarousel, {passive:true});
window.addEventListener('resize', updateCarousel);

// Give each product a soft 3D response on devices with a precise pointer.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelector('.product-grid').addEventListener('pointermove', event => {
    const card = event.target.closest('.product-card');
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`);
    card.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`);
    card.style.setProperty('--shine-x', `${x * 100}%`);
    card.style.setProperty('--shine-y', `${y * 100}%`);
    card.classList.add('is-tilting');
  });
  document.querySelector('.product-grid').addEventListener('pointerleave', event => {
    const card = event.target.closest('.product-card');
    if (!card) return;
    card.classList.remove('is-tilting');
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  }, true);
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }), {threshold: 0.12});
  document.querySelectorAll('.product-card').forEach((card,index) => {
    card.classList.add('is-revealed');
    card.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
    revealObserver.observe(card);
  });
}

menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
}));

document.querySelector('.filter-row').addEventListener('click', event => {
  const button = event.target.closest('.filter-chip');
  if (!button) return;
  document.querySelector('.filter-chip.active')?.classList.remove('active');
  button.classList.add('active');
  renderProducts(button.dataset.filter);
});

document.querySelector('.product-grid').addEventListener('click', event => {
  const addButton = event.target.closest('.quick-add');
  if (addButton) {
    const product = products.find(item => item.id === Number(addButton.dataset.productId));
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({...product, quantity:1});
    updateCart();
    showToast(`${product.name} added to your bag`);
    return;
  }
  const favorite = event.target.closest('.favorite-button');
  if (favorite) {
    const saved = favorite.classList.toggle('is-favorite');
    favorite.textContent = saved ? '♥' : '♡';
    favorite.setAttribute('aria-pressed',String(saved));
    showToast(saved ? 'Added to your saved things' : 'Removed from your saved things');
  }
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const item = cart.find(product => product.id === Number(button.dataset.id));
  if (button.dataset.cartAction === 'remove' || (button.dataset.cartAction === 'minus' && item.quantity === 1)) cart = cart.filter(product => product.id !== item.id);
  else if (button.dataset.cartAction === 'minus') item.quantity--;
  else item.quantity++;
  updateCart();
});

bagButton.addEventListener('click',openCart);
document.querySelector('.cart-close').addEventListener('click',closeCart);
cartDrawer.querySelectorAll('[data-close-cart]').forEach(element => element.addEventListener('click',closeCart));
document.addEventListener('keydown',event => { if (event.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart(); });

document.querySelector('.search-toggle').addEventListener('click', () => {
  const query = window.prompt('Search all 20 pieces');
  if (!query?.trim()) return;
  const found = products.find(product => product.name.toLowerCase().includes(query.trim().toLowerCase()));
  if (found) {
    document.querySelector('[data-filter="all"]').click();
    document.querySelector('.product-grid').querySelectorAll('.product-card')[found.id - 1]?.scrollIntoView({behavior:'smooth',block:'center'});
  } else showToast(`No pieces found for “${query.trim()}”`);
});

document.querySelector('.contact-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Forme Studio enquiry from ${data.get('name')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href = `mailto:hello@formestudio.com?subject=${subject}&body=${body}`;
});

document.querySelector('.checkout-button').addEventListener('click', () => {
  if (!cart.length) return showToast('Your bag is empty for now');
  const lines = cart.map(item => `${item.quantity} × ${item.name} — $${(item.price * item.quantity).toFixed(2)}`).join('\n');
  const total = cart.reduce((sum,item) => sum + item.price * item.quantity,0);
  const body = encodeURIComponent(`Hello Forme Studio,\n\nI would like to order:\n${lines}\n\nSubtotal: $${total.toFixed(2)}\n\nPlease contact me to complete this order.`);
  window.location.href = `mailto:hello@formestudio.com?subject=${encodeURIComponent('New order enquiry')}&body=${body}`;
});

document.querySelector('.newsletter-form').addEventListener('submit',event => {
  event.preventDefault();
  const email = document.querySelector('#email');
  if (!email.reportValidity()) return;
  document.querySelector('.form-message').textContent = 'Thanks! Newsletter signup needs a connected email service.';
  email.value = '';
});
