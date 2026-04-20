"use client";
import React, { useEffect, useState } from 'react';

export default function VeliPaneli() {
  const [activeTab, setActiveTab] = useState('Ana Ekran');
  const [logs, setLogs] = useState<any[]>([]);

  // Yeni Durumlar (State)
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({ subject: '', date: '', time: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/behavior-logs/');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) { console.error(err); }
  };

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const sendTemplateMessage = async (content: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 3, receiver: 2, content: content, is_template: true }),
      });
      if (response.ok) showToast("Mesajınız öğretmene anında iletildi!", 'success');
    } catch (error) { showToast("Sistem hatası.", 'error'); }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const isWeekend = (dateString: string) => {
    const day = new Date(dateString).getDay();
    return day === 0 || day === 6; // 0: Pazar, 6: Cumartesi
  };

  const executeAppointment = async () => {
    if(!appForm.subject || !appForm.date || !appForm.time) return showToast("Lütfen tüm alanları doldurun", 'error');
    
    // Tarih geçerlilik kontrolü
    if (isWeekend(appForm.date)) {
      return showToast("Hafta sonları randevu alınamaz. Lütfen hafta içi bir gün seçiniz.", 'error');
    }

    const selectedDate = new Date(appForm.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    maxDate.setHours(23,59,59,999);

    if (selectedDate < today || selectedDate > maxDate) {
      return showToast("Randevu sadece bugünden itibaren 1 hafta sonrasına kadar alınabilir.", 'error');
    }

    try {
      const requestDateTime = new Date(`${appForm.date}T${appForm.time}:00`);

      const response = await fetch('http://127.0.0.1:8000/api/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent: 1, teacher: 1, student: 1,
          requested_time: requestDateTime.toISOString(),
          subject: appForm.subject, 
          description: `Veli tarafından randevu formu dolduruldu. Kapsam: ${appForm.subject}`, 
          status: "pending"
        }),
      });

      if (response.ok) {
        showToast("Randevu talebiniz değerlendirilmek üzere iletildi!", 'success');
        setIsModalOpen(false);
        setAppForm({subject: '', date: '', time: ''});
      } else {
        const errData = await response.json();
        // Backend'den gelen özel hata mesajlarını göster (örn: Öğretmen o gün çalışmıyor)
        const errorMsg = errData.non_field_errors ? errData.non_field_errors[0] : (errData.detail || "Randevu oluşturulamadı. Lütfen bilgileri kontrol edin.");
        showToast(errorMsg, 'error');
      }
    } catch (error) {
       showToast("Bağlantı sorunu yaşandı", 'error');
    }
  };

  const menuItems = ['Ana Ekran', 'Randevularım', 'Mesajlar', 'Durum Takibi'];
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800 relative overflow-hidden">
      
      {/* Toast Alert / Bildiri Penceresi */}
      {toast && (
        <div className={`absolute top-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all transform animate-bounce ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path>
            </svg>
          </div>
          <p className="font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      {/* Randevu Talep Modalı (Popup Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-lg transform transition-all">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Randevu Talep Merkezi</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 font-bold p-2 bg-slate-100 rounded-full hover:bg-rose-50">✕</button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1">Öğretmen (İlkokul Sınıf Eğitmeni)</label>
                   <input type="text" disabled value="Elif Yılmaz (4/B)" className="w-full border-slate-200 bg-slate-100 text-slate-500 rounded-xl px-4 py-3 font-medium outline-none cursor-not-allowed"/>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1">Görüşme Konusu (Özet)</label>
                   <input type="text" value={appForm.subject} onChange={e => setAppForm({...appForm, subject: e.target.value})} placeholder="Örn: Hafta sonu ödevleri" className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none transition-all"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-slate-600 mb-1">Tarih</label>
                     <input type="date" min={getMinDate()} max={getMaxDate()} value={appForm.date} onChange={e => setAppForm({...appForm, date: e.target.value})} className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none"/>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-600 mb-1">Saat / Teneffüs</label>
                     <input type="time" value={appForm.time} onChange={e => setAppForm({...appForm, time: e.target.value})} className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none"/>
                   </div>
                </div>
                <div className="pt-4">
                  <button onClick={executeAppointment} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold tracking-wide shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none">
                    Talebi Sisteme Gönder
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Şıklaştırılmış Kenar Çubuğu */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-8 text-2xl font-black text-white tracking-widest border-b border-slate-800 flex items-center gap-2">
          VELİ<span className="text-blue-500">PORTAL</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-3">
          {menuItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium tracking-wide ${
                activeTab === item 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hoş Geldiniz, Arzu Hanım</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">İlkokul Velisi - Öğrenci: Ahmet Kaya (4/B)</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-blue-500">
            AK
          </div>
        </header>

        {activeTab === 'Ana Ekran' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border-l-8 border-rose-500 overflow-hidden transform transition-all hover:shadow-md">
              <div className="p-8">
                <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Öğretmenden Son Gelişme</h2>
                <p className="mt-2 text-2xl font-bold text-slate-800 leading-tight">
                  {latestLog ? latestLog.title : "Sistem bekleniyor..."}
                </p>
                <p className="mt-4 text-slate-600 leading-relaxed text-sm font-medium">
                  "{latestLog ? latestLog.description : "Yükleniyor..."}"
                </p>
                <div className="mt-8 flex gap-4">
                  <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors shadow-sm focus:ring-4 focus:ring-rose-50">
                    Konuyla İlgili Görüş (Randevu Al)
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-3xl shadow-xl p-8 text-white text-center flex flex-col justify-center items-center relative overflow-hidden transform transition-all hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
              <h3 className="text-xl font-bold tracking-wide z-10">Gizli İşlem Yok</h3>
              <p className="text-indigo-200 text-sm mt-3 leading-relaxed z-10">Yakın zamanda planlanmış ve onaylanmış aktif bir öğretmen görüşmeniz bulunmuyor.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-8 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all w-full shadow-lg z-10 focus:ring-4 focus:ring-white">
                Yeni Talep Oluştur
              </button>
            </div>

            <div className="md:col-span-3 bg-white rounded-3xl shadow-sm p-8 border border-slate-100 mt-2 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Hızlı Şablonlarla Öğretmene Bildirin</h2>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => sendTemplateMessage("Hocam ekteki ödeve bakar mısınız?")} className="px-6 py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 font-semibold text-slate-600 text-sm rounded-xl transition-all border border-slate-200 hover:border-blue-200 shadow-sm">
                  📝 Ekteki ödeve bakar mısınız?
                </button>
                <button onClick={() => sendTemplateMessage("Hocam yarın 2. teneffüs müsait misiniz?")} className="px-6 py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 font-semibold text-slate-600 text-sm rounded-xl transition-all border border-slate-200 hover:border-blue-200 shadow-sm">
                  📅 Yarın 2. teneffüs müsait misiniz?
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Durum Takibi' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Tüm Geçmiş Log Kayıtları</h2>
            <div className="space-y-4">
              {logs.slice().reverse().map((log:any, idx) => (
                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all">
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${log.log_type === 'positive' ? 'bg-emerald-100 text-emerald-700' : log.log_type === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.log_type} Bildirim
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg mt-3">{log.title}</h3>
                    <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
