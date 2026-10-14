import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const NavigationContext = createContext(null)

// Space for the sticky nav when jumping to a section
const ANCHOR_OFFSET = 80

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')
  // `n` changes on every call, so jumping to the same section twice still scrolls
  const [jump, setJump] = useState({ anchor: null, n: 0 })
  const anchor = jump.anchor

  // goTo('pipes') opens a page at the top; goTo('pipes', 'is-1239') opens it at that section.
  const goTo = useCallback((id, target = null) => {
    setPage(id)
    setJump((j) => ({ anchor: target, n: j.n + 1 }))
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (!anchor) return undefined
    // wait a frame so the newly shown page has laid out
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(anchor)
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET, behavior: 'auto' })
    })
    return () => cancelAnimationFrame(frame)
  }, [page, jump, anchor])

  return (
    <NavigationContext.Provider value={{ page, goTo, anchor }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider')
  return ctx
}
