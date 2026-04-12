const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // ضفنا المكتبة هنا

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const REQUESTS_DIR = path.join(DATA_DIR, 'requests');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const ORDERS_FILE = path.join(REQUESTS_DIR, 'orders.json');
const CONTACTS_FILE = path.join(REQUESTS_DIR, 'contacts.json');
const ADMIN_KEY = process.env.ADMIN_KEY || '';

// إعداد "الناقل" لإرسال الإيميلات
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, //  اللي هتضيفه في فيرسيل
    pass: process.env.EMAIL_PASS  // الباسورد (16 حرف) اللي هتجيبه من جوجل
  }
});

function ensureFile(filePath, initialValue = []) {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2), 'utf8');
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function sanitizeText(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, 1000);
}

function validateRequiredFields(fields) {
  return fields.every((field) => sanitizeText(field).length > 0);
}

function buildWhatsAppOrderLink(siteData, payload) {
  const lines = [
    'السلام عليكم، أريد تأكيد طلب من موقع Kemaa Store.',
    `المنتج: ${payload.productName}`,
    `الاسم: ${payload.customerName}`,
    `رقم الهاتف: ${payload.phone}`,
    `نوع الموبايل: ${payload.phoneModel || 'غير محدد'}`,
    `ملاحظات: ${payload.notes || 'لا يوجد'}`
  ];

  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${siteData.site.whatsapp}?text=${encoded}`;
}

function requireAdmin(req, res, next) {
  if (!ADMIN_KEY) {
    return res.status(403).json({
      ok: false,
      message: 'Admin key is not configured on this server.'
    });
  }

  const key = sanitizeText(req.query.key || req.headers['x-admin-key']);
  if (key !== ADMIN_KEY) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized admin access.'
    });
  }

  next();
}

ensureFile(ORDERS_FILE, []);
ensureFile(CONTACTS_FILE, []);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Kemaa Store API' });
});

app.get('/api/site-data', (_req, res) => {
  const storeData = readJson(STORE_FILE);
  res.json(storeData);
});

// تعديل الـ Route بتاع الأوردرات
app.post('/api/orders', async (req, res) => {
  const storeData = readJson(STORE_FILE);
  const customerName = sanitizeText(req.body.customerName);
  const phone = sanitizeText(req.body.phone);
  const phoneModel = sanitizeText(req.body.phoneModel);
  const notes = sanitizeText(req.body.notes);
  const productId = sanitizeText(req.body.productId);
  const productName = sanitizeText(req.body.productName);

  if (!validateRequiredFields([customerName, phone, productName])) {
    return res.status(400).json({
      ok: false,
      message: 'من فضلك اكتب الاسم ورقم الهاتف والمنتج المطلوب.'
    });
  }

  const order = {
    id: `order_${Date.now()}`,
    createdAt: new Date().toISOString(),
    customerName,
    phone,
    phoneModel,
    notes,
    productId,
    productName,
    source: 'website'
  };

  const orders = readJson(ORDERS_FILE);
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);

  // إرسال الإيميل تنبيه بالأوردر
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🛒 أوردر جديد من ${customerName}`,
      text: `منتج: ${productName}\nاسم العميل: ${customerName}\nتليفون: ${phone}\nالموديل: ${phoneModel}\nملاحظات: ${notes}`
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  res.json({
    ok: true,
    message: 'تم تسجيل طلبك بنجاح.',
    whatsappUrl: buildWhatsAppOrderLink(storeData, order)
  });
});

// تعديل الـ Route بتاع رسائل التواصل
app.post('/api/contact', async (req, res) => {
  const name = sanitizeText(req.body.name);
  const phone = sanitizeText(req.body.phone);
  const subject = sanitizeText(req.body.subject);
  const message = sanitizeText(req.body.message);

  if (!validateRequiredFields([name, phone, message])) {
    return res.status(400).json({
      ok: false,
      message: 'من فضلك اكتب الاسم ورقم الهاتف والرسالة.'
    });
  }

  const contact = {
    id: `contact_${Date.now()}`,
    createdAt: new Date().toISOString(),
    name,
    phone,
    subject,
    message,
    source: 'website'
  };

  const contacts = readJson(CONTACTS_FILE);
  contacts.unshift(contact);
  writeJson(CONTACTS_FILE, contacts);

  // إرسال الإيميل تنبيه بالرسالة
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `✉️ رسالة جديدة: ${subject}`,
      text: `من: ${name}\nتليفون: ${phone}\nالرسالة:\n${message}`
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  res.json({
    ok: true,
    message: 'وصلتنا رسالتك، وسيتم التواصل معك في أقرب وقت.'
  });
});

app.get('/admin/orders', requireAdmin, (_req, res) => {
  res.json(readJson(ORDERS_FILE));
});

app.get('/admin/contacts', requireAdmin, (_req, res) => {
  res.json(readJson(CONTACTS_FILE));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kemaa Store running on http://localhost:${PORT}`);
});