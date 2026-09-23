import {useEffect, useRef, useState} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import type {ModelViewerElement} from '@google/model-viewer'
import QRCode from 'qrcode'

type CollectionModel = {
  id: string
  name: string
  category: string
  asset: string
  file: string
  description: string
  alt: string
  dimensions: {label: string; value: number; unit: string}[]
  cameraOrbit: string
  arModes?: string
  environment?: string
  skybox?: string
  exposure?: string
  theme?: 'gold'
  placementNote?: string
}

const models: CollectionModel[] = [
  {
    id: 'yay-ayakli-masa',
    name: 'Yay Ayaklı Masa',
    category: 'MOBİLYA',
    asset: '/models/yay-ayakli-masa-v2',
    file: 'masa',
    description: 'Kesintisiz yay formunda ahşap ayaklar, ince ve yalın bir tabla. Mekânınıza uyumunu her açıdan keşfedin.',
    alt: 'Açık ahşap, içe kavisli iki çerçeve ayak ve ince açık renk tabladan oluşan masa',
    dimensions: [{label: 'Uzunluk', value: 220, unit: 'cm'}, {label: 'Genişlik', value: 90, unit: 'cm'}, {label: 'Yükseklik', value: 76, unit: 'cm'}],
    cameraOrbit: '35deg 70deg auto',
  },
  {
    id: 'altin-kristal-avize',
    name: 'Altın Kristal Avize',
    category: 'AYDINLATMA',
    asset: '/models/altin-kristal-avize-v1',
    file: 'avize',
    description: 'Kıvrımlı altın kollar, mum biçimli ışıklar ve ışığı yakalayan kesme kristaller. Klasik avizenin zarif detaylarını yakından keşfedin.',
    alt: 'Altın renkli kıvrımlı kollara, mum biçimli ışıklara ve sarkıt kesme kristallere sahip klasik avize',
    dimensions: [{label: 'Çap', value: 78, unit: 'cm'}, {label: 'Toplam yükseklik', value: 109, unit: 'cm'}],
    cameraOrbit: '25deg 85deg auto',
    arModes: 'webxr quick-look',
    environment: '/models/altin-kristal-avize-v1/studio.hdr',
    skybox: '/models/altin-kristal-avize-v1/skybox.png',
    exposure: '0.8',
    theme: 'gold',
    placementNote: 'AR önizlemesi zemini referans alır; tavan montaj yüksekliği temsilidir.',
  },
]

function CubeIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z M3 7l9 5 9-5 M12 12v10"/></svg>}
function ARIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5m-9-9 5 3v5l-5 3-5-3v-5l5-3Zm-5 3 5 3 5-3m-5 3v5"/></svg>}

function ModelCard({model, index, eager}: {model: CollectionModel; index: number; eager: boolean}){
  const viewer = useRef<ModelViewerElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [arMessage, setArMessage] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [qr, setQR] = useState('')
  const [qrError, setQRError] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareURL = `${window.location.origin}/modellemeler?model=${model.id}`
  const dialogTitle = `phone-title-${model.id}`

  useEffect(()=>{
    const element = viewer.current
    if (!element) return
    setReady(false); setError(''); setArMessage('')
    const loaded = ()=>setReady(true)
    const failed = ()=>setError('3D model yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.')
    const arStatus = (event: Event)=>{
      const status = (event as CustomEvent<{status: string}>).detail.status
      setArMessage(status === 'failed'
        ? 'AR başlatılamadı. Kamera iznini ve cihazınızın AR desteğini kontrol edin. iPhone’da Safari, Android’de Chrome ile açın.'
        : status === 'session-started'
          ? 'Telefonu yavaşça hareket ettirerek zemini tarayın.'
          : status === 'object-placed'
            ? model.placementNote || `${model.name} gerçek ölçüsüyle alanınıza yerleştirildi.`
            : '')
    }
    element.addEventListener('load', loaded)
    element.addEventListener('error', failed)
    element.addEventListener('ar-status', arStatus)
    if (element.loaded) loaded()
    return ()=>{element.removeEventListener('load', loaded);element.removeEventListener('error', failed);element.removeEventListener('ar-status', arStatus)}
  },[attempt, model])

  useEffect(()=>{
    let active=true
    QRCode.toDataURL(shareURL,{width:256,margin:2,color:{dark:'#202b20',light:'#ffffff'}}).then(value=>{if(active)setQR(value)}).catch(()=>{if(active)setQRError(true)})
    return ()=>{active=false}
  },[shareURL])

  function showPhone(){setCopied(false);setCopyError(false);dialog.current?.showModal()}
  function openAR(){
    const element=viewer.current
    if(!element || !ready)return
    setArMessage('')
    if(!element.canActivateAR){showPhone();return}
    // Keep activation inside the click gesture for Safari Quick Look and WebXR.
    void element.activateAR().catch(()=>setArMessage('AR açılamadı. Kamera iznini kontrol edin ve desteklenen bir telefonda tekrar deneyin.'))
  }
  async function copyLink(){
    try{await navigator.clipboard.writeText(shareURL);setCopied(true);setCopyError(false)}catch{setCopied(false);setCopyError(true)}
  }

  return <article className={`model-card${model.theme ? ` model-card-${model.theme}` : ''}`} id={model.id} aria-labelledby={`model-title-${model.id}`}>
    <div className="model-stage">
      <span className="model-category"><CubeIcon/> {model.category}</span>
      <model-viewer key={attempt} ref={viewer} src={`${model.asset}/${model.file}.glb`} ios-src={`${model.asset}/${model.file}.usdz`} poster={`${model.asset}/poster.webp`} alt={model.alt} ar ar-modes={model.arModes || 'webxr scene-viewer quick-look'} ar-scale="fixed" xr-environment ar-placement="floor" camera-controls touch-action="pan-y" shadow-intensity={model.theme === 'gold' ? '0' : '1'} shadow-softness="1" environment-image={model.environment} skybox-image={model.skybox} exposure={model.exposure || '1'} camera-orbit={model.cameraOrbit} field-of-view="30deg" loading={eager ? 'eager' : 'lazy'} reveal="auto" interaction-prompt="auto">
        <span slot="ar-button" hidden/>
        <button slot="ar-failure" className="ar-failure" onClick={showPhone}>AR açılamadı · Telefonda aç</button>
      </model-viewer>
      {!ready&&!error&&<span className="model-loading" role="status"><span className="loading-dot"/> 3D model hazırlanıyor…</span>}
      {error&&<div className="model-error" role="alert"><p>{error}</p><button onClick={()=>setAttempt(value=>value+1)}>Yeniden dene</button></div>}
      <div className="model-stage-footer"><span>↔ Sürükle, döndür ve yakınlaştır</span><span className="model-signature">BalanceBey <b>3D</b></span></div>
    </div>
    <div className="model-details">
      <p className="model-number">KOLEKSİYON / {String(index + 1).padStart(3, '0')}</p>
      <h3 id={`model-title-${model.id}`}>{model.name}</h3>
      <p className="model-description">{model.description}</p>
      <div className="model-formats" aria-label="Mevcut model formatları"><span><CubeIcon/> GLB <small>Web & Android</small></span><span><ARIcon/> USDZ <small>iPhone & iPad</small></span></div>
      <dl className={`model-dimensions${model.dimensions.length === 2 ? ' model-dimensions-two' : ''}`}>{model.dimensions.map(dimension=><div key={dimension.label}><dt>{dimension.label}</dt><dd>{dimension.value} <span>{dimension.unit}</span></dd></div>)}</dl>
      <p className="dimension-note">Model ölçüleri referans görselden tahmin edilmiştir.</p>
      <button className="model-ar-button" aria-label={`${model.name}: AR ile gör`} onClick={openAR} disabled={!ready||!!error}><ARIcon/> AR ile gör <span aria-hidden="true">↗</span></button>
      <p className="ar-helper">Desteklenen telefonda kameranızla, gerçek ölçekte. Bilgisayarda QR kod ile telefonunuza geçin.</p>
      {model.placementNote&&<p className="model-placement-note">{model.placementNote}</p>}
      <button className="phone-link" aria-label={`${model.name}: Telefonda aç`} onClick={showPhone}>Telefonda aç <span aria-hidden="true">↗</span></button>
      {arMessage&&<p className="ar-message" role="status">{arMessage}</p>}
    </div>
    <dialog ref={dialog} className="phone-dialog" aria-labelledby={dialogTitle} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}}>
      <button className="dialog-close" aria-label="Kapat" onClick={()=>dialog.current?.close()}>×</button>
      <p className="eyebrow">MEKÂNINDA DENE</p><h2 id={dialogTitle}>Telefonunda aç.</h2>
      <p className="phone-model-name">{model.name}</p>
      <p>Kameranla QR kodu okut. Açılan sayfada <strong>AR ile gör</strong> düğmesine dokun.</p>
      {qr?<img className="model-qr" src={qr} alt={`${model.name} sayfasını telefonda açmak için QR kod`} width="256" height="256"/>:<p role="status">{qrError?'QR kod oluşturulamadı. Aşağıdaki bağlantıyı kullanabilirsiniz.':'QR kod hazırlanıyor…'}</p>}
      <button className="copy-model-link" onClick={copyLink}>{copied?'Bağlantı kopyalandı ✓':'Bağlantıyı kopyala'}</button>
      {copyError&&<p role="status">Bağlantı kopyalanamadı. Aşağıdaki bağlantıyı kullanabilirsiniz.</p>}
      <a className="model-share-url" href={shareURL}>{shareURL}</a>
      <p className="phone-requirements">iPhone / iPad: Safari ve AR Quick Look.<br/>Android: {model.arModes ? 'WebXR destekli Chrome ve AR destekli cihaz.' : 'Chrome ve AR destekli cihaz.'}<br/>Kamera izni gerekir; modeli yerleştirirken zemini tarayın.{model.placementNote&&<><br/>{model.placementNote}</>}</p>
    </dialog>
  </article>
}

export function Models(){
  const [searchParams] = useSearchParams()
  const selectedModel = searchParams.get('model')

  useEffect(()=>{
    const previous = document.title
    document.title = 'Modellemeler · BalanceBey 3D Studio'
    return ()=>{document.title = previous}
  },[])

  useEffect(()=>{
    if (!selectedModel || !models.some(model=>model.id === selectedModel)) return
    let cancelled = false
    let frame = 0
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const scrollToModel = ()=>{
      if (cancelled) return
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(()=>document.getElementById(selectedModel)?.scrollIntoView({block: 'start'}))
    }
    scrollToModel()
    void document.fonts.ready.then(scrollToModel)
    return ()=>{cancelled=true;window.cancelAnimationFrame(frame);window.history.scrollRestoration=previousRestoration}
  },[selectedModel])

  return <main className="models-page">
    <section className="models-intro">
      <div><p className="eyebrow">BALANCEBEY / MODELLEMELER</p><h1>Tasarımı keşfet.<br/><em>Alanında gör.</em></h1><p className="models-lead">Her açıdan incele. Gerçek ölçüleriyle odana yerleştir.<br className="desktop-break"/> Koleksiyonumuz, artık bulunduğun yerde.</p></div>
      <div className="collection-note"><span className="collection-symbol"><CubeIcon/></span><span><strong>3D model koleksiyonu</strong><small>Web’de keşfet · Mobilde AR ile gör</small></span></div>
    </section>
    <div className="collection-heading"><h2>Modellemeler <span>{String(models.length).padStart(2, '0')}</span></h2><span className="collection-availability"><i/> Etkileşimli görüntüleme</span></div>
    <section className="model-collection" aria-label="3D modeller">
      {models.map((model,index)=><ModelCard key={model.id} model={model} index={index} eager={selectedModel ? model.id === selectedModel : index === 0}/>)}
    </section>
    <section className="models-how" aria-label="Nasıl kullanılır"><div><span>01</span><h3>Modeli incele</h3><p>Sürükleyerek döndür, yakınlaştır ve detaylara bak.</p></div><div><span>02</span><h3>AR ile gör</h3><p>Telefonunda aç, kameraya izin ver ve zemini tara.</p></div><div><span>03</span><h3>Alanına yerleştir</h3><p>Modeli odanda gerçek ölçüsüyle gör, yerini değiştir.</p></div></section>
    <div className="models-request"><span>Sizin ürününüz de burada hayat bulsun.</span><Link to="/">Model talebi oluştur <span aria-hidden="true">↗</span></Link></div>
  </main>
}
