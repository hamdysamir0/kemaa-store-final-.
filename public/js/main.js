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
            <a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">واتساب مباشر</a>
            <a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram</a>
            <a href="contact.html">نموذج التواصل</a>
          </div>
        </div>
      </div>
    </footer>
    <div class="floating-actions">
      <a class="floating-action instagram" href="${site.instagram}" target="_blank" rel="noreferrer" aria-label="Instagram">📸</a>
      <a class="floating-action whatsapp" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
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

function statCards(items) {
  return items
    .map((item) => `
      <div class="stat-card">
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
      </div>
    `)
    .join('');
}

function serviceCards(items) {
  return items
    .map((service) => `
      <article class="service-card">
        <div class="badge">${escapeHtml(service.icon)} خدمة</div>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.text)}</p>
      </article>
    `)
    .join('');
}

function productCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${escapeHtml(product.name)}">
      <div class="product-body">
        <div class="product-topline">
          <span class="badge">${escapeHtml(product.badge)}</span>
          <small>${escapeHtml(product.category)}</small>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="product-bottom">
          <span class="price-label">${escapeHtml(product.priceLabel)}</span>
          <button class="btn order-trigger" data-product-id="${escapeHtml(product.id)}">اطلب الآن</button>
        </div>
      </div>
    </article>
  `;
}

function reviewCards(items) {
  return items
    .map((review) => `
      <article class="review-card">
        <div class="review-stars">${stars(review.rating)}</div>
        <h3>${escapeHtml(review.name)}</h3>
        <p>${escapeHtml(review.text)}</p>
      </article>
    `)
    .join('');
}

function offerCards(items) {
  return items
    .map((offer) => `
      <article class="offer-card">
        <span class="badge">${escapeHtml(offer.badge)}</span>
        <h3>${escapeHtml(offer.title)}</h3>
        <p>${escapeHtml(offer.description)}</p>
        <div class="offer-price">${escapeHtml(offer.price)}</div>
      </article>
    `)
    .join('');
}

function galleryCards(items) {
  return items
    .map((item) => `
      <article class="gallery-card">
        <img src="${item.image}" alt="${escapeHtml(item.title)}">
        <div class="gallery-body">
          <div class="gallery-meta">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="badge">${escapeHtml(item.category)}</span>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function faqItems(items) {
  return items
    .map((faq, index) => `
      <article class="faq-item ${index === 0 ? 'open' : ''}">
        <button class="faq-question" type="button">
          <span>${escapeHtml(faq.question)}</span>
          <span>＋</span>
        </button>
        <div class="faq-answer">${escapeHtml(faq.answer)}</div>
      </article>
    `)
    .join('');
}

function policyCards(items) {
  return items
    .map((section) => `
      <article class="policy-card">
        <h3>${escapeHtml(section.title)}</h3>
        <ul>
          ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
    `)
    .join('');
}

function renderHome() {
  const { site, stats, products, services, offers } = state.siteData;
  const featured = products.filter((product) => product.featured).slice(0, 4);
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
          <div class="hero-floating">
            <strong>طلب سريع</strong>
            <div class="muted">سجل الطلب من الموقع ثم أكمله مباشرة عبر واتساب</div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">منتجات مميزة</span>
            <h2>أحدث الموديلات المعروضة</h2>
          </div>
          <p class="lead">مجموعة متنوعة من الجرابات بأشكال وألوان مختلفة تناسب أذواق متعددة.</p>
        </div>
        <div class="products-grid">${featured.map(productCard).join('')}</div>
      </div>
    </section>

    <section class="page-section">
      <div class="container grid-2">
        <div class="highlight-box">
          <h3>ليه العميل يطلب من Kemaa Store؟</h3>
          <ul>
            <li>صور حقيقية للمنتجات بدل صور افتراضية.</li>
            <li>خدمة طلب سهلة من الموقع إلى واتساب.</li>
            <li>اختيارات متنوعة وموديلات تناسب أذواق مختلفة.</li>
            <li>${escapeHtml(site.delivery)}</li>
          </ul>
        </div>
        <div class="info-card">
          <div class="section-heading" style="margin-bottom: 14px;">
            <div>
              <span class="badge">خدماتنا</span>
              <h2>إيه اللي بنقدمه؟</h2>
            </div>
          </div>
          <div class="services-grid">${serviceCards(services.slice(0, 4))}</div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">عروض المتجر</span>
            <h2>عروض جاهزة تساعد على البيع</h2>
          </div>
          <a class="btn-ghost" href="offers.html">كل العروض</a>
        </div>
        <div class="offers-grid">${offerCards(offers.slice(0, 4))}</div>
      </div>
    </section>
  `);
}

function renderProducts() {
  const { products } = state.siteData;
  const categories = ['الكل'];
  const filtered = products;

  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">كل المنتجات</span>
            <h1 class="page-title">جرابات متنوعة بصور واضحة</h1>
          </div>
          <p class="lead">اختر التصميم المناسب ثم اضغط على "اطلب الآن" لإرسال بياناتك وتأكيد الطلب بنجاح.</p>
        </div>
        <div class="filter-bar">
          ${categories.map((category) => `<button class="filter-btn ${state.filteredCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}
        </div>
        <div class="products-grid" id="productsGrid">
          ${filtered.length ? filtered.map(productCard).join('') : '<div class="empty-state">لا توجد منتجات في هذا التصنيف حالياً.</div>'}
        </div>
      </div>
    </section>
  `);

  $all('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.filteredCategory = button.dataset.category;
      renderProducts();
      bindCommonInteractions();
    });
  });
}

function renderAbout() {
  const { site, stats } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container grid-2">
        <div class="info-card">
          <span class="badge">عن المتجر</span>
          <h1 class="page-title">${escapeHtml(site.brand)}</h1>
          <p class="lead">${escapeHtml(site.description)}</p>
          <p>${escapeHtml(site.heroText)}</p>
          <div class="inline-actions">
            <a class="btn" href="products.html">تصفح المنتجات</a>
            <a class="btn-outline" href="contact.html">تواصل معنا</a>
          </div>
        </div>
        <div class="hero-card hero-media">
          <img src="/assets/images/logo.jpeg" alt="شعار Kemaa Store">
        </div>
      </div>
      <div class="container" style="margin-top: 24px;">
        <div class="stats-grid">${statCards(stats)}</div>
      </div>
    </section>
  `);
}

function renderServices() {
  const { services, site } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">الخدمات</span>
            <h1 class="page-title">كل خدمات Kemaa Store في مكان واحد</h1>
          </div>
          <p class="lead">جرابات متنوعة مع وسيلة طلب سهلة ودعم مستمر لاختيار الأنسب لك.</p>
        </div>
        <div class="services-grid">${serviceCards(services)}</div>
        <div class="highlight-box" style="margin-top: 24px;">
          <h3>آلية الطلب الحالية</h3>
          <p>${escapeHtml(site.orderHint)}</p>
        </div>
      </div>
    </section>
  `);
}

function renderOffers() {
  const { offers } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">العروض</span>
            <h1 class="page-title">عروض جاهزة للعرض والبيع</h1>
          </div>
          <p class="lead">يمكنك تعديل الأسعار لاحقاً بسهولة من ملف البيانات إذا أحببت.</p>
        </div>
        <div class="offers-grid">${offerCards(offers)}</div>
      </div>
    </section>
  `);
}

function renderReviews() {
  const { reviews } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">آراء العملاء</span>
            <h1 class="page-title">انطباعات تساعد على الثقة</h1>
          </div>
          <p class="lead">الواجهة أصبحت تعرض تقييمات واضحة بشكل احترافي وسهل القراءة.</p>
        </div>
        <div class="reviews-grid">${reviewCards(reviews)}</div>
      </div>
    </section>
  `);
}

function renderFaq() {
  const { faqs } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">الأسئلة الشائعة</span>
            <h1 class="page-title">إجابات سريعة للعملاء</h1>
          </div>
          <p class="lead">إجابات سريعة على أهم الأسئلة الخاصة بالطلب والشحن والتفاصيل المهمة.</p>
        </div>
        <div class="faq-list">${faqItems(faqs)}</div>
      </div>
    </section>
  `);

  $all('.faq-item').forEach((item) => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
}

function renderGallery() {
  const { gallery } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">المعرض</span>
            <h1 class="page-title">معرض المنتجات</h1>
          </div>
          <p class="lead">معرض مرتب يضم صور المنتجات المتاحة بشكل واضح وسهل التصفح.</p>
        </div>
        <div class="gallery-grid">${galleryCards(gallery)}</div>
      </div>
    </section>
  `);
}

function renderPolicy() {
  const { policies } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="badge">الاستبدال والاسترجاع</span>
            <h1 class="page-title">سياسة واضحة ومختصرة</h1>
          </div>
          <p class="lead">قسم مرتب يعرض الشروط والنقاط المهمة بشكل واضح للعميل قبل الشراء.</p>
        </div>
        <div class="policy-grid">${policyCards(policies)}</div>
      </div>
    </section>
  `);
}

function renderContact() {
  const { site } = state.siteData;
  pageShell(`
    <section class="page-section">
      <div class="container contact-grid">
        <article class="contact-card">
          <span class="badge">تواصل معنا</span>
          <h1 class="page-title">راسل المتجر من الموقع مباشرة</h1>
          <p>📍 ${escapeHtml(site.location)}</p>
          <p>📞 <a href="tel:${escapeHtml(site.phone)}">${escapeHtml(site.phone)}</a></p>
          <p>📧 <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></p>
          <p>💬 <a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">WhatsApp مباشر</a></p>
          <p class="form-note">${escapeHtml(site.delivery)}</p>
        </article>
        <article class="contact-card">
          <span class="badge">نموذج التواصل</span>
          <form id="contactForm" novalidate>
            <div class="form-row">
              <input class="input" type="text" name="name" placeholder="الاسم" required>
              <input class="input" type="text" name="phone" placeholder="رقم الهاتف" required>
            </div>
            <input class="input" type="text" name="subject" placeholder="الموضوع (اختياري)">
            <textarea class="textarea" name="message" placeholder="اكتب رسالتك هنا" required></textarea>
            <button class="btn" type="submit">إرسال الرسالة</button>
            <div class="form-status" id="contactStatus"></div>
          </form>
        </article>
      </div>
    </section>
  `);

  bindContactForm();
}

function openOrderModal(productId) {
  const product = state.siteData.products.find((item) => item.id === productId);
  if (!product) return;
  state.selectedProduct = product;

  modalRoot.innerHTML = `
    <div class="modal open" id="orderModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <span class="badge">طلب منتج</span>
            <h3 id="modalProductName">${escapeHtml(product.name)}</h3>
          </div>
          <button class="modal-close" id="closeModal" type="button">✕</button>
        </div>
        <p class="form-note">اكتب بياناتك، وسيتم إنشاء رسالة واتساب جاهزة بعد تسجيل الطلب.</p>
        <form class="order-form" id="orderForm" novalidate>
          <div class="form-row">
            <input class="input" type="text" id="cust_name" name="customerName" placeholder="الاسم" required>
            <input class="input" type="text" id="cust_phone" name="phone" placeholder="رقم الهاتف" required>
          </div>
          <input class="input" type="text" id="cust_model" name="phoneModel" placeholder="نوع الموبايل / الموديل">
          <textarea class="textarea" id="cust_notes" name="notes" placeholder="أي ملاحظات إضافية؟"></textarea>
          <button class="btn" type="submit">تأكيد الطلب</button>
          <div class="form-status" id="orderStatus"></div>
        </form>
      </div>
    </div>
  `;

  $('#closeModal')?.addEventListener('click', closeOrderModal);
  $('#orderModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'orderModal') closeOrderModal();
  });
  bindOrderForm();
}

function closeOrderModal() {
  modalRoot.innerHTML = '';
}

function bindOrderButtons() {
  $all('.order-trigger').forEach((button) => {
    button.addEventListener('click', () => openOrderModal(button.dataset.productId));
  });
}

async function bindOrderForm() {
  const form = $('#orderForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = $('#orderStatus');
    const submitBtn = form.querySelector('button[type="submit"]');

    const formData = {
        name: $('#cust_name').value,
        phone: $('#cust_phone').value,
        model: $('#cust_model').value,
        notes: $('#cust_notes').value,
        productName: $('#modalProductName').innerText
    };

    if (!formData.name || !formData.phone) {
        status.textContent = "برجاء كتابة الاسم ورقم الهاتف";
        status.className = 'form-status error';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'جاري تحويلك للواتساب...';

    const whatsappMsg = `طلب جديد من: ${formData.name}%0Aالمنتج: ${formData.productName}%0Aالموديل: ${formData.model}%0Aرقم التليفون: ${formData.phone}%0Aملاحظات: ${formData.notes}`;
    window.open(`https://wa.me/201118245607?text=${whatsappMsg}`, '_blank');

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerName: formData.name,
            phone: formData.phone,
            phoneModel: formData.model,
            notes: formData.notes,
            productName: formData.productName
        })
      });
    } catch (e) { console.log("Email failed but WhatsApp is open."); }

    setTimeout(() => {
        closeOrderModal();
    }, 2000);
  });
}

function bindContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = $('#contactStatus');
    const formData = Object.fromEntries(new FormData(form).entries());
    status.textContent = 'جاري إرسال الرسالة...';
    status.className = 'form-status';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'تعذر إرسال الرسالة.');
      }

      status.textContent = data.message;
      status.className = 'form-status success';
      form.reset();
    } catch (error) {
      status.textContent = error.message;
      status.className = 'form-status error';
    }
  });
}

function bindNavToggle() {
  const toggle = $('#navToggle');
  const navLinks = $('#navLinks');
  if (!toggle || !navLinks) return;
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

function bindCommonInteractions() {
  bindOrderButtons();
}

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

async function init() {
  try {
    const response = await fetch('/api/site-data');
    state.siteData = await response.json();
    renderPage();
  } catch (error) {
    contentRoot.innerHTML = '<div class="container page-section"><div class="hero-card">تعذر تحميل بيانات الموقع حالياً.</div></div>';
    console.error(error);
  }
}

init();