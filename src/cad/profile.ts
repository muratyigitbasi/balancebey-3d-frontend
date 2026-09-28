import type { Point2, SketchFeature } from './model'

export type SketchProfiles = { polygons: Point2[][]; circles: { center: Point2; radius: number }[]; openLines: number }

export function collectProfiles(sketch: SketchFeature): SketchProfiles {
  const polygons: Point2[][] = []
  const circles: SketchProfiles['circles'] = []
  for (const entity of sketch.entities) {
    if (entity.kind === 'circle') {
      if (entity.radius > 0) circles.push({ center: entity.center, radius: entity.radius })
    } else if (entity.kind === 'rectangle') {
      const { start: a, end: b } = entity
      if (Math.abs(a.x - b.x) <= 0.01 || Math.abs(a.y - b.y) <= 0.01) continue
      polygons.push([a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }])
    }
  }
  const lines = sketch.entities.filter(entity => entity.kind === 'line')
  const near = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.y - b.y) < 3
  let chain: typeof lines = []
  let openLines = 0
  for (const line of lines) {
    if (chain.length && !near(chain[chain.length - 1].end, line.start)) { openLines += chain.length; chain = [] }
    chain.push(line)
    if (chain.length >= 3 && near(line.end, chain[0].start)) {
      polygons.push(chain.map(segment => segment.start))
      chain = []
    }
  }
  return { polygons, circles, openLines: openLines + chain.length }
}

export function profilePoints(sketch: SketchFeature): Point2[] {
  const { polygons } = collectProfiles(sketch)
  if (!polygons.length && sketch.entities.some(entity => entity.kind === 'rectangle')) throw new Error('Dikdörtgenin genişliği ve yüksekliği sıfırdan büyük olmalı.')
  if (!polygons.length) throw new Error('Extrusion için kapalı bir dikdörtgen veya uçları birleşen çizgiler çizin.')
  return polygons[0]
}
