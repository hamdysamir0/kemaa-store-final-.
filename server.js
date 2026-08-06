require('dotenv').config();

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

// بيانات الإيميل (fallback لو .env مش موجود)
const EMAIL_USER = process.env.EMAIL_USER || "youremail@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "your_app_password";
const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER || EMAIL_USER;

// إعداد الإيميل
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// اختبار الاتصال بالإيميل أول ما السيرفر يشتغل
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ Email Config Error:", error);
  } else {
    console.log("✅ Email Server Ready");
  }
});

// قراءة البيانات
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

// API بيانات الموقع
app.get('/api/site-data', (_req, res) => {
  const storeData = readJson(STORE_FILE);
  res.json(storeData);
});

// أوردر جديد
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

  // إرسال الإيميل
  try {
    await transporter.sendMail({
      from: `"Kemaa Store" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVER,
      subject: `🛒 أوردر جديد: ${customerName}`,
      text: `
منتج: ${productName}
اسم: ${customerName}
تليفون: ${phone}
موديل: ${phoneModel}
ملاحظات: ${notes}
      `
    });

    console.log("✅ Email Sent Successfully");
  } catch (err) {
    console.error("❌ Email Error:", err);
  }

  // واتساب
  res.json({
    ok: true,
    message: 'تم تسجيل طلبك.',
    whatsappUrl: buildWhatsAppOrderLink(storeData, order)
  });
});

// تواصل
app.post('/api/contact', async (req, res) => {
  const { name, phone, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Kemaa Store" <${EMAIL_USER}>`,
      to: EMAIL_RECEIVER,
      subject: `✉️ رسالة من: ${name}`,
      text: `
الموضوع: ${subject}
من: ${name}
تليفون: ${phone}

الرسالة:
${message}
      `
    });

    console.log("✅ Contact Email Sent");
  } catch (err) {
    console.error("❌ Contact Email Error:", err);
  }

  res.json({ ok: true, message: 'وصلتنا رسالتك.' });
});

// الصفحة الرئيسية
app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});