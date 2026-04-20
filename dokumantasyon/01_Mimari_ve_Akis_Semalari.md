# Öğretmen Randevu Sistemi - Mimari ve Akış Şemaları

Bu belge, okullardaki güvenlik önlemlerini artırmak ve veli-öğretmen iletişimini kayıt altına almak amacıyla tasarlanan sistemin temel veri ve kullanıcı akışlarını içermektedir.

## 1. Kurum Hiyerarşisi (Varlık - İlişki Şeması)

Aşağıdaki şema (ERD), sistemin Türkiye genelini kapsayacak şekilde (MEB -> Bölge -> İl -> İlçe -> Okul) nasıl genişletildiğini göstermektedir. Bu hiyerarşi, e-Devlet veya MEBBİS gibi büyük çaplı bir zinciri temsil eder.

```mermaid
erDiagram
    %% Kurumsal Hiyerarşi Ülke Çapı
    MEB ||--o{ BOLGE : "Denetler (7 Bölge)"
    BOLGE ||--o{ IL_MUDURLUGU : "Kapsar"
    IL_MUDURLUGU ||--o{ ILCE_MUDURLUGU : "Bölünür"
    ILCE_MUDURLUGU ||--o{ OKUL : "Barındırır"
    
    %% Okul İçi Yapı
    OKUL ||--o{ OKUL_MUDURU : "Yönetilir"
    OKUL ||--o{ OGRETMEN : "Eğitim Verir"
    OKUL ||--o{ OGRENCI : "Kayıtlıdır"

    %% Veli - Öğrenci - Öğretmen Ağı
    VELI |o--|{ OGRENCI : "Ebeveynidir"
    OGRENCI }o--o{ OGRETMEN : "Dersine Girer"
    OGRETMEN ||--o{ DERS_PROGRAMI : "Çalışma (Teneffüs) Saatleri"
    
    %% Randevu Mekanizması
    VELI ||--o{ RANDEVU : "Talep Eder"
    OGRETMEN ||--o{ RANDEVU : "Onaylar/Reddeder"
    
    %% Raporlama ve Güvenlik Gözetimi Zinciri
    RANDEVU }o--o| OKUL_MUDURU : "Gözlemler (Okul Geneli)"
    OKUL_MUDURU }o--o| ILCE_MUDURLUGU : "Durum Raporlar"
    ILCE_MUDURLUGU }o--o| IL_MUDURLUGU : "İl Geneli Rapor"
    IL_MUDURLUGU }o--o| BOLGE : "Bölgesel Rapor"
    BOLGE }o--o| MEB : "Ulusal Güvenlik/Randevu İstatistiği"
```

## 2. Temel Randevu Akış Şeması

Bir velinin öğretmenden randevu istediği senaryoda gerçekleşecek olan adım zinciri:

```mermaid
sequenceDiagram
    autonumber
    actor V as Veli (Örn. Arzu Kaya)
    participant S as Sistem (Web)
    actor O as Öğretmen
    actor M as Okul Müdürü

    V->>S: Çocuğunun öğretmenini seçer ve takvimini açar
    S-->>V: Yalnızca Teneffüs ve Çıkış sonrası uygun saatleri gösterir
    V->>S: 10 dk'lık bir randevu talebi oluşturur
    S->>O: Bildirim: "Ahmet Kaya'nın annesi şu saatte görüşmek istiyor"
    
    alt Durum 1: Öğretmen Onaylar
        O->>S: Randevuyu Kabul Et
        S->>V: Sistem İçi Bildirim ve E-posta (Randevunuz Onaylandı)
        S->>M: Onaylı Randevu İstatistiğini Güncelle (Zincir Raporlama Başlar)
    else Durum 2: Öğretmen Reddeder
        O->>S: Randevuyu Reddet (Opsiyonel Ret Sebebi)
        S->>V: Sistem İçi Bildirim ve E-posta (Randevu Reddedildi)
    else Durum 3: Öğretmen Farklı Saat Önerir
        O->>S: Seçilen saat uygun değil, X saatini öner
        S->>V: Yeni Saat Teklifi İletilir
        V->>S: Teklifi Kabul Eder veya İptal Eder
    end
```

## 3. Ulusal Kullanıcı Rolleri ve Yetki Matrisi

Yenilenmiş sistemdeki devasa ve hiyerarşik kullanıcıların yetki sınırları:

| Rol | Yetkiler | Kısıtlamalar |
| :--- | :--- | :--- |
| **Milli Eğitim Bakanlığı (Süper Karar Alıcı)** | Türkiye haritası üzerindeki o anki tüm okul güvenliği / yoğunluğu verisini makro analizlerle görür. "Bugün Türkiye genelinde kaç veli okula girdi?" | Bireysel (Ahmet, Ayşe vs.) işlemlerle ilgilenmez. "Büyük Veri" (Big Data) izler. |
| **Bölge / İl / İlçe Milli Eğitim Md.** | Kendi yetki alanındaki alt müdürlükleri/okulları sisteme kaydeder/denetler. Grafikler üzerinden ilinde işlerin iyi gidip gitmediğini görür. | Başka bölge, il veya ilçelerin panellerine erişemez. |
| **Okul Yönetimi (Müdür / Yrd)** | Sistemde kendi okulundaki öğretmenleri onaylar. Okul içine o gün fiziki olarak girecek velilerin listesini inceler. (Güvenlik birimi ile de paylaşabilir). | Kendi okulu dışındaki kurumlara hiçbir şekilde müdahale edemez. |
| **Öğretmen** | Müsaitlik takvimini ve anlık talep kotasını (Örn. Aynı saat için en fazla 3 istek gelsin) belirler. Gelen talepleri tek tuşla kabul/ret/erteleme yapar. | Sınırları tamamen yetki alanı olan öğrencileri ile kısıtlıdır. Yönetim paneli özellikleri yoktur. |
| **Veli** | Çocuğunun bağlı bulunduğu öğretmen havuzuna erişir, randevu talep sistemini kullanır, randevusu olmadan "Okula giriş onayı" alamaz. | Randevu onaylanmadan okul yönetimi listelerine düşemez. Başka öğrencileri ve velileri göremez. |
| **Öğrenci** | Sistemde arka planda kayıtlı olan "Referans Veri"dir. Öğretmen ile veliyi birbirine bağlayan köprüdür. | Yazılımda herhangi bir kullanıcı arayüzü veya şifresi yoktur. |
