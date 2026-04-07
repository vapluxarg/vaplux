/**
 * CategoriesContext
 * Fetches vaplux categories ONCE on app mount and caches them in memory.
 * Any component (Navbar, etc.) can consume without triggering extra requests.
 *
 * IMPORTANT: useState always initializes with [] so SSR and client produce
 * the same initial HTML (no hydration mismatch). The in-memory cache only
 * skips the network request on subsequent client navigations.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'

const CategoriesContext = createContext([])

// Module-level cache — only used to skip fetch, never for initial render state
let _cachedCategories = null

export function CategoriesProvider({ children }) {
  // Always start with [] — both server and client agree on this
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Already fetched this session — populate from cache without a new request
    if (_cachedCategories) {
      setCategories(_cachedCategories)
      return
    }

    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .eq('store', 'vaplux')
      .order('name')
      .then(({ data }) => {
        if (data) {
          _cachedCategories = data
          setCategories(data)
        }
      })
  }, [])

  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => useContext(CategoriesContext)
