import { createContext, useCallback, useContext, useState } from 'react'

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [page, setPage] = useState('home')

  const goTo = useCallback((id) => {
    setPage(id)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <NavigationContext.Provider value={{ page, goTo }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider')
  return ctx
}
