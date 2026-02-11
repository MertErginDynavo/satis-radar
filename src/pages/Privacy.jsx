import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">🔐 KVKK Aydınlatma Metni</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
          <p className="text-gray-700 mb-4">
            Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, 
            [Şirket Ünvanı] ("Satış Radar") tarafından, veri sorumlusu sıfatıyla hazırlanmıştır.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="font-semibold text-gray-900">İletişim Bilgileri:</p>
            <p className="text-gray-700">E-posta: destek@satisradar.com</p>
            <p className="text-gray-700">Adres: [Şirket adresi]</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. İşlenen Kişisel Veriler</h2>
          <p className="text-gray-700 mb-4">Satış Radar platformu üzerinden aşağıdaki kişisel veriler işlenebilir:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Ad, soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Kullanıcı rolü ve yetkileri</li>
            <li>IP adresi ve log kayıtları</li>
            <li>Otel ve firma bilgileri</li>
            <li>Platform kullanım verileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p className="text-gray-700 mb-4">Kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>SaaS hizmetinin sunulması ve yönetilmesi</li>
            <li>Kullanıcı hesaplarının oluşturulması</li>
            <li>Follow-up, teklif ve raporlama işlemlerinin yapılması</li>
            <li>Kullanıcı yetkilendirme ve erişim kontrolü</li>
            <li>Faturalandırma ve muhasebe süreçleri</li>
            <li>Sistem güvenliğinin sağlanması</li>
            <li>Müşteri destek süreçlerinin yürütülmesi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kişisel Verilerin Aktarılması</h2>
          <p className="text-gray-700 mb-4">Kişisel veriler;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Yasal yükümlülükler kapsamında yetkili kamu kurumlarına</li>
            <li>Ödeme altyapısı sağlayıcılarına</li>
            <li>Sunucu ve hosting hizmeti alınan iş ortaklarına</li>
          </ul>
          <p className="text-gray-700 mt-4">KVKK'ya uygun olarak aktarılabilir.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebep</h2>
          <p className="text-gray-700 mb-4">Kişisel veriler;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Web sitesi ve uygulama üzerindeki formlar</li>
            <li>Kullanıcı girişleri</li>
            <li>Sistem logları</li>
          </ul>
          <p className="text-gray-700 mt-4">
            aracılığıyla, KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanarak işlenir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. KVKK Kapsamındaki Haklarınız</h2>
          <p className="text-gray-700 mb-4">KVKK'nın 11. maddesi kapsamında veri sahipleri:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini talep etme</li>
            <li>İşlemenin kanuna aykırı olması halinde zararın giderilmesini talep etme</li>
          </ul>
          <p className="text-gray-700 mt-4">haklarına sahiptir.</p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
            <p className="text-gray-900">
              <span className="font-semibold">Taleplerinizi</span> destek@satisradar.com adresine iletebilirsiniz.
            </p>
          </div>
        </section>

        <hr className="my-8 border-gray-300" />

        <h1 className="text-3xl font-bold mb-8">🔐 Gizlilik Politikası</h1>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Genel</h2>
          <p className="text-gray-700">
            Satış Radar, kullanıcılarının gizliliğini ve veri güvenliğini ciddiyetle ele alır. 
            Bu gizlilik politikası, platform üzerinden toplanan verilerin nasıl kullanıldığını açıklar.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Bilgilerin Kullanımı</h2>
          <p className="text-gray-700 mb-4">Toplanan bilgiler;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Hizmet kalitesini artırmak</li>
            <li>Platform performansını iyileştirmek</li>
            <li>Kullanıcı deneyimini geliştirmek</li>
            <li>Teknik sorunları tespit etmek</li>
          </ul>
          <p className="text-gray-700 mt-4">amacıyla kullanılır.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Veri Güvenliği</h2>
          <p className="text-gray-700 mb-4">Satış Radar;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Yetkisiz erişimi önlemek</li>
            <li>Veri kaybını engellemek</li>
            <li>Sistem güvenliğini sağlamak</li>
          </ul>
          <p className="text-gray-700 mt-4">amacıyla teknik ve idari tedbirler almaktadır.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Çerezler (Cookies)</h2>
          <p className="text-gray-700 mb-4">Satış Radar web sitesinde;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Oturum yönetimi</li>
            <li>Güvenlik</li>
            <li>Kullanıcı deneyimi</li>
          </ul>
          <p className="text-gray-700 mt-4">
            amaçlarıyla çerezler kullanılabilir. Kullanıcılar tarayıcı ayarları üzerinden çerez kullanımını kontrol edebilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Üçüncü Taraf Bağlantılar</h2>
          <p className="text-gray-700">
            Platform üzerinde üçüncü taraf sitelere yönlendiren bağlantılar bulunabilir. 
            Bu sitelerin gizlilik uygulamalarından Satış Radar sorumlu değildir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Veri Saklama Süresi</h2>
          <p className="text-gray-700 mb-4">Kişisel veriler;</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Hizmet süresi boyunca</li>
            <li>Yasal yükümlülükler kapsamında gerekli olan süre boyunca</li>
          </ul>
          <p className="text-gray-700 mt-4">saklanır ve sürenin sonunda silinir veya anonim hale getirilir.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Politika Güncellemeleri</h2>
          <p className="text-gray-700">
            Satış Radar, bu gizlilik politikasını güncelleme hakkını saklı tutar. 
            Güncellemeler web sitesi üzerinden yayınlanır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. İletişim</h2>
          <p className="text-gray-700 mb-4">Gizlilik ve KVKK ile ilgili her türlü soru için:</p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-gray-900">📧 destek@satisradar.com</p>
          </div>
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
