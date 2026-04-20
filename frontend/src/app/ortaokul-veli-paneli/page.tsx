"use client";
import React, { useEffect, useState } from 'react';

export default function OrtaokulVeliPaneli() {
  const [activeTab, setActiveTab] = useState('Ana Ekran');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appForm, setAppForm] = useState({ subject: '', date: '', time: '', teacher: 'Matematik' });

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const executeAppointment = async () => {
    if(!appForm.subject || !appForm.date || !appForm.time) return showToast("Lütfen tüm alanları doldurun", 'error');
    try {
      const requestDateTime = new Date(`${appForm.date}T${appForm.time}:00`);
      const response = await fetch('http://127.0.0.1:8000/api/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent: 1, teacher: 1, student: 1,
          requested_time: requestDateTime.toISOString(),
          subject: `${appForm.teacher} Dersi: ${appForm.subject}`, 
          description: `Branş/Ders Özel Randevusu. İçerik: ${appForm.subject}`, 
          status: "pending"
        }),
      });
      if (response.ok) {
        showToast(`✔ ${appForm.teacher} Öğretmeni için talebiniz iletildi!`, 'success');
        setIsModalOpen(false); 
      }
    } catch (error) { showToast("Bağlantı sorunu yaşandı", 'error'); }
  };

  const menuItems = ['Ana Ekran', 'Ders Programı', 'Durum Takibi'];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 relative overflow-hidden">
      
      {/* Özel Bildiri Penceresi (Toast) */}
      {toast && (
        <div className={`absolute top-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all transform animate-bounce ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <div className={`p-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path></svg>
          </div>
          <p className="font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      {/* ÇOKLU EĞİTMEN SEÇİM MODALI (Gelişmiş Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 w-full max-w-lg transform transition-all">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Branş Eğitmeni Görüşmesi</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 font-bold p-2 bg-slate-100 rounded-full hover:bg-rose-50">✕</button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1">Ders / Eğitmen Seçimi</label>
                   <select value={appForm.teacher} onChange={e => setAppForm({...appForm, teacher: e.target.value})} className="w-full border-2 border-slate-200 focus:border-indigo-500 bg-white rounded-xl px-4 py-3 font-bold text-indigo-700 outline-none transition-all">
                      <option value="Matematik">Matematik Öğretmeni (Ali Y.)</option>
                      <option value="Fen Bilgisi">Fen Bilgisi Öğretmeni (Ayşe K.)</option>
                      <option value="Türkçe">Türkçe Öğretmeni (Fatma S.)</option>
                      <option value="İngilizce">İngilizce Öğretmeni (John D.)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1">Görüşme Konusu (Özet)</label>
                   <input type="text" value={appForm.subject} onChange={e => setAppForm({...appForm, subject: e.target.value})} placeholder="Örn: Deneme sınavı sonuçları" className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none transition-all"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-bold text-slate-600 mb-1">Tarih</label>
                     <input type="date" value={appForm.date} onChange={e => setAppForm({...appForm, date: e.target.value})} className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none"/>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-600 mb-1">Saat / Teneffüs</label>
                     <input type="time" value={appForm.time} onChange={e => setAppForm({...appForm, time: e.target.value})} className="w-full border-2 border-slate-200 focus:border-blue-500 bg-white rounded-xl px-4 py-3 font-medium text-slate-800 outline-none"/>
                   </div>
                </div>
                <div className="pt-4">
                  <button onClick={executeAppointment} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold tracking-wide shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none">
                    Seçilen Eğitmene Randevu Talebi Yolla
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Sol Menü */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shadow-2xl z-10 border-r-4 border-indigo-500">
        <div className="p-8 text-2xl font-black text-white tracking-widest border-b border-slate-800 flex flex-col">
          <span>ORTAOKUL</span>
          <span className="text-indigo-400 text-sm mt-1">VELİ PLATFORMU</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-3">
          {menuItems.map(item => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium tracking-wide ${
                activeTab === item 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Ana Çatı */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">İyi Günler, Zeynep'in Velisi</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 tracking-wide">Ortaokul Öğrencisi: Zeynep Demir (7/A)</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white flex items-center justify-center font-bold text-lg shadow-md">
            ZD
          </div>
        </header>

        {activeTab === 'Ana Ekran' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-2">Tüm Dersler ve Eğitmenler</h3>
              <p className="text-slate-300 mb-6">Öğrencinizin girdiği tüm derslerin branş öğretmenlerini tek platformdan yönetin.</p>
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg focus:ring-4 focus:ring-indigo-300 w-full">
                Branş Öğretmeninden Randevu Talep Et
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Gelecek Haftanın Planı</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Matematik Sınavı</span>
                  <span className="text-indigo-600 font-bold bg-indigo-100 px-3 py-1 rounded-full text-sm">Salı, 3. Ders</span>
                </li>
                <li className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">Fen Proje Teslimi</span>
                  <span className="text-indigo-600 font-bold bg-indigo-100 px-3 py-1 rounded-full text-sm">Cuma, 1. Ders</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
