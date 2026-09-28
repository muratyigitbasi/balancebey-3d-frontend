# BalanceBey 3D Frontend

`3d.balancebey.com` için bağımsız React/Vite uygulaması. Anonim model talebi, talep takibi, BalanceBey ödeme yönlendirmesi, yayın anketi, yönetim kuyruğu ve `<model-viewer>` tabanlı GLB/USDZ görüntüleyicisini içerir.

## CAD çalışma alanı (MVP)

`/cad` rotasında browser tabanlı parametrik CAD taslağı bulunur. XY/XZ/YZ düzlemi seçip Sketch oluşturun; çizgi, dikdörtgen veya daire çizin. Kapalı profil çizdikten sonra sketch altındaki **3D oluştur / görüntüle** düğmesine basın. Çizgi aracı bir çizgi zinciri oluşturur; başlangıç noktasına yeniden tıklayarak kapatın veya **Çizgiyi bitir** ile açık bırakın. Sağ panelde extrusion mesafesini mm cinsinden düzenleyin; sketch'teki tüm kapalı dikdörtgen, daire ve birleşen çizgi profilleri Three.js viewport'unda katı olarak görünür. Açık çizgiler 2D kalır ve ekranda uyarı gösterilir. GLB dosyasını indirebilir veya aynı cihazda AR önizlemesini açabilirsiniz. JSON indir/aç ve otomatik yerel taslak kaydı feature history'yi korur; geri al/ileri al düzenleme oturumunda çalışır.

Geometri `src/cad/kernel.ts` içindeki OpenCascade.js adapter'ında B-Rep olarak hesaplanır. OpenCascade tessellation ve GLB üretir; Three.js yalnız GLB'yi viewport'ta gösterir. Doküman birimi mm, geometri/GLB birimi gerçek AR ölçeği için metredir. WASM yalnız katı model ilk kez gerektiğinde yüklenir (yaklaşık 50 MB aktarım öncesi dosya boyutu). CAD hesaplaması tarayıcıda yapılır; sunucu GPU'su gerekmez.

`src/cad/model.ts` sürümlü JSON dokümanını ve Sketch, Extrude, Revolve, Sweep, Loft, Boolean, Fillet, Chamfer feature türlerini tanımlar. Son altı tür için UI ve veri modeli genişleme noktası vardır; bunların geometri operatörleri ve kontrol panelleri henüz uygulanmadı. Constraint solver, ölçü kısıtları, delikler/boolean birleşimleri, assembly, STEP/USDZ export, sunucuya proje kaydı ve paylaşılabilir AR URL sonraki aşamalardır. Yerel Blob URL başka cihaza taşınamadığından AR önizlemesi aynı cihaz içindir.

```bash
npm run build
npm run test
npm run lint
```

Lint komutu yeni CAD modüllerini denetler; önceki sayfalar için lint altyapısı mevcut değildi. OpenCascade.js WASM dosyası LGPL-2.1-only lisanslı bağımlılık olarak paketlenir; dağıtımda lisans koşulları gözden geçirilmelidir.

```bash
npm install
npm run build
```

Üretimde `VITE_API_BASE_URL` backend origin'ini göstermelidir. Aynı origin reverse proxy kullanılıyorsa boş bırakılır. `/view/:slug` yolları SPA fallback ile `index.html` dosyasına yönlendirilmelidir.

## Modellemeler ve AR

`/modellemeler` Yay Ayaklı Masa ve Altın Kristal Avize modellerini ayrı kartlarda gösterir. Masa `public/models/yay-ayakli-masa-v2/`, avize `public/models/altin-kristal-avize-v2/` altında GLB/USDZ olarak tutulur. Tahmini ölçüler masa için 220 × 90 × 76 cm, avize için 78 cm çap ve 109 cm yüksekliktir; birim metredir. `?model=altin-kristal-avize` doğrudan avize kartını açar. Kaynak Blender dosyaları ve referans fotoğraflar yayınlanmaz. Avizenin ikinci sürümünde kristal opaklığı %28'e yükseltilerek kristallerin kamera görüntüsünde daha belirgin görünmesi hedeflenmiştir.

AR düğmesi desteklenen cihazlarda WebXR, Android Scene Viewer veya iOS Quick Look başlatır. Avizenin ana AR düğmesi iPhone/iPad üzerinde doğrudan `ceilingAsset` USDZ dosyasını kullanır; ayrı bir tavan düğmesi yoktur. Masa normal USDZ dosyasını kullanmayı sürdürür. Masaüstünde telefon için yerel oluşturulan QR kod gösterilir. Kameraya yerleştirme testi fiziksel, AR destekli cihaz ve kullanıcı kamera izni gerektirir.

Avize için ayrı `avize-tavan-v2.usdz` dosyası deneysel iPhone/iPad tavan önizlemesidir. USD `Preliminary_AnchoringAPI` ile yatay düzleme bağlanır; kök bağlantı noktası üst kapakta Y=0 olarak korunur. Kullanıcının iPhone'unda tavan yerleşiminde görülen ters dönmeyi telafi etmek için alt model üst kapaktaki bağlantı noktası etrafında 180 derece döndürülür. Bu düzeltmenin fiziksel cihazda yeniden doğrulanması gerekir; tüm cihazlarda doğru yerleşim garantisi verilmez. Apple'ın `horizontal` seçeneği tavan, zemin ve masayı birlikte kapsar; yalnızca tavan sınıflandırmasını zorlamaz. Bu nedenle UI deneysel uyarısını ve normal AR akışını korur. Şema: https://developer.apple.com/documentation/usd/preliminary-planeanchoring-alignment

Nginx HTTPS server bloğuna `deploy/nginx-model-assets.conf` içindeki location eklenmelidir; GLB `model/gltf-binary`, USDZ `model/vnd.usdz+zip` olarak sunulmalıdır. Bilinmeyen model yolları gerçek 404 dönmelidir. Model değişirse önbellek karışıklığını önlemek için yeni sürüm dizini ve kart varlık yolu kullanın.
