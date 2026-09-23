import {useEffect, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import type {ModelViewerElement} from '@google/model-viewer'
import QRCode from 'qrcode'

const asset = '/models/yay-ayakli-masa-v1'
const modelName = 'Yay Ayaklı Masa'

function CubeIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z M3 7l9 5 9-5 M12 12v10"/></svg>}
function ARIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5m-9-9 5 3v5l-5 3-5-3v-5l5-3Zm-5 3 5 3 5-3m-5 3v5"/></svg>}

export function Models(){
  const viewer = useRef<ModelViewerElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [arMessage, setArMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [qr, setQR] = useState('')
  const [qrError, setQRError] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareURL = `${window.location.origin}/modellemeler?model=yay-ayakli-masa`

  useEffect(()=>{
    const previous = document.title
    document.title = 'Modellemeler · BalanceBey 3D Studio'
    return ()=>{document.title = previous}
  },[])
  useEffect(()=>{
    const element = viewer.current
    if (!element) return
    setReady(false); setError(''); setArMessage('')
    const loaded = ()=>setReady(true)
    const failed = ()=>setError('3D model yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.')
    const arStatus = (event: Event)=>{
      const status = (event as CustomEvent<{status: string}>).detail.status
      setArMessage(status === 'failed' ? 'AR başlatılamadı. Kamera iznini ve cihazınızın AR desteğini kontrol edin. iPhone’da Safari, Android’de Chrome ile açın.' : status === 'session-started' ? 'Telefonu yavaşça hareket ettirerek zemini tarayın.' : status === 'object-placed' ? 'Masa gerçek ölçüsüyle alanınıza yerleştirildi.' : '')
    }
    element.addEventListener('load', loaded)
    element.addEventListener('error', failed)
    element.addEventListener('ar-status', arStatus)
    if (element.loaded) loaded()
    return ()=>{element.removeEventListener('load', loaded);element.removeEventListener('error', failed);element.removeEventListener('ar-status', arStatus)}
  },[attempt])
  useEffect(()=>{
    let active=true
    QRCode.toDataURL(shareURL,{width:256,margin:2,color:{dark:'#202b20',light:'#ffffff'}}).then(value=>{if(active)setQR(value)}).catch(()=>{if(active)setQRError(true)})
    return ()=>{active=false}
  },[shareURL])

  function showPhone(){setCopied(false);dialog.current?.showModal()}
  function openAR(){
    const element=viewer.current
    if(!element || !ready)return
    setArMessage('')
    if(!element.canActivateAR){showPhone();return}
    // Keep activation inside the click gesture for Safari Quick Look and WebXR.
    void element.activateAR().catch(()=>setArMessage('AR açılamadı. Kamera iznini kontrol edin ve desteklenen bir telefonda tekrar deneyin.'))
  }
  async function copyLink(){
    try{await navigator.clipboard.writeText(shareURL);setCopied(true)}catch{setCopied(false);setQRError(true)}
  }

  return <main className="models-page">
    <section className="models-intro">
      <div><p className="eyebrow">BALANCEBEY / MODELLEMELER</p><h1>Tasarımı keşfet.<br/><em>Alanında gör.</em></h1><p className="models-lead">Her açıdan incele. Gerçek ölçüleriyle odana yerleştir.<br className="desktop-break"/> Koleksiyonumuz, artık bulunduğun yerde.</p></div>
      <div className="collection-note"><span className="collection-symbol"><CubeIcon/></span><span><strong>3D model koleksiyonu</strong><small>Web’de keşfet · Mobilde AR ile gör</small></span></div>
    </section>
    <div className="collection-heading"><h2>Modellemeler <span>01</span></h2><span className="collection-availability"><i/> Etkileşimli görüntüleme</span></div>
    <section className="model-collection" aria-label="3D modeller">
      <article className="model-card" id="yay-ayakli-masa">
        <div className="model-stage">
          <span className="model-category"><CubeIcon/> MOBİLYA</span>
          <model-viewer key={attempt} ref={viewer} src={`${asset}/masa.glb`} ios-src={`${asset}/masa.usdz`} poster={`${asset}/poster.webp`} alt="Açık ahşap, içe kavisli iki çerçeve ayak ve ince açık renk tabladan oluşan masa" ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed" ar-placement="floor" camera-controls touch-action="pan-y" shadow-intensity="1" shadow-softness="1" exposure="1" camera-orbit="35deg 70deg auto" field-of-view="30deg" loading="eager" reveal="auto" interaction-prompt="auto">
            <span slot="ar-button" hidden/>
            <button slot="ar-failure" className="ar-failure" onClick={showPhone}>AR açılamadı · Telefonda aç</button>
          </model-viewer>
          {!ready&&!error&&<span className="model-loading" role="status"><span className="loading-dot"/> 3D model hazırlanıyor…</span>}
          {error&&<div className="model-error" role="alert"><p>{error}</p><button onClick={()=>setAttempt(value=>value+1)}>Yeniden dene</button></div>}
          <div className="model-stage-footer"><span>↔ Sürükle, döndür ve yakınlaştır</span><span className="model-signature">BalanceBey <b>3D</b></span></div>
        </div>
        <div className="model-details">
          <p className="model-number">KOLEKSİYON / 001</p>
          <h3>{modelName}</h3>
          <p className="model-description">Kesintisiz yay formunda ahşap ayaklar, ince ve yalın bir tabla. Mekânınıza uyumunu her açıdan keşfedin.</p>
          <div className="model-formats" aria-label="Mevcut model formatları"><span><CubeIcon/> GLB <small>Web & Android</small></span><span><ARIcon/> USDZ <small>iPhone & iPad</small></span></div>
          <dl className="model-dimensions"><div><dt>Uzunluk</dt><dd>220 <span>cm</span></dd></div><div><dt>Genişlik</dt><dd>90 <span>cm</span></dd></div><div><dt>Yükseklik</dt><dd>76 <span>cm</span></dd></div></dl>
          <p className="dimension-note">Model ölçüleri referans görselden tahmin edilmiştir.</p>
          <button className="model-ar-button" onClick={openAR} disabled={!ready||!!error}><ARIcon/> AR ile gör <span aria-hidden="true">↗</span></button>
          <p className="ar-helper">Desteklenen telefonda kameranızla, gerçek ölçekte. Bilgisayarda QR kod ile telefonunuza geçin.</p>
          <button className="phone-link" onClick={showPhone}>Telefonda aç <span aria-hidden="true">↗</span></button>
          {arMessage&&<p className="ar-message" role="status">{arMessage}</p>}
        </div>
      </article>
    </section>
    <section className="models-how" aria-label="Nasıl kullanılır"><div><span>01</span><h3>Modeli incele</h3><p>Sürükleyerek döndür, yakınlaştır ve detaylara bak.</p></div><div><span>02</span><h3>AR ile gör</h3><p>Telefonunda aç, kameraya izin ver ve zemini tara.</p></div><div><span>03</span><h3>Alanına yerleştir</h3><p>Masayı odanda gerçek ölçüsüyle gör, yerini değiştir.</p></div></section>
    <div className="models-request"><span>Sizin ürününüz de burada hayat bulsun.</span><Link to="/">Model talebi oluştur <span aria-hidden="true">↗</span></Link></div>
    <dialog ref={dialog} className="phone-dialog" aria-labelledby="phone-title" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}>
      <button className="dialog-close" aria-label="Kapat" onClick={()=>dialog.current?.close()}>×</button>
      <p className="eyebrow">MEKÂNINDA DENE</p><h2 id="phone-title">Telefonunda aç.</h2>
      <p>Kameranla QR kodu okut. Açılan sayfada <strong>AR ile gör</strong> düğmesine dokun.</p>
      {qr?<img className="model-qr" src={qr} alt="Yay Ayaklı Masa sayfasını telefonda açmak için QR kod" width="256" height="256"/>:<p role="status">{qrError?'QR kod oluşturulamadı. Aşağıdaki bağlantıyı kullanabilirsiniz.':'QR kod hazırlanıyor…'}</p>}
      <button className="copy-model-link" onClick={copyLink}>{copied?'Bağlantı kopyalandı ✓':'Bağlantıyı kopyala'}</button>
      <a className="model-share-url" href={shareURL}>{shareURL}</a>
      <p className="phone-requirements">iPhone / iPad: Safari ve AR Quick Look.<br/>Android: Chrome ve AR destekli cihaz.<br/>Kamera izni gerekir; masa yerleştirilirken zemini tarayın.</p>
    </dialog>
  </main>
}
