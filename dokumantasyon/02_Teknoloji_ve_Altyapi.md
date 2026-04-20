# Öğretmen Randevu Sistemi - Teknoloji Yığını (Tech Stack)

Ulusal güvenlik seviyesinde, milyonlarca öğrenci ve velinin dahil olduğu bir eğitim yönetim sistemi (MEBBİS / e-Devlet Modeli) tasarladığımız için teknolojiler en yüksek güvenlik, ölçeklenebilirlik, ve hiyerarşik veri yönetimi (RBAC) esaslarına göre seçilmiştir.

## 1. Veritabanı Mimarisi: PostgreSQL (İlişkisel Dev Yapı)
Sistemin birbirine ne kadar bağlı olduğunu (MEB -> 7 Bölge -> İl -> İlçe -> Okul -> Yönetim -> Öğretmen -> Öğrenci -> Veli) düşünürsek, hata payı sıfır olan dev bir **İlişkisel Veritabanına (RDBMS)** ihtiyacımız var. 
- **Neden PostgreSQL?** Kompleks sorgularda (Eskiden kim kimi ne zaman onaylamış?) endüstrinin en güvenilir, yüksek performanslı ve açık kaynak sistemidir. "Marmara Bölgesindeki okullar bu hafta kaç veli ağırladı?" gibi makro "Big Data" analizleri veri kaybı olmadan çok rahat çözülür.

## 2. Arka Uç (Backend) Mantığı: Python (Django)
Bu sistemdeki en stresli ve teknik iş devasa "Rol / Yetki / İzin (Permissions) Hiyerarşisi"dir. Bir Şişli İlçe Milli Eğitim Müdürü sadece Şişli'yi görmeli, Beşiktaş'a erişememelidir. 
- **Neden Django Kapsamı?** Django Framework, "Groups and Permissions" (Gruplar ve Yetkilendirme) mimarisiyle ve dahili gelen Süper Admin Yönetim Paneli ile devlete/kapsamlı sistemlere en uygun yapıdır. Node.js'te bu yetki sınırlandırma güvenliklerini haftalarca sıfırdan yazarken, Django bunu bize ücretsiz ve kırılamaz şekilde sağlar.

## 3. Ön Yüz (Frontend) Tasarımı: React / Next.js + Tailwind CSS
Veli ve öğretmen telefonuyla veya bilgisayarıyla siteye her girdiğinde saniyeler içinde tepki veren, çökmeyen modern bir arayüzle karşılaşmalıdır.
- **Neden Next.js?** Sayfa yenilenmesine bekleme süresine son veren "Tek Sayfa Uygulaması (SPA)" mantığı sunar. Akıcı bir arayüz için mükemmeldir.
- **Neden Tailwind CSS?** Velilere çok karmaşık gelmeyecek "Devlet/Kurumsal Ciddiyetinde ancak modern, temiz ve anlaşılır" bir arayüz yapmak için elementleri nokta atışı boyutlandırabilmemizi sağlar. Tasarımı göze çok hoş, temiz gösterebiliriz.
