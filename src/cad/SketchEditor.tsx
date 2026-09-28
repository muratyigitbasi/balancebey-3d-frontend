import { useState, type PointerEvent } from 'react'
import { newId, type Point2, type SketchEntity, type SketchFeature } from './model'

type Tool = 'line' | 'rectangle' | 'circle'
type Props = { sketch: SketchFeature; onChange: (entities: SketchEntity[]) => void }

export function SketchEditor({ sketch, onChange }: Props) {
  const [tool, setTool] = useState<Tool>('rectangle')
  const [start, setStart] = useState<Point2 | null>(null)
  const [cursor, setCursor] = useState<Point2 | null>(null)
  const coordinates = (event: PointerEvent<SVGSVGElement>): Point2 => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: Math.round((event.clientX - rect.left) / rect.width * 600), y: Math.round((event.clientY - rect.top) / rect.height * 400) }
  }
  const addPoint = (event: PointerEvent<SVGSVGElement>) => {
    const next = coordinates(event)
    if (!start) { setStart(next); return }
    if (Math.hypot(next.x - start.x, next.y - start.y) < 1) return
    const entity: SketchEntity = tool === 'circle'
      ? { id: newId(), kind: 'circle', center: start, radius: Math.hypot(next.x - start.x, next.y - start.y) }
      : { id: newId(), kind: tool, start, end: next }
    onChange([...sketch.entities, entity])
    setStart(null)
  }
  const preview = start && cursor ? tool === 'circle'
    ? <circle cx={start.x} cy={start.y} r={Math.hypot(cursor.x - start.x, cursor.y - start.y)} />
    : tool === 'rectangle'
      ? <rect x={Math.min(start.x, cursor.x)} y={Math.min(start.y, cursor.y)} width={Math.abs(cursor.x - start.x)} height={Math.abs(cursor.y - start.y)} />
      : <line x1={start.x} y1={start.y} x2={cursor.x} y2={cursor.y} /> : null
  return <section className="cad-sketch-editor" aria-label="Sketch editörü">
    <div className="cad-sketch-tools">
      {(['line', 'rectangle', 'circle'] as Tool[]).map(value => <button key={value} type="button" className={tool === value ? 'active' : ''} onClick={() => { setTool(value); setStart(null) }}>{value === 'line' ? 'Çizgi' : value === 'rectangle' ? 'Dikdörtgen' : 'Daire'}</button>)}
      <button type="button" className="cad-text-button" onClick={() => { onChange(sketch.entities.slice(0, -1)); setStart(null) }} disabled={!sketch.entities.length}>Son çizimi sil</button>
    </div>
    <svg viewBox="0 0 600 400" preserveAspectRatio="none" onPointerMove={event => setCursor(coordinates(event))} onPointerDown={addPoint} onPointerLeave={() => setCursor(null)} className="cad-sketch-canvas" role="img" aria-label={`${sketch.plane} düzleminde 600 × 400 mm çizim alanı`}>
      <defs><pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d8dfd2" strokeWidth="1" /></pattern></defs>
      <rect width="600" height="400" fill="url(#cad-grid)" />
      {sketch.entities.map(entity => entity.kind === 'circle'
        ? <circle key={entity.id} cx={entity.center.x} cy={entity.center.y} r={entity.radius} />
        : entity.kind === 'rectangle'
          ? <rect key={entity.id} x={Math.min(entity.start.x, entity.end.x)} y={Math.min(entity.start.y, entity.end.y)} width={Math.abs(entity.start.x - entity.end.x)} height={Math.abs(entity.start.y - entity.end.y)} />
          : <line key={entity.id} x1={entity.start.x} y1={entity.start.y} x2={entity.end.x} y2={entity.end.y} />)}
      <g className="cad-sketch-preview">{preview}</g>
      {start && <circle className="cad-sketch-start" cx={start.x} cy={start.y} r="4" />}
    </svg>
    <p>İki nokta seçerek çizin. Ölçüler mm cinsindedir. Extrusion için dikdörtgen veya kapalı çizgi profili kullanın.</p>
  </section>
}
