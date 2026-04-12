const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// إعداد "الناقل" لإرسال الإيميلات
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// وظيفة قراءة البيانات (مسموحة لأنها قراءة فقط)
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function sanitizeText(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, 1000);
}

function validateRequiredFields(fields) {
  return fields.every((field) => sanitizeText(field).length > 0);
}

function buildWhatsAppOrderLink(siteData, payload) {
  const whatsappNumber = siteData.site ? siteData.site.whatsapp : "201033105944";
  const lines = [
    'السلام عليكم، أريد تأكيد طلب من موقع Kemaa Store.',
    `المنتج: ${payload.productName}`,
    `الاسم: ${payload.customerName}`,
    `رقم الهاتف: ${payload.phone}`,
    `نوع الموبايل: ${payload.phoneModel || 'غير محدد'}`,
    `ملاحظات: ${payload.notes || 'لا يوجد'}`
  ];
  const encoded = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

app.get('/api/site-data', (_req, res) => {
  const storeData = readJson(STORE_FILE);
  res.json(storeData);
});

// تعديل الـ Route بتاع الأوردرات (إيميل وواتساب فقط)
app.post('/api/orders', async (req, res) => {
  const storeData = readJson(STORE_FILE);
  const customerName = sanitizeText(req.body.customerName);
  const phone = sanitizeText(req.body.phone);
  const phoneModel = sanitizeText(req.body.phoneModel);
  const notes = sanitizeText(req.body.notes);
  const productName = sanitizeText(req.body.productName);

  if (!validateRequiredFields([customerName, phone, productName])) {
    return res.status(400).json({ ok: false, message: 'بيانات ناقصة' });
  }

  const order = { customerName, phone, phoneModel, notes, productName };

  // 1. إرسال الإيميل (مهم جداً)
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `🛒 أوردر جديد: ${customerName}`,
      text: `منتج: ${productName}\nاسم: ${customerName}\nتليفون: ${phone}\nموديل: ${phoneModel}\nملاحظات: ${notes}`
    });
  } catch (err) {
    console.error("Email Error:", err);
  }

  // 2. الرد ببيانات الواتساب
  res.json({
    ok: true,
    message: 'تم تسجيل طلبك.',
    whatsappUrl: buildWhatsAppOrderLink(storeData, order)
  });
});

// تعديل الـ Route بتاع التواصل
app.post('/api/contact', async (req, res) => {
  const { name, phone, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `✉️ رسالة من: ${name}`,
      text: `الموضوع: ${subject}\nمن: ${name}\nتليفون: ${phone}\nالرسالة:\n${message}`
    });
  } catch (err) {
    console.error("Contact Email Error:", err);
  }

  res.json({ ok: true, message: 'وصلتنا رسالتك.' });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT);