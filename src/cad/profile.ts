import type { Point2, SketchFeature } from './model'

export function profilePoints(sketch: SketchFeature): Point2[] {
  const rectangle = sketch.entities.find(entity => entity.kind === 'rectangle')
  if (rectangle?.kind === 'rectangle') {
    const { start: a, end: b } = rectangle
    if (Math.abs(a.x - b.x) < 0.01 || Math.abs(a.y - b.y) < 0.01) throw new Error('Dikdörtgenin genişliği ve yüksekliği sıfırdan büyük olmalı.')
    return [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }]
  }
  const lines = sketch.entities.filter(entity => entity.kind === 'line')
  if (lines.length >= 3) {
    const near = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.y - b.y) < 0.01
    const connected = lines.every((line, index) => near(line.end, lines[(index + 1) % lines.length].start))
    if (connected) return lines.map(line => line.start)
  }
  throw new Error('Extrusion için kapalı bir dikdörtgen veya uçları birleşen çizgiler çizin.')
}
