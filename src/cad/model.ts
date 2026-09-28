export type SketchPlane = 'XY' | 'XZ' | 'YZ'
export type Point2 = { x: number; y: number }
export type SketchEntity =
  | { id: string; kind: 'line'; start: Point2; end: Point2 }
  | { id: string; kind: 'rectangle'; start: Point2; end: Point2 }
  | { id: string; kind: 'circle'; center: Point2; radius: number }

export type FeatureKind = 'sketch' | 'extrude' | 'revolve' | 'sweep' | 'loft' | 'boolean' | 'fillet' | 'chamfer'
type FeatureBase = { id: string; name: string; kind: FeatureKind; visible: boolean }
export type SketchFeature = FeatureBase & { kind: 'sketch'; plane: SketchPlane; entities: SketchEntity[] }
export type ExtrudeFeature = FeatureBase & { kind: 'extrude'; sketchId: string; distanceMm: number }
export type FutureFeature = FeatureBase & { kind: Exclude<FeatureKind, 'sketch' | 'extrude'>; inputs: string[]; parameters: Record<string, number | string | boolean>; enabled: false }
export type CadFeature = SketchFeature | ExtrudeFeature | FutureFeature
export type CadDocument = { schemaVersion: 1; id: string; name: string; units: 'mm'; features: CadFeature[]; createdAt: string; updatedAt: string }

export const newId = () => crypto.randomUUID()
export const createDocument = (): CadDocument => ({ schemaVersion: 1, id: newId(), name: 'Yeni CAD modeli', units: 'mm', features: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
export const isSketch = (feature: CadFeature): feature is SketchFeature => feature.kind === 'sketch'
export const isExtrude = (feature: CadFeature): feature is ExtrudeFeature => feature.kind === 'extrude'

export function validateDocument(value: unknown): value is CadDocument {
  if (!value || typeof value !== 'object') return false
  const doc = value as Partial<CadDocument>
  if (doc.schemaVersion !== 1 || doc.units !== 'mm' || typeof doc.id !== 'string' || typeof doc.name !== 'string' || !Array.isArray(doc.features)) return false
  const point = (value: unknown): value is Point2 => !!value && typeof value === 'object' && Number.isFinite((value as Point2).x) && Number.isFinite((value as Point2).y)
  return doc.features.every(feature => {
    if (!feature || typeof feature.id !== 'string' || typeof feature.name !== 'string' || typeof feature.visible !== 'boolean') return false
    if (feature.kind === 'sketch') return ['XY', 'XZ', 'YZ'].includes(feature.plane) && Array.isArray(feature.entities) && feature.entities.every(entity => {
      if (!entity || typeof entity.id !== 'string') return false
      if (entity.kind === 'circle') return point(entity.center) && Number.isFinite(entity.radius) && entity.radius > 0
      return (entity.kind === 'line' || entity.kind === 'rectangle') && point(entity.start) && point(entity.end)
    })
    if (feature.kind === 'extrude') return typeof feature.sketchId === 'string' && Number.isFinite(feature.distanceMm) && feature.distanceMm > 0
    return ['revolve', 'sweep', 'loft', 'boolean', 'fillet', 'chamfer'].includes(feature.kind) && Array.isArray(feature.inputs) && !!feature.parameters && typeof feature.parameters === 'object' && feature.enabled === false
  })
}

export function withFeatures(doc: CadDocument, features: CadFeature[]): CadDocument {
  return { ...doc, features, updatedAt: new Date().toISOString() }
}
