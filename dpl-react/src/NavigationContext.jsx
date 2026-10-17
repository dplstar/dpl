// import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// const NavigationContext = createContext(null)

// // Space for the sticky nav when jumping to a section
// const ANCHOR_OFFSET = 80

// export function NavigationProvider({ children }) {
//   const [page, setPage] = useState('home')
//   // `n` changes on every call, so jumping to the same section twice still scrolls
//   const [jump, setJump] = useState({ anchor: null, n: 0 })
//   const anchor = jump.anchor

//   // goTo('pipes') opens a page at the top; goTo('pipes', 'is-1239') opens it at that section.
//   const goTo = useCallback((id, target = null) => {
//     setPage(id)
//     setJump((j) => ({ anchor: target, n: j.n + 1 }))
//     window.scrollTo({ top: 0, behavior: 'auto' })
//   }, [])

//   useEffect(() => {
//     if (!anchor) return undefined
//     // wait a frame so the newly shown page has laid out
//     const frame = requestAnimationFrame(() => {
//       const el = document.getElementById(anchor)
//       if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET, behavior: 'auto' })
//     })
//     return () => cancelAnimationFrame(frame)
//   }, [page, jump, anchor])

//   return (
//     <NavigationContext.Provider value={{ page, goTo, anchor }}>
//       {children}
//     </NavigationContext.Provider>
//   )
// }

// export function useNavigation() {
//   const ctx = useContext(NavigationContext)
//   if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider')
//   return ctx
// }









import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const NavigationContext = createContext(null)

const ANCHOR_OFFSET = 80

// Map your internal page IDs to browser URLs
const routes = {
  home: '/',
  about: '/about',
  products: '/products',
  catalogue: '/catalogue',
  zincalume: '/zincalume',
  pipes: '/pipes',
  // gi: '/gi-tanks',
  'colour-bonded': '/colour-bonded',
  'fusion-bond': '/fusion-bond',
  'glass-fused': '/glass-fused',
  'channel-partner': '/channel-partner',
  contact: '/contact',
  privacy: '/privacy-policy',
  'terms-of-use': '/terms-of-use',
}

// Find the page from the current browser URL
function getPageFromPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  const page = Object.entries(routes).find(
    ([, route]) => route === path
  )

  return page ? page[0] : 'home'
}

export function NavigationProvider({ children }) {
  // Initialize from the URL, not always from Home
  const [page, setPage] = useState(getPageFromPath)

  // Restore a section anchor if the URL contains one
  const [jump, setJump] = useState(() => ({
    anchor: window.location.hash.slice(1) || null,
    n: 0,
  }))

  const anchor = jump.anchor

  const goTo = useCallback((id, target = null) => {
    const path = routes[id]

    if (!path) {
      console.warn(`Unknown navigation page: ${id}`)
      return
    }

    // Update the browser URL without reloading the React app
    const url = target
      ? `${path}#${encodeURIComponent(target)}`
      : path

    window.history.pushState({}, '', url)

    setPage(id)
    setJump((j) => ({
      anchor: target,
      n: j.n + 1,
    }))

    if (!target) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [])

  // Handle browser Back/Forward buttons
  useEffect(() => {
    function handlePopState() {
      setPage(getPageFromPath())

      setJump((j) => ({
        anchor: window.location.hash.slice(1) || null,
        n: j.n + 1,
      }))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Scroll to the requested section after its page becomes visible
  useEffect(() => {
    if (!anchor) return

    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(anchor)

      if (el) {
        window.scrollTo({
          top:
            el.getBoundingClientRect().top +
            window.scrollY -
            ANCHOR_OFFSET,
          behavior: 'auto',
        })
      }
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

  if (!ctx) {
    throw new Error(
      'useNavigation must be used within a NavigationProvider'
    )
  }

  return ctx
}
