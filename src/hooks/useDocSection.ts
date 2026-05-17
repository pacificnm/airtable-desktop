import { useCallback, useEffect, useState } from 'react'
import type { DocSectionId } from '../content/developerDocs/types.ts'
import { isDocSectionId } from '../content/developerDocs/index.ts'
import { defaultDocSectionId } from '../config/developerDocsNav.ts'

const STORAGE_KEY = 'developerDocs.section'

function readSectionFromHash(): DocSectionId | null {
  const hash = window.location.hash.slice(1)
  return isDocSectionId(hash) ? hash : null
}

function readSectionFromStorage(): DocSectionId | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && isDocSectionId(stored) ? stored : null
  } catch {
    return null
  }
}

function getInitialSection(): DocSectionId {
  return readSectionFromHash() ?? readSectionFromStorage() ?? defaultDocSectionId
}

export function useDocSection() {
  const [sectionId, setSectionId] = useState<DocSectionId>(getInitialSection)

  const selectSection = useCallback((id: DocSectionId) => {
    setSectionId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* ignore quota / private mode */
    }
    const nextHash = `#${id}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = readSectionFromHash()
      if (fromHash) setSectionId(fromHash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${sectionId}`)
    }
  }, [sectionId])

  return { sectionId, selectSection }
}
