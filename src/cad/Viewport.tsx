import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function Viewport({ modelUrl }: { modelUrl: string | null }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    const element = host.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#edf1e9')
    const camera = new THREE.PerspectiveCamera(48, 1, 0.001, 100)
    camera.position.set(1.3, 1.2, 1.4)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    element.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    scene.add(new THREE.HemisphereLight('#ffffff', '#a0ad95', 2))
    const light = new THREE.DirectionalLight('#ffffff', 2.2)
    light.position.set(2, 3, 4)
    scene.add(light)
    const grid = new THREE.GridHelper(2, 20, '#9bac91', '#ccd6c7')
    grid.rotation.x = Math.PI / 2
    scene.add(grid)
    const resize = () => { const { width, height } = element.getBoundingClientRect(); if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height) }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    resize()
    let frame = 0
    let disposed = false
    let loaded: THREE.Object3D | null = null
    if (modelUrl) new GLTFLoader().load(modelUrl, gltf => {
      if (disposed) return
      loaded = gltf.scene
      scene.add(loaded)
      const box = new THREE.Box3().setFromObject(loaded)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3()).length()
      controls.target.copy(center)
      camera.position.copy(center).add(new THREE.Vector3(size, size, size).multiplyScalar(1.3))
      controls.update()
    })
    const render = () => { frame = requestAnimationFrame(render); controls.update(); renderer.render(scene, camera) }
    render()
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); if (loaded) scene.remove(loaded); renderer.dispose(); renderer.domElement.remove() }
  }, [modelUrl])
  return <div className="cad-viewport" ref={host}><span className="cad-view-label">3D görünüm · metre ölçeği</span></div>
}
