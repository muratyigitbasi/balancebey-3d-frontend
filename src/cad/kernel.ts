import type { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js'
import wasmUrl from 'opencascade.js/dist/opencascade.full.wasm?url'
import { isExtrude, isSketch, type CadDocument, type Point2, type SketchFeature } from './model'
import { collectProfiles } from './profile'

export interface CadKernel {
  build(document: CadDocument): Promise<Blob | null>
}

let kernelPromise: Promise<OpenCascadeInstance> | undefined
function openCascade() {
  kernelPromise ??= import('opencascade.js/dist/opencascade.full.js').then(({ default: initialize }) =>
    (initialize as unknown as (options: { locateFile: (path: string) => string }) => Promise<OpenCascadeInstance>)({ locateFile: (path: string) => path.endsWith('.wasm') ? wasmUrl : path })
  )
  return kernelPromise
}

// Millimetres are the document unit. OCCT and glTF receive metres for true-size AR.
const metres = (mm: number) => mm / 1000
function point(oc: OpenCascadeInstance, plane: SketchFeature['plane'], p: Point2) {
  const x = metres(p.x), y = metres(p.y)
  if (plane === 'XZ') return new oc.gp_Pnt_3(x, 0, y)
  if (plane === 'YZ') return new oc.gp_Pnt_3(0, x, y)
  return new oc.gp_Pnt_3(x, y, 0)
}

function makeExtrusions(oc: OpenCascadeInstance, sketch: SketchFeature, distanceMm: number): TopoDS_Shape[] {
  if (!Number.isFinite(distanceMm) || distanceMm <= 0) throw new Error('Extrusion mesafesi sıfırdan büyük olmalı.')
  const profiles = collectProfiles(sketch)
  if (!profiles.polygons.length && !profiles.circles.length) throw new Error('3D için kapalı dikdörtgen, daire veya birleşen çizgiler çizin. Açık çizgiler katı oluşturmaz.')
  const d = metres(distanceMm)
  const vector = sketch.plane === 'XZ' ? new oc.gp_Vec_4(0, d, 0) : sketch.plane === 'YZ' ? new oc.gp_Vec_4(d, 0, 0) : new oc.gp_Vec_4(0, 0, d)
  const direction = sketch.plane === 'XZ' ? new oc.gp_Dir_4(0, 1, 0) : sketch.plane === 'YZ' ? new oc.gp_Dir_4(1, 0, 0) : new oc.gp_Dir_4(0, 0, 1)
  const polygons = profiles.polygons.map(vertices => {
    const polygon = new oc.BRepBuilderAPI_MakePolygon_1()
    vertices.forEach(vertex => polygon.Add_1(point(oc, sketch.plane, vertex)))
    polygon.Close()
    if (!polygon.IsDone()) throw new Error('Sketch profili kapatılamadı.')
    const face = new oc.BRepBuilderAPI_MakeFace_15(polygon.Wire(), true)
    if (!face.IsDone()) throw new Error('Sketch yüzeyi oluşturulamadı.')
    return new oc.BRepPrimAPI_MakePrism_1(face.Face(), vector, true, true).Shape()
  })
  const circles = profiles.circles.map(circle => {
    const axis = new oc.gp_Ax2_3(point(oc, sketch.plane, circle.center), direction)
    return new oc.BRepPrimAPI_MakeCylinder_3(axis, metres(circle.radius), d).Shape()
  })
  return [...polygons, ...circles]
}

let exportSequence = 0
export const openCascadeKernel: CadKernel = {
  async build(document) {
    const extrudes = document.features.filter(isExtrude).filter(feature => feature.visible)
    if (!extrudes.length) return null
    const oc = await openCascade()
    const shapes = extrudes.flatMap(feature => {
      const sketch = document.features.find(item => item.id === feature.sketchId)
      if (!sketch || !isSketch(sketch)) throw new Error(`Extrusion profili bulunamadı: ${feature.name}`)
      return makeExtrusions(oc, sketch, feature.distanceMm)
    })
    const doc = new oc.TDocStd_Document(new oc.TCollection_ExtendedString_1())
    const shapeTool = oc.XCAFDoc_DocumentTool.ShapeTool(doc.Main()).get()
    for (const shape of shapes) {
      shapeTool.SetShape(shapeTool.NewShape(), shape)
      new oc.BRepMesh_IncrementalMesh_2(shape, 0.0005, false, 0.2, false)
    }
    const file = `/cad-${++exportSequence}.glb`
    const writer = new oc.RWGltf_CafWriter(new oc.TCollection_AsciiString_2(file), true)
    const ok = writer.Perform_2(new oc.Handle_TDocStd_Document_2(doc), new oc.TColStd_IndexedDataMapOfStringString_1(), new oc.Message_ProgressRange_1())
    if (!ok) throw new Error('GLB üretilemedi.')
    const bytes = oc.FS.readFile(file, { encoding: 'binary' }) as Uint8Array
    const copy = new Uint8Array(bytes.length)
    copy.set(bytes)
    oc.FS.unlink(file)
    return new Blob([copy], { type: 'model/gltf-binary' })
  },
}
