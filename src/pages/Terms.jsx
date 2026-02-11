import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">⚖️ Kullanım Koşulları</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Taraflar</h2>
          <p className="text-gray-700">
            İşbu Kullanım Koşulları, [Şirket Ünvanı] ("Satış Radar") ile platforma kayıt olan kullanıcı ("Kullanıcı") arasında akdedilmiştir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hizmet Tanımı</h2>
          <p className="text-gray-700">
            Satış Radar; otel satış ekiplerinin teklif, follow-up, kullanıcı ve raporlama süreçlerini dijital ortamda yönetmelerini sağlayan abonelik tabanlı bir SaaS platformudur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Üyelik ve Hesap Oluşturma</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Satış Radar'a üyelik otel bazlıdır.</li>
            <li>Bireysel kullanıcı kaydı bulunmamaktadır.</li>
            <li>Her otel hesabı için bir Admin kullanıcı tanımlanır.</li>
            <li>Kullanıcılar yalnızca Admin tarafından davet edilebilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kullanıcı Sorumlulukları</h2>
          <p className="text-gray-700 mb-4">Kullanıcı;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Hesap bilgilerini gizli tutmakla,</li>
            <li>Yetkisiz kullanımları önlemekle,</li>
            <li>Platformu hukuka aykırı amaçlarla kullanmamayı,</li>
            <li>Yanıltıcı veya üçüncü kişilere ait verileri sisteme girmemeyi</li>
          </ul>
          <p className="text-gray-700 mt-4">kabul eder.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kullanıcı Sayısı ve Yetkilendirme</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Standart abonelik paketi kapsamında en fazla 4 kullanıcı (admin dahil) tanımlanabilir.</li>
            <li>Bu limitin aşılması durumunda ek kullanıcı satın alınması zorunludur.</li>
            <li>Kullanıcı ekleme, silme ve yetkilendirme işlemleri yalnızca Admin tarafından yapılabilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Abonelik Süresi ve Deneme</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Satış Radar, yıllık abonelik modeli ile sunulur.</li>
            <li>Yeni kullanıcılar için 7 gün ücretsiz deneme süresi tanınır.</li>
            <li>Deneme süresi sonunda ödeme yapılmazsa sistem erişimi durdurulur.</li>
            <li>Deneme süresi sonunda herhangi bir ücret tahsil edilmez.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Hizmetin Askıya Alınması</h2>
          <p className="text-gray-700 mb-4">Satış Radar;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Ödeme yapılmaması,</li>
            <li>Kullanım koşullarına aykırılık,</li>
            <li>Sistem güvenliğini tehdit eden durumlar</li>
          </ul>
          <p className="text-gray-700 mt-4">halinde hizmeti geçici veya kalıcı olarak askıya alma hakkını saklı tutar.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Fikri Mülkiyet Hakları</h2>
          <p className="text-gray-700">
            Satış Radar'a ait tüm yazılım, tasarım, logo ve içerikler [Şirket Ünvanı]'na aittir. 
            İzinsiz kopyalanamaz, çoğaltılamaz, devredilemez.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Sorumluluğun Sınırlandırılması</h2>
          <p className="text-gray-700 mb-4">Satış Radar;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>İnternet kesintileri,</li>
            <li>Teknik arızalar,</li>
            <li>Üçüncü taraf hizmet sağlayıcı kaynaklı kesintiler</li>
          </ul>
          <p className="text-gray-700 mt-4">nedeniyle oluşabilecek dolaylı zararlardan sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Değişiklikler</h2>
          <p className="text-gray-700">
            Satış Radar, kullanım koşullarında değişiklik yapma hakkını saklı tutar. 
            Güncellemeler web sitesi üzerinden yayınlanır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Uygulanacak Hukuk</h2>
          <p className="text-gray-700">
            İşbu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. 
            Uyuşmazlıklarda [Şehir] Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>

        <hr className="my-8 border-gray-300" />

        <h1 className="text-3xl font-bold mb-8">🧾 Fatura & İade Şartları</h1>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Faturalandırma</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Satış Radar hizmeti, yıllık yazılım abonelik hizmeti olarak faturalandırılır.</li>
            <li>Faturalar elektronik ortamda (e-Fatura / e-Arşiv) düzenlenir.</li>
            <li>Fatura açıklamasında hizmet adı açıkça belirtilir.</li>
          </ul>
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mt-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Örnek:</span><br />
              Satış Radar – Yıllık Yazılım Abonelik Hizmeti
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Ücretler</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-semibold">Yıllık abonelik ücreti:</span> 1.990 TL + KDV (4 kullanıcı dahil)</li>
              <li><span className="font-semibold">Ek kullanıcı ücreti:</span> 350 TL + KDV / yıl / kullanıcı</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ödeme</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Ödemeler peşin olarak alınır.</li>
            <li>Abonelik süresi, ödemenin başarılı şekilde tamamlanmasıyla başlar.</li>
            <li>Ek kullanıcı ücretleri, mevcut abonelik süresi sonuna kadar geçerli olacak şekilde tahsil edilir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. İade Politikası</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <ul className="space-y-2 text-gray-700">
              <li>Satış Radar, dijital hizmet sunduğundan <span className="font-semibold">abonelik ücretleri iade edilmez.</span></li>
              <li>Deneme süresi boyunca herhangi bir ücret alınmaz.</li>
              <li>Deneme süresi sonrasında yapılan ödemelerde iptal halinde ücret iadesi yapılmaz.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Yenileme</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Abonelik süresi sonunda yenileme yapılmadığı takdirde sistem erişimi durdurulur.</li>
            <li>Yenileme yapılması halinde abonelik aynı koşullarla devam eder.</li>
          </ul>
        </section>

        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <p className="text-sm text-gray-600 text-center">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-8">
          <p className="text-center text-gray-700">
            <span className="font-semibold">Kısa Özet:</span> Satış Radar yıllık abonelik modeliyle çalışır. 
            Deneme süresi ücretsizdir. Abonelik ücretleri iade edilmez.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
