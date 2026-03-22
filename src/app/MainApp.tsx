import { useState, useEffect } from 'react'
import type { Shape } from '../components/CanvasStage'
import CanvasStage from '../components/CanvasStage'
import LayersPanel from '../components/LayersPanel'
import PropertiesPanel from '../components/PropertiesPanel'
import Toolbar from '../components/Toolbar'

export default function MainApp() {
  const [history, setHistory] = useState<Shape[][]>([[]])
  const [pointer, setPointer] = useState(0)

  const shapes = history[pointer]

  const commit = (next: Shape[]) => {
    setHistory(prev => {
      const copy = prev.slice(0, pointer + 1)
      copy.push(next)
      return copy
    })
    setPointer(p => p + 1)
  }

  const setShapes = (fn: (prev: Shape[]) => Shape[]) => {
    setHistory(prev => {
      const copy = [...prev]
      copy[pointer] = fn(prev[pointer])
      return copy
    })
  }

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [currentShapeType, setCurrentShapeType] = useState<'rect' | 'circle'>('rect')

  // undo / redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        setPointer(p => Math.max(0, p - 1))
      }
      if (e.ctrlKey && e.key === 'z' && e.shiftKey) {
        setPointer(p => Math.min(history.length - 1, p + 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [history])

  // 防止 undo 后选中失效
  useEffect(() => {
    const ids = new Set(shapes.map(s => s.id))
    setSelectedIds(prev => prev.filter(id => ids.has(id)))
  }, [shapes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar
        currentShapeType={currentShapeType}
        setCurrentShapeType={setCurrentShapeType}
      />
      <div style={{ display: 'flex', flex: 1 }}>
        <LayersPanel
          shapes={shapes}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />

        <CanvasStage
          shapes={shapes}
          setShapes={setShapes}
          commit={commit}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          currentShapeType={currentShapeType}
        />

        <PropertiesPanel
          shapes={shapes}
          selectedIds={selectedIds}
          setShapes={setShapes}
          commit={commit}
        />
      </div>
    </div>
  )
}