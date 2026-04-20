# Öğretmen Randevu Sistemi - Uygulama ve Veritabanı Planı

Bu plan, velilerin randevu müzakeresi, mesajlaşma ve öğretmenin "Davranış Logu" (Öğrenci Durum Bildirimi) girmesi gibi özellikleri kapsayan sistemin kullanıcı arayüzü ve veritabanı kurgusunu içerir.

## 1. Kullanıcı Arayüzü (UI/UX) Kurgusu

Sisteme telefon veya bilgisayardan giriş yapıldığında sol tarafta veya altta belirecek ana menüler.

### A. Veli Paneli (Frontend)
1. **Ana Ekran (Dashboard):** Yaklaşan randevuya kalan zaman, okunmamış mesajlar ve en önemlisi "Son Davranış Logları" (Öğretmenin çocuk hakkında girdiği son bildirimler) kartlar halinde görünür.
2. **Randevu İşlemleri:** 
   - İki sekme (Geçmiş Randevular / Gelecek Randevular).
   - "Yeni Talep" butonuna basıldığında: Öğretmen Seç -> Saat/Teneffüs Seç -> **Konu Başlığı** gir -> **Kısa Açıklama** gir -> Gönder.
3. **Mesajlar ve Ödevler (7/24 Aktif Sistem):** Öğretmenlerle sürekli açık iletişim kanalı. Veliler zaman kazanmak ve öğretmeni yoğun laf kalabalığına boğmamak için **"Hazır Mesaj Şablonları"** kullanabilirler (Örn: *"Hocam [X] günü [X] teneffüsünde müsait misiniz?"*, *"Hocam ekteki ödeve bakar mısınız?"*). Altta dosya/fotoğraf ekleme özelliği mevcuttur.
4. **Öğrenci Durum Takibi (Timeline):** Öğretmenlerin çocukla ilgili girdiği notların geçmişi. Kötü veya durumu değerlendirilmesi gereken bir log girilmişse logonun altında hemen **"Bu konu hakkında randevu al"** butonu çıkar.

### B. Öğretmen Paneli (Frontend)
1. **Ana Ekran (Dashboard):** Onaylanmış randevulardan bugünün listesi. Ayrıca bekleyen talepler için "Onayla / Reddet (Neden belirterek) / Yeni Saat Öner" kartları.
2. **Durum Bildirimi Ekle (Loglama):** Sınıfındaki öğrencilerin listesi. Bir öğrenciyi seçip hızlıca log atabilir (Kategori: Olumlu, Olumsuz, Nötr). Bu anında veliye bildirim olarak düşer.
3. **Mesajlar (Şablonlu Platform):** Siteye giriş yapıldıkça velilerden gelen hazır şablonlu mesajları veya PDF ödevlerini kontrol etme, cevaplama.
4. **Müsaitlik Ayarları:** Kendisine randevu talep edilebilecek teneffüs saatlerini seçme ve "Aynı anda max X veli" kilitlerini ayarlama.

---

## 2. PostgreSQL Veritabanı Tasarımı (Backend)

Sistemin sarsılmaz biçimde çalışmasını sağlayacak ana tablolar ve taşıyacağı kolonlar şu şekilde olacaktır:

### Temel Hiyerarşi Tabloları
*   `countries`, `regions`, `provinces`, `districts`, `schools` (Türkiye haritası ve okullar zinciri)

### Kullanıcı ve İlişki Tabloları
*   `users` (id, rol[SuperAdmin, Mudur, Ogretmen, Veli], isim, email, sifre_hash)
*   `teachers` (id, user_id, school_id, max_randevu_kotasi)
*   `students` (id, school_id, ad_soyad, ogrenci_no)
*   `student_parents` (Many-to-Many köprü tablosu: Hangi öğrenci hangi veliye bağlı?)
*   `student_teachers` (Köprü tablosu: Bu öğrencinin derslerine hangi öğretmenler giriyor?)

### Operasyonel Tablolar (Ana Sistem)
*   `appointments` **(Randevular Tablosu):**
    *   `id`, `parent_id`, `teacher_id`
    *   `requested_time` (İstenen Tarih/Saat)
    *   `subject` (Konu Başlığı)
    *   `description` (Veli Açıklaması)
    *   `status` (Bekliyor, Onaylandı, Reddedildi, Saat Önerildi)
    *   `teacher_note` (Öğretmenin reddetme veya saat önerme sebebi)
*   `student_behavior_logs` **(Öğrenci Davranış Bildirimleri):**
    *   `id`, `teacher_id`, `student_id`, `log_type` (Positive, Negative, Info)
    *   `title` (Örn: "Ders İçi Uyumsuzluk")
    *   `description` (Detaylı metin)
    *   `created_at` (Tarih)
*   `messages` **(Mesajlaşma):**
    *   `id`, `sender_id`, `receiver_id`
    *   `content` (Mesaj içeriği)
    *   `is_template` (Boolean - Hazır şablon mesajı mı yoksa özel yazı mı?)
    *   `attachment_url` (Dosya/Ödev)
    *   `created_at` (Tarih)
