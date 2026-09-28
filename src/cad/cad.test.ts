import { describe, expect, it } from 'vitest'
import { historyReducer } from './history'
import { createDocument, validateDocument, withFeatures, type SketchFeature } from './model'
import { collectProfiles, profilePoints } from './profile'

const sketch: SketchFeature = { id: 's1', name: 'Sketch 1', kind: 'sketch', visible: true, plane: 'XY', entities: [] }

describe('CAD document and feature history', () => {
  it('keeps editable parametric features through undo and redo', () => {
    const empty = createDocument()
    const edited = withFeatures(empty, [sketch])
    const initial = { past: [], present: empty, future: [] }
    const applied = historyReducer(initial, { type: 'apply', document: edited })
    expect(applied.present.features).toHaveLength(1)
    expect(historyReducer(applied, { type: 'undo' }).present.features).toHaveLength(0)
    expect(historyReducer(historyReducer(applied, { type: 'undo' }), { type: 'redo' }).present.features).toHaveLength(1)
    expect(validateDocument(JSON.parse(JSON.stringify(edited)))).toBe(true)
  })

  it('accepts a closed line profile and rejects an open one', () => {
    const lines: SketchFeature['entities'] = [
      { id: '1', kind: 'line', start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
      { id: '2', kind: 'line', start: { x: 100, y: 0 }, end: { x: 100, y: 80 } },
      { id: '3', kind: 'line', start: { x: 100, y: 80 }, end: { x: 0, y: 0 } },
    ]
    expect(profilePoints({ ...sketch, entities: lines })).toHaveLength(3)
    expect(() => profilePoints({ ...sketch, entities: lines.slice(0, 2) })).toThrow(/kapalı/)
  })

  it('rejects a rectangle with no area', () => {
    expect(() => profilePoints({ ...sketch, entities: [{ id: 'r', kind: 'rectangle', start: { x: 10, y: 10 }, end: { x: 10, y: 50 } }] })).toThrow(/sıfırdan/)
  })

  it('collects every closed profile and reports open lines', () => {
    const result = collectProfiles({ ...sketch, entities: [
      { id: 'r1', kind: 'rectangle', start: { x: 0, y: 0 }, end: { x: 50, y: 50 } },
      { id: 'r2', kind: 'rectangle', start: { x: 70, y: 0 }, end: { x: 120, y: 50 } },
      { id: 'c1', kind: 'circle', center: { x: 150, y: 25 }, radius: 20 },
      { id: 'l1', kind: 'line', start: { x: 0, y: 80 }, end: { x: 50, y: 80 } },
    ] })
    expect(result.polygons).toHaveLength(2)
    expect(result.circles).toHaveLength(1)
    expect(result.openLines).toBe(1)
  })

  it('separates consecutive closed line loops', () => {
    const line = (id: string, x1: number, y1: number, x2: number, y2: number) => ({ id, kind: 'line' as const, start: { x: x1, y: y1 }, end: { x: x2, y: y2 } })
    const result = collectProfiles({ ...sketch, entities: [
      line('1', 0, 0, 20, 0), line('2', 20, 0, 20, 20), line('3', 20, 20, 0, 0),
      line('4', 50, 0, 70, 0), line('5', 70, 0, 70, 20), line('6', 70, 20, 50, 0),
    ] })
    expect(result.polygons).toHaveLength(2)
    expect(result.openLines).toBe(0)
  })
})
