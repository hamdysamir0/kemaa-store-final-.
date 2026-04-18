async function bindOrderForm() {
  const form = $('#orderForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => { // أضفنا async هنا
    event.preventDefault();
    const status = $('#orderStatus');
    const submitBtn = form.querySelector('button[type="submit"]');

    // تجميع البيانات بأسماء مطابقة تماماً لما يتوقعه السيرفر (server.js)
    const payload = {
        customerName: $('#cust_name').value.trim(),
        phone: $('#cust_phone').value.trim(),
        phoneModel: $('#cust_model').value.trim() || 'غير محدد',
        notes: $('#cust_notes').value.trim() || 'لا توجد',
        productName: $('#modalProductName').innerText
    };

    if (!payload.customerName || !payload.phone) {
        status.textContent = "برجاء كتابة الاسم ورقم الهاتف";
        status.className = 'form-status error';
        return;
    }

    // تعطيل الزر لمنع الضغط المتكرر
    submitBtn.disabled = true;
    submitBtn.innerText = 'جاري معالجة الطلب...';

    try {
        // 1. الخطوة الأهم: إرسال الطلب للسيرفر أولاً والانتظار (عشان الإيميل يوصل)
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.ok) {
            // 2. إذا نجح السيرفر في تسجيل الطلب (وإرسال الإيميل)
            status.textContent = 'تم إرسال الطلب! جاري تحويلك للواتساب...';
            status.className = 'form-status success';

            // 3. فتح الواتساب باستخدام الرابط الجاهز الذي أصلحناه في السيرفر للماك
            const waUrl = data.whatsappUrl; 
            
            const hiddenLink = document.createElement('a');
            hiddenLink.href = waUrl;
            // لا نضع target='_blank' هنا أحياناً في الماك لضمان سلاسة الانتقال للتطبيق
            document.body.appendChild(hiddenLink);
            hiddenLink.click();
            document.body.removeChild(hiddenLink);

            // إغلاق المودال بعد ثواني
            setTimeout(() => { closeOrderModal(); }, 3000);
        } else {
            throw new Error(data.message || "فشل تسجيل الطلب");
        }

    } catch (e) {
        console.error("Order Error:", e);
        submitBtn.disabled = false;
        submitBtn.innerText = 'تأكيد الطلب';
        status.textContent = "عذراً، حدث خطأ. حاول مرة أخرى.";
        status.className = 'form-status error';
    }
  });
}