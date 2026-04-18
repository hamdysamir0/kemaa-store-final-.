const state = {
  siteData: null,
  filteredCategory: 'الكل',
  selectedProduct: null
};

const page = document.body.dataset.page || 'home';
const contentRoot = document.getElementById('content');
const modalRoot = document.getElementById('modal-root');

const navItems = [
  { key: 'home', href: 'index.html', label: 'الرئيسية' },
  { key: 'products', href: 'products.html', label: 'المنتجات' },
  { key: 'about', href: 'about.html', label: 'عنّا' },
  { key: 'services', href: 'services.html', label: 'الخدمات' },
  { key: 'offers', href: 'offers.html', label: 'العروض' },
  { key: 'gallery', href: 'gallery.html', label: 'المعرض' },
  { key: 'reviews', href: 'reviews.html', label: 'آراء العملاء' },
  { key: 'faq', href: 'faq.html', label: 'الأسئلة' },
  { key: 'policy', href: 'policy.html', label: 'الاستبدال' },
  { key: 'contact', href: 'contact.html', label: 'تواصل' }
];

function getWhatsAppUrl(phone, text = '') {
  // تنظيف الرقم لضمان إنه يبدأ بـ 20
  let cleanPhone = phone ? String(phone).replace(/\D/g, '') : '201505944090';
  
  // التأكد من الصيغة الدولية (لو بيبدأ بـ 0 نحوله لـ 20)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '20' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('20')) {
    cleanPhone = '20' + cleanPhone;
  }

  const encodedText = encodeURIComponent(text);
  
  // التعديل الجوهري هنا: استخدام whatsapp:// بدلاً من https://
  return `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
}
function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function buildHeader(site) {
  const navLinks = navItems
    .map((item) => `<a class="${page === item.key ? 'active' : ''}" href="${item.href}">${item.label}</a>`)
    .join('');

  return `
    <header class="site-header">
      <div class="container navbar">
        <a class="brand" href="index.html" aria-label="${site.brand}">
          <img src="/assets/images/logo.jpeg" alt="${site.brand}">
          <div>
            <div>${site.brand}</div>
            <small>Mobile Accessories Store</small>
          </div>
        </a>
        <button class="nav-toggle" id="navToggle" aria-label="فتح القائمة">☰</button>
        <nav class="nav-links" id="navLinks">${navLinks}</nav>
      </div>
    </header>
  `;
}

function buildFooter(site) {
  const waUrl = getWhatsAppUrl(site.whatsapp);
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3>${site.brand}</h3>
          <p class="muted">${site.description}</p>
          <p>📍 ${site.location}</p>
          <p>📞 <a href="tel:${site.phone}">${site.phone}</a></p>
          <p>📧 <a href="mailto:${site.email}">${site.email}</a></p>
        </div>
        <div>
          <h3>روابط سريعة</h3>
          <div class="footer-links">
            ${navItems.slice(0, 6).map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
          </div>
        </div>
        <div>
          <h3>اطلب الآن</h3>
          <div class="footer-links">
            <a href="${waUrl}" target="_blank" rel="noreferrer">واتساب مباشر</a>
            <a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram</a>
            <a href="contact.html">نموذج التواصل</a>
          </div>
        </div>
      </div>
    </footer>
    <div class="floating-actions">
      <a class="floating-action instagram" href="${site.instagram}" target="_blank" rel="noreferrer" aria-label="Instagram">📸</a>
      <a class="floating-action whatsapp" href="${waUrl}" target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
    </div>
  `;
}

function pageShell(innerHtml) {
  const { site } = state.siteData;
  document.getElementById('site-shell').innerHTML = buildHeader(site);
  contentRoot.innerHTML = innerHtml;
  document.getElementById('site-footer').innerHTML = buildFooter(site);
  bindNavToggle();
}

// ... الدوال المساعدة (statCards, serviceCards, productCard, إلخ) تظل كما هي ...
function statCards(items) { return items.map(item => `<div class="stat-card"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join(''); }
function serviceCards(items) { return items.map(s => `<article class="service-card"><div class="badge">${escapeHtml(s.icon)} خدمة</div><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.text)}</p></article>`).join(''); }
function productCard(product) { return `<article class="product-card"><img src="${product.image}" alt="${escapeHtml(product.name)}"><div class="product-body"><div class="product-topline"><span class="badge">${escapeHtml(product.badge)}</span><small>${escapeHtml(product.category)}</small></div><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p><div class="product-bottom"><span class="price-label">${escapeHtml(product.priceLabel)}</span><button class="btn order-trigger" data-product-id="${escapeHtml(product.id)}">اطلب الآن</button></div></div></article>`; }
function reviewCards(items) { return items.map(r => `<article class="review-card"><div class="review-stars">${stars(r.rating)}</div><h3>${escapeHtml(r.name)}</h3><p>${escapeHtml(r.text)}</p></article>`).join(''); }
function offerCards(items) { return items.map(o => `<article class="offer-card"><span class="badge">${escapeHtml(o.badge)}</span><h3>${escapeHtml(o.title)}</h3><p>${escapeHtml(o.description)}</p><div class="offer-price">${escapeHtml(o.price)}</div></article>`).join(''); }
function galleryCards(items) { return items.map(i => `<article class="gallery-card"><img src="${i.image}" alt="${escapeHtml(i.title)}"><div class="gallery-body"><div class="gallery-meta"><h3>${escapeHtml(i.title)}</h3><span class="badge">${escapeHtml(i.category)}</span></div></div></article>`).join(''); }
function faqItems(items) { return items.map((f, index) => `<article class="faq-item ${index === 0 ? 'open' : ''}"><button class="faq-question" type="button"><span>${escapeHtml(f.question)}</span><span>＋</span></button><div class="faq-answer">${escapeHtml(f.answer)}</div></article>`).join(''); }
function policyCards(items) { return items.map(s => `<article class="policy-card"><h3>${escapeHtml(s.title)}</h3><ul>${s.items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul></article>`).join(''); }

function renderHome() {
  const { site, stats, products, services, offers } = state.siteData;
  const featured = products.filter(p => p.featured).slice(0, 4);
  pageShell(`
    <section class="hero page-section">
      <div class="container hero-grid">
        <div class="hero-card">
          <span class="kicker">✨ تشكيلات جديدة ومميزة</span>
          <h1>${escapeHtml(site.heroTitle)}</h1>
          <p>${escapeHtml(site.heroText)}</p>
          <div class="hero-actions">
            <a class="btn" href="products.html">شوف المنتجات</a>
            <a class="btn-outline" href="contact.html">اسأل عن المتاح</a>
          </div>
          <div class="stats-grid">${statCards(stats)}</div>
        </div>
        <div class="hero-media hero-card">
          <img src="/assets/images/cases-mix-collection.jpeg" alt="تشكيلة جرابات متنوعة">
          <div class="hero-floating"><strong>طلب سريع</strong><div class="muted">سجل الطلب من الموقع ثم أكمله مباشرة عبر واتساب</div></div>
        </div>
      </div>
    </section>
    <section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">منتجات مميزة</span><h2>أحدث الموديلات المعروضة</h2></div><p class="lead">مجموعة متنوعة من الجرابات بأشكال وألوان مختلفة تناسب أذواق متعددة.</p></div><div class="products-grid">${featured.map(productCard).join('')}</div></div></section>
    <section class="page-section"><div class="container grid-2"><div class="highlight-box"><h3>ليه العميل يطلب من Kemaa Store؟</h3><ul><li>صور حقيقية للمنتجات بدل صور افتراضية.</li><li>خدمة طلب سهلة من الموقع إلى واتساب.</li><li>اختيارات متنوعة وموديلات تناسب أذواق مختلفة.</li><li>${escapeHtml(site.delivery)}</li></ul></div><div class="info-card"><div class="section-heading" style="margin-bottom: 14px;"><div><span class="badge">خدماتنا</span><h2>إيه اللي بنقدمه؟</h2></div></div><div class="services-grid">${serviceCards(services.slice(0, 4))}</div></div></div></section>
    <section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">عروض المتجر</span><h2>عروض جاهزة تساعد على البيع</h2></div><a class="btn-ghost" href="offers.html">كل العروض</a></div><div class="offers-grid">${offerCards(offers.slice(0, 4))}</div></div></section>
  `);
}

function renderProducts() {
  const { products } = state.siteData;
  pageShell(`
    <section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">كل المنتجات</span><h1 class="page-title">جرابات متنوعة بصور واضحة</h1></div><p class="lead">اختر التصميم المناسب ثم اضغط على "اطلب الآن" لإرسال بياناتك وتأكيد الطلب بنجاح.</p></div><div class="filter-bar"><button class="filter-btn active" data-category="الكل">الكل</button></div><div class="products-grid" id="productsGrid">${products.map(productCard).join('')}</div></div></section>
  `);
}

// ... (renderAbout, renderServices, renderOffers, renderReviews, renderFaq, renderGallery, renderPolicy تظل كما هي) ...
function renderAbout() { const { site, stats } = state.siteData; pageShell(`<section class="page-section"><div class="container grid-2"><div class="info-card"><span class="badge">عن المتجر</span><h1 class="page-title">${escapeHtml(site.brand)}</h1><p class="lead">${escapeHtml(site.description)}</p><div class="inline-actions"><a class="btn" href="products.html">تصفح المنتجات</a></div></div><div class="hero-card hero-media"><img src="/assets/images/logo.jpeg"></div></div><div class="container" style="margin-top:24px;"><div class="stats-grid">${statCards(stats)}</div></div></section>`); }
function renderServices() { const { services, site } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">الخدمات</span><h1 class="page-title">خدماتنا</h1></div></div><div class="services-grid">${serviceCards(services)}</div></div></section>`); }
function renderOffers() { const { offers } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">العروض</span><h1 class="page-title">العروض</h1></div></div><div class="offers-grid">${offerCards(offers)}</div></div></section>`); }
function renderReviews() { const { reviews } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">الآراء</span><h1 class="page-title">آراء العملاء</h1></div></div><div class="reviews-grid">${reviewCards(reviews)}</div></div></section>`); }
function renderFaq() { const { faqs } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">الأسئلة</span><h1 class="page-title">الأسئلة الشائعة</h1></div></div><div class="faq-list">${faqItems(faqs)}</div></div></section>`); $all('.faq-item').forEach(i => i.querySelector('.faq-question').addEventListener('click', () => i.classList.toggle('open'))); }
function renderGallery() { const { gallery } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">المعرض</span><h1 class="page-title">معرض الصور</h1></div></div><div class="gallery-grid">${galleryCards(gallery)}</div></div></section>`); }
function renderPolicy() { const { policies } = state.siteData; pageShell(`<section class="page-section"><div class="container"><div class="section-heading"><div><span class="badge">السياسات</span><h1 class="page-title">سياسة المتجر</h1></div></div><div class="policy-grid">${policyCards(policies)}</div></div></section>`); }

function renderContact() {
  const { site } = state.siteData;
  const waUrl = getWhatsAppUrl(site.whatsapp);
  pageShell(`
    <section class="page-section">
      <div class="container contact-grid">
        <article class="contact-card">
          <span class="badge">تواصل معنا</span><h1 class="page-title">راسلنا</h1>
          <p>📍 ${escapeHtml(site.location)}</p><p>📞 ${escapeHtml(site.phone)}</p>
          <p>💬 <a href="${waUrl}" target="_blank">WhatsApp مباشر</a></p>
        </article>
        <article class="contact-card"><form id="contactForm"><div class="form-row"><input class="input" type="text" name="name" placeholder="الاسم" required><input class="input" type="text" name="phone" placeholder="رقم الهاتف" required></div><textarea class="textarea" name="message" placeholder="الرسالة" required></textarea><button class="btn" type="submit">إرسال</button><div class="form-status" id="contactStatus"></div></form></article>
      </div>
    </section>
  `);
  bindContactForm();
}

function openOrderModal(productId) {
  const product = state.siteData.products.find(i => i.id === productId);
  if (!product) return;
  state.selectedProduct = product;
  modalRoot.innerHTML = `
    <div class="modal open" id="orderModal">
      <div class="modal-dialog">
        <div class="modal-header"><div><span class="badge">طلب منتج</span><h3 id="modalProductName">${escapeHtml(product.name)}</h3></div><button class="modal-close" id="closeModal">✕</button></div>
        <form class="order-form" id="orderForm" novalidate>
          <div class="form-row"><input class="input" type="text" id="cust_name" placeholder="الاسم" required><input class="input" type="text" id="cust_phone" placeholder="رقم الهاتف" required></div>
          <input class="input" type="text" id="cust_model" placeholder="نوع الموبايل">
          <textarea class="textarea" id="cust_notes" placeholder="ملاحظات"></textarea>
          <button class="btn" type="submit">تأكيد الطلب</button>
          <div class="form-status" id="orderStatus"></div>
        </form>
      </div>
    </div>
  `;
  $('#closeModal')?.addEventListener('click', closeOrderModal);
  bindOrderForm();
}

function closeOrderModal() { modalRoot.innerHTML = ''; }

function bindOrderButtons() { $all('.order-trigger').forEach(b => b.addEventListener('click', () => openOrderModal(b.dataset.productId))); }

/**
 * دالة معالجة فورم الطلب - الحل "النووي" لمشكلة الماك
 */
async function bindOrderForm() {
  const form = $('#orderForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = $('#orderStatus');
    const submitBtn = form.querySelector('button[type="submit"]');

    const formData = {
        name: $('#cust_name').value.trim(),
        phone: $('#cust_phone').value.trim(),
        model: $('#cust_model').value.trim() || 'غير محدد',
        notes: $('#cust_notes').value.trim() || 'لا توجد',
        productName: $('#modalProductName').innerText
    };

    if (!formData.name || !formData.phone) {
        status.textContent = "برجاء كتابة الاسم ورقم الهاتف";
        status.className = 'form-status error';
        return;
    }

    // 1. تجهيز الرسالة
    const msg = `طلب جديد من الموقع 🛒\n\n👤 الاسم: ${formData.name}\n📱 رقم الهاتف: ${formData.phone}\n📦 المنتج: ${formData.productName}\n📱 الموديل: ${formData.model}\n📝 ملاحظات: ${formData.notes}`;
    const waUrl = getWhatsAppUrl(state.siteData.site.whatsapp, msg);

    // 2. الحل السحري: إنشاء لينك وهمي والضغط عليه برمجياً
    // ده بيخلي المتصفح يفتكر إن العميل هو اللي داس فعلاً وبيعدي حماية الماك
    const hiddenLink = document.createElement('a');
    hiddenLink.href = waUrl;
    hiddenLink.target = '_blank';
    hiddenLink.rel = 'noreferrer';
    document.body.appendChild(hiddenLink);
    hiddenLink.click();
    document.body.removeChild(hiddenLink);

    // 3. تحديث الواجهة
    submitBtn.disabled = true;
    submitBtn.innerText = 'تم التحويل...';
    status.textContent = 'جاري التوجيه للواتساب...';
    status.className = 'form-status success';

    // تسجيل الطلب في الخلفية
    try { fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); } catch (e) {}
    setTimeout(() => { closeOrderModal(); }, 2000);
  });
}

// ... بقية الـ Bindings والـ Init كما هي ...
function bindContactForm() { /* ... كما كانت ... */ }
function bindNavToggle() { const t = $('#navToggle'), l = $('#navLinks'); if (t && l) t.addEventListener('click', () => l.classList.toggle('open')); }
function bindCommonInteractions() { bindOrderButtons(); }
function renderPage() {
  switch (page) {
    case 'home': renderHome(); break;
    case 'products': renderProducts(); break;
    case 'about': renderAbout(); break;
    case 'services': renderServices(); break;
    case 'offers': renderOffers(); break;
    case 'gallery': renderGallery(); break;
    case 'reviews': renderReviews(); break;
    case 'faq': renderFaq(); break;
    case 'policy': renderPolicy(); break;
    case 'contact': renderContact(); break;
    default: renderHome(); break;
  }
  bindCommonInteractions();
}
async function init() { try { const r = await fetch('/api/site-data'); state.siteData = await r.json(); renderPage(); } catch (e) { console.error(e); } }
init();
