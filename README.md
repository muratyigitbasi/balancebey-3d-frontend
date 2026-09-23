# BalanceBey 3D Frontend

`3d.balancebey.com` için bağımsız React/Vite uygulaması. Anonim model talebi, talep takibi, BalanceBey ödeme yönlendirmesi, yayın anketi, yönetim kuyruğu ve `<model-viewer>` tabanlı GLB/USDZ görüntüleyicisini içerir.

```bash
npm install
npm run build
```

Üretimde `VITE_API_BASE_URL` backend origin'ini göstermelidir. Aynı origin reverse proxy kullanılıyorsa boş bırakılır. `/view/:slug` yolları SPA fallback ile `index.html` dosyasına yönlendirilmelidir.

## Modellemeler ve AR

`/modellemeler` onaylanan Yay Ayaklı Masa modelini etkileşimli bir kartta gösterir. Model GLB ve iOS Quick Look için USDZ olarak `public/models/yay-ayakli-masa-v1/` altında tutulur. Modelin tahmini ölçüsü 220 × 90 × 76 cm, tabanı Y-up dosyalarda Y=0, birimi metredir. Kaynak Blender dosyası ve referans fotoğraflar yayınlanmaz.

AR düğmesi desteklenen cihazlarda WebXR, Android Scene Viewer veya iOS Quick Look başlatır. Masaüstünde telefon için yerel oluşturulan QR kod gösterilir. Kameraya yerleştirme testi fiziksel, AR destekli cihaz ve kullanıcı kamera izni gerektirir.

Nginx HTTPS server bloğuna `deploy/nginx-model-assets.conf` içindeki location eklenmelidir; GLB `model/gltf-binary`, USDZ `model/vnd.usdz+zip` olarak sunulmalıdır. Bilinmeyen model yolları gerçek 404 dönmelidir. Model değişirse önbellek karışıklığını önlemek için yeni sürüm dizini ve kart varlık yolu kullanın.
