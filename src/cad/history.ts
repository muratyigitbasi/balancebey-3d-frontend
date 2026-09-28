import { createDocument, type CadDocument, validateDocument } from './model'

const STORAGE_KEY = 'balancebey-cad-document-v1'
export type CadHistory = { past: CadDocument[]; present: CadDocument; future: CadDocument[] }
export type HistoryAction = { type: 'apply'; document: CadDocument } | { type: 'undo' } | { type: 'redo' } | { type: 'load'; document: CadDocument }

export function initialHistory(): CadHistory {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as unknown
    if (validateDocument(saved)) return { past: [], present: saved, future: [] }
  } catch { /* Ignore corrupt local drafts. */ }
  return { past: [], present: createDocument(), future: [] }
}

export function historyReducer(state: CadHistory, action: HistoryAction): CadHistory {
  switch (action.type) {
    case 'apply': return { past: [...state.past, state.present].slice(-50), present: action.document, future: [] }
    case 'undo': return state.past.length ? { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] } : state
    case 'redo': return state.future.length ? { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) } : state
    case 'load': return { past: [], present: action.document, future: [] }
  }
}

export function saveDraft(doc: CadDocument) { localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)) }
export function downloadDocument(doc: CadDocument) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${doc.name.trim().replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'model'}.cad.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
