# BalanceBey 3D Frontend

`3d.balancebey.com` için bağımsız React/Vite uygulaması. Anonim model talebi, talep takibi, BalanceBey ödeme yönlendirmesi, yayın anketi, yönetim kuyruğu ve `<model-viewer>` tabanlı GLB/USDZ görüntüleyicisini içerir.

```bash
npm install
npm run build
```

Üretimde `VITE_API_BASE_URL` backend origin'ini göstermelidir. Aynı origin reverse proxy kullanılıyorsa boş bırakılır. `/view/:slug` yolları SPA fallback ile `index.html` dosyasına yönlendirilmelidir.
