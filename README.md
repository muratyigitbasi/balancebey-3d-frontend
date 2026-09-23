# BalanceBey 3D Frontend

`3d.balancebey.com` için bağımsız React/Vite uygulaması. Anonim model talebi, talep takibi, BalanceBey ödeme yönlendirmesi, yayın anketi, yönetim kuyruğu ve `<model-viewer>` tabanlı GLB/USDZ görüntüleyicisini içerir.

```bash
npm install
npm run build
```

Üretimde `VITE_API_BASE_URL` backend origin'ini göstermelidir. Aynı origin reverse proxy kullanılıyorsa boş bırakılır. `/view/:slug` yolları SPA fallback ile `index.html` dosyasına yönlendirilmelidir.

## Modellemeler ve AR

`/modellemeler` Yay Ayaklı Masa ve Altın Kristal Avize modellerini ayrı kartlarda gösterir. Masa `public/models/yay-ayakli-masa-v2/`, avize `public/models/altin-kristal-avize-v1/` altında GLB/USDZ olarak tutulur. Tahmini ölçüler masa için 220 × 90 × 76 cm, avize için 78 cm çap ve 109 cm yüksekliktir; birim metredir. `?model=altin-kristal-avize` doğrudan avize kartını açar. Kaynak Blender dosyaları ve referans fotoğraflar yayınlanmaz.

AR düğmesi desteklenen cihazlarda WebXR, Android Scene Viewer veya iOS Quick Look başlatır. Masaüstünde telefon için yerel oluşturulan QR kod gösterilir. Kameraya yerleştirme testi fiziksel, AR destekli cihaz ve kullanıcı kamera izni gerektirir.

Avize için ayrı `avize-tavan-v1.usdz` dosyası deneysel iPhone/iPad tavan önizlemesidir. USD `Preliminary_AnchoringAPI` ile yatay düzleme bağlanır; bağlantı noktası üst kapakta Y=0, model aşağı doğru uzanır. Apple'ın `horizontal` seçeneği tavan, zemin ve masayı birlikte kapsar; yalnızca tavan sınıflandırmasını zorlamaz. Bu nedenle UI başarı garantisi vermez ve normal AR akışını korur. Fiziksel Quick Look tavan algılama/yerleştirme testi henüz yapılmamıştır. Şema: https://developer.apple.com/documentation/usd/preliminary-planeanchoring-alignment

Nginx HTTPS server bloğuna `deploy/nginx-model-assets.conf` içindeki location eklenmelidir; GLB `model/gltf-binary`, USDZ `model/vnd.usdz+zip` olarak sunulmalıdır. Bilinmeyen model yolları gerçek 404 dönmelidir. Model değişirse önbellek karışıklığını önlemek için yeni sürüm dizini ve kart varlık yolu kullanın.
