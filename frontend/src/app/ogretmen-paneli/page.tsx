"use client";
import React, { useEffect, useState } from 'react';

export default function OgretmenPaneli() {
  const [activeTab, setActiveTab] = useState('Ana Ekran');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [logText, setLogText] = useState("");
  // Site İçi Bildirim (Toast) State
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetch('http://127.0.0.1:8000/api/appointments/')
      .then(r => r.json())
      .then(data => setAppointments(data.filter((a:any) => a.status === 'pending')));

    fetch('http://127.0.0.1:8000/api/messages/')
      .then(r => r.json())
      .then(data => setMessages(data));
  };

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000); // 4 sn sonra kaybolur
  };

  const handleAppt = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/appointments/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) { 
        showToast(status === 'approved' ? "Randevu başarıyla ONAYLANDI." : "Randevu REDDEDİLDİ.", 'success'); 
        fetchData(); 
      }
    } catch (err) { showToast("Bağlantı hatası", 'error'); }
  };

  const sendLog = async (type: string) => {
    if (!logText) return showToast("Davranış hakkında not giriniz.", 'error');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/behavior-logs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher: 1, student: 1, log_type: type, title: "Sistemden Hızlı Davranış Logu", description: logText })
      });
      if (res.ok) { 
        showToast("Log veli sistemine anında ulaştırıldı!", 'success'); 
        setLogText(""); 
      }
    } catch (err) { showToast("Sistemsel hata oluştu", 'error'); }
  };

  const menuItems = ['Ana Ekran', 'Randevularım', 'Gelen Mesajlar'];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800 relative overflow-hidden">
      
      {/* Özel Bildirim Penceresi (Toast Modal) */}
      {toast && (
        <div className={`absolute top-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all animate-bounce ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path></svg>
          </div>
          <p className="font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shadow-2xl z-10">
        {/* HİZALAMA HATASI DÜZELTİLDİ: flex-wrap eklendi */}
        <div className="p-8 text-xl lg:text-2xl font-black text-white tracking-widest border-b border-slate-800 flex flex-wrap items-center gap-1">
          EĞİTMEN<span className="text-amber-500">PORTAL</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-3">
          {menuItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium tracking-wide flex justify-between items-center ${
                activeTab === item 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item}</span>
              {item === 'Gelen Mesajlar' && messages.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === item ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                  {messages.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">İyi Dersler, Elif Yılmaz</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">4/B Sınıf Öğretmeni</p>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-slate-700">
            EY
          </div>
        </header>

        {activeTab === 'Ana Ekran' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">İşlem Bekleyen Randevular ({appointments.length})</h2>
              {appointments.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl text-center border border-slate-200">
                  <p className="text-slate-500 text-sm font-medium">Harika! Bekleyen işlem yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <div key={app.id} className="bg-amber-50 rounded-2xl p-6 border border-amber-100 transform transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          VELİ ONAY BEKLİYOR
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2">{app.subject}</h3>
                      <p className="text-slate-700 text-sm font-medium bg-white p-4 rounded-xl border border-amber-100 leading-relaxed shadow-sm">
                        "{app.description}" 
                      </p>
                      <div className="mt-6 flex gap-3">
                        <button onClick={() => handleAppt(app.id, 'approved')} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-sm transition-all">Onayla</button>
                        <button onClick={() => handleAppt(app.id, 'rejected')} className="flex-1 bg-white border-2 border-slate-200 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-50 shadow-sm transition-all">Reddet</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 h-fit hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Hızlı Davranış Logu Ekle</h2>
              <div className="space-y-5">
                <select className="w-full border-slate-200 rounded-xl shadow-sm bg-slate-50 py-3 px-4 text-slate-700 font-bold transition-all outline-none">
                  <option>Ahmet Kaya (4/B)</option>
                  <option>Diğer Öğrenciler...</option>
                </select>
                <textarea 
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  className="w-full border-slate-200 rounded-xl shadow-inner bg-slate-50 p-4 font-medium text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" 
                  placeholder="Veli panelinde saniyesinde yeşil/kırmızı uyarı olarak düşecek olan bildirimin metnini yazın..." rows={4}>
                </textarea>
                <div className="flex gap-3">
                  <button onClick={() => sendLog('positive')} className="flex-1 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 rounded-xl py-3 text-sm font-bold tracking-wide hover:bg-emerald-100 hover:shadow-sm transition-all active:scale-95">+ Olumlu Bildir</button>
                  <button onClick={() => sendLog('negative')} className="flex-1 border-2 border-rose-500 text-rose-700 bg-rose-50 rounded-xl py-3 text-sm font-bold tracking-wide hover:bg-rose-100 hover:shadow-sm transition-all active:scale-95">- Olumsuz Uyar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Gelen Mesajlar' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">Tüm Gelen Şablonlar / Mesajlar</h2>
            <div className="space-y-4">
              {messages.slice().reverse().map((msg) => (
                <div key={msg.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-center hover:bg-white transition-all shadow-sm group">
                  <div className="flex items-center gap-4">
                     <div className="hidden md:flex w-10 h-10 bg-blue-100 text-blue-700 rounded-full items-center justify-center font-bold shadow-inner">
                       {msg.is_template ? "📌" : "✏️"}
                     </div>
                     <div>
                       <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{msg.is_template ? "Öncelikli Başlık" : "Mesaj"}</span>
                       <p className="font-bold text-slate-800 mt-1">Arzu Kaya (Veli)</p>
                     </div>
                  </div>
                  <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100 font-medium text-slate-700 text-sm mt-4 md:mt-0 w-full md:w-auto text-center md:text-left group-hover:shadow-md transition-shadow">
                    "{msg.content}"
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-slate-500 font-medium p-4">Hiç mesaj yok.</p>}
            </div>
          </div>
        )}

        {activeTab === 'Randevularım' && (
          <div className="flex items-center justify-center h-64 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-semibold tracking-wide">Onaylanan geçmiş/gelecek ajanda sayfası şu an pasiftir.</p>
          </div>
        )}
      </main>
    </div>
  );
}
