import { useEffect, useReducer, useRef, useState } from 'react'
import { downloadDocument, historyReducer, initialHistory, saveDraft } from '../cad/history'
import { openCascadeKernel } from '../cad/kernel'
import { isExtrude, isSketch, newId, validateDocument, withFeatures, type CadFeature, type SketchPlane } from '../cad/model'
import { SketchEditor } from '../cad/SketchEditor'
import { Viewport } from '../cad/Viewport'
import '../cad/workspace.css'

const FUTURE = ['revolve', 'sweep', 'loft', 'boolean', 'fillet', 'chamfer'] as const
export function CadWorkspace() {
  const [history, dispatch] = useReducer(historyReducer, undefined, initialHistory)
  const doc = history.present
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<'sketch' | '3d'>('3d')
  const [plane, setPlane] = useState<SketchPlane>('XY')
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [status, setStatus] = useState('Sketch oluşturarak başlayın.')
  const [arOpen, setArOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const selected = doc.features.find(feature => feature.id === selectedId)
  const sketch = selected && isSketch(selected) ? selected : null
  const latestSketch = [...doc.features].reverse().find(isSketch)
  const apply = (features: CadFeature[]) => dispatch({ type: 'apply', document: withFeatures(doc, features) })
  const update = (feature: CadFeature) => apply(doc.features.map(item => item.id === feature.id ? feature : item))

  useEffect(() => { saveDraft(doc) }, [doc])
  useEffect(() => {
    let cancelled = false
    let currentUrl: string | null = null
    if (!doc.features.some(isExtrude)) { setModelUrl(null); return }
    setModelUrl(null)
    setStatus('OpenCascade modeli hesaplıyor…')
    openCascadeKernel.build(doc).then(blob => {
      if (cancelled) return
      if (blob) { currentUrl = URL.createObjectURL(blob); setModelUrl(currentUrl); setStatus('Katı model hazır.') }
      else { setModelUrl(null); setStatus('Görünür katı model yok.') }
    }).catch(error => { if (!cancelled) { setModelUrl(null); setStatus(error instanceof Error ? error.message : 'Model oluşturulamadı.') } })
    return () => { cancelled = true; if (currentUrl) URL.revokeObjectURL(currentUrl) }
  }, [doc])

  const addSketch = () => {
    const feature: CadFeature = { id: newId(), kind: 'sketch', name: `Sketch ${doc.features.filter(isSketch).length + 1}`, plane, entities: [], visible: true }
    apply([...doc.features, feature]); setSelectedId(feature.id); setMode('sketch')
  }
  const addExtrude = () => {
    if (!latestSketch) { setStatus('Önce bir sketch oluşturun.'); return }
    const feature: CadFeature = { id: newId(), kind: 'extrude', name: `Extrusion ${doc.features.filter(isExtrude).length + 1}`, sketchId: latestSketch.id, distanceMm: 50, visible: true }
    apply([...doc.features, feature]); setSelectedId(feature.id); setMode('3d')
  }
  const importJson = async (file?: File) => {
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!validateDocument(parsed)) throw new Error('Geçersiz veya desteklenmeyen CAD dokümanı.')
      dispatch({ type: 'load', document: parsed }); setSelectedId(null); setMode('3d'); setStatus('Doküman açıldı.')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Dosya açılamadı.') }
  }
  const exportGlb = () => {
    if (!modelUrl) return
    const link = document.createElement('a'); link.href = modelUrl; link.download = `${doc.name || 'model'}.glb`; link.click()
  }

  return <main className="cad-workspace">
    <div className="cad-heading"><div><p className="eyebrow">BALANCEBEY 3D STUDIO / CAD</p><h1>CAD çalışma alanı</h1><p>Ölçülü çizimden tarayıcıda katı model ve AR çıktısı.</p></div><div className="cad-document-actions"><button className="secondary" onClick={() => dispatch({ type: 'undo' })} disabled={!history.past.length}>Geri al</button><button className="secondary" onClick={() => dispatch({ type: 'redo' })} disabled={!history.future.length}>İleri al</button><button className="secondary" onClick={() => downloadDocument(doc)}>JSON indir</button><button className="secondary" onClick={() => fileInput.current?.click()}>JSON aç</button><input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={event => { void importJson(event.target.files?.[0]); event.target.value = '' }} /></div></div>
    <div className="cad-toolbar"><label>Düzlem <select value={plane} onChange={event => setPlane(event.target.value as SketchPlane)}><option>XY</option><option>XZ</option><option>YZ</option></select></label><button onClick={addSketch}>+ Sketch</button><button onClick={addExtrude}>+ Extrude</button><span className="cad-toolbar-divider" />{FUTURE.map(kind => <button key={kind} className="cad-future" title="Parametrik feature altyapısında tanımlı; geometri işlemi sonraki aşamada" disabled>{kind}</button>)}</div>
    <div className="cad-layout"><aside className="cad-panel cad-tree"><div className="cad-panel-heading"><h2>Feature tree</h2><span>{doc.features.length}</span></div><p className="cad-tree-root">▣ {doc.name}</p>{doc.features.length ? <ol>{doc.features.map((feature, index) => <li key={feature.id}><button className={selectedId === feature.id ? 'selected' : ''} onClick={() => { setSelectedId(feature.id); setMode(isSketch(feature) ? 'sketch' : '3d') }}><span className="cad-feature-icon">{isSketch(feature) ? '◇' : isExtrude(feature) ? '▰' : '○'}</span><span><strong>{feature.name}</strong><small>{index + 1} · {feature.kind}</small></span></button></li>)}</ol> : <p className="cad-empty-tree">Henüz feature yok. Sketch ekleyin.</p>}</aside>
      <section className="cad-center"><div className="cad-center-tabs"><button className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}>3D viewport</button><button className={mode === 'sketch' ? 'active' : ''} onClick={() => setMode('sketch')} disabled={!sketch}>Sketch editor</button><span>{status}</span></div>{mode === 'sketch' && sketch ? <SketchEditor sketch={sketch} onChange={entities => update({ ...sketch, entities })} /> : <Viewport modelUrl={modelUrl} />}<div className="cad-export"><span>Model birimi: mm · AR çıktısı: m</span><div><button className="secondary" onClick={exportGlb} disabled={!modelUrl}>GLB indir</button><button onClick={() => setArOpen(true)} disabled={!modelUrl}>AR önizleme</button></div></div></section>
      <aside className="cad-panel cad-properties"><div className="cad-panel-heading"><h2>Özellikler</h2></div>{selected ? <><label>Ad<input value={selected.name} onChange={event => update({ ...selected, name: event.target.value } as CadFeature)} /></label>{isSketch(selected) && <><label>Düzlem<select value={selected.plane} onChange={event => update({ ...selected, plane: event.target.value as SketchPlane })}><option>XY</option><option>XZ</option><option>YZ</option></select></label><p>{selected.entities.length} çizim öğesi</p><button className="secondary" onClick={() => setMode('sketch')}>Çizimi düzenle</button></>}{isExtrude(selected) && <><label>Profil<select value={selected.sketchId} onChange={event => update({ ...selected, sketchId: event.target.value })}>{doc.features.filter(isSketch).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Mesafe (mm)<input type="number" min="0.1" step="1" value={selected.distanceMm} onChange={event => update({ ...selected, distanceMm: Number(event.target.value) })} /></label><label className="cad-checkbox"><input type="checkbox" checked={selected.visible} onChange={event => update({ ...selected, visible: event.target.checked })} /> Görünür</label></>}<button className="cad-delete" onClick={() => { apply(doc.features.filter(item => item.id !== selected.id && !(isSketch(selected) && isExtrude(item) && item.sketchId === selected.id))); setSelectedId(null) }}>Feature sil</button></> : <p>Bir feature seçerek parametrelerini düzenleyin.</p>}</aside></div>
    {arOpen && modelUrl && <div className="cad-modal-backdrop" onClick={() => setArOpen(false)}><div className="cad-ar-modal" role="dialog" aria-modal="true" aria-label="AR önizleme" onClick={event => event.stopPropagation()}><button className="cad-modal-close" onClick={() => setArOpen(false)}>Kapat</button><h2>AR önizleme</h2><p>Destekleyen cihazlarda modeli gerçek ölçekte yerleştirin.</p><model-viewer src={modelUrl} camera-controls ar ar-modes="webxr scene-viewer" shadow-intensity="1" /><p>Bu yerel taslak için AR bağlantısı yalnız bu cihazda geçerlidir. Paylaşım için GLB dosyasını sunucuya yüklemek gerekir.</p></div></div>}
  </main>
}
