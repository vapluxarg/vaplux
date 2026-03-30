import { createContext, useContext, useState, useEffect } from 'react'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [globalStore, setGlobalStore] = useState('vaplux')

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('adminStore')
    if (saved) setGlobalStore(saved)
  }, [])

  const changeStore = (newStore) => {
    setGlobalStore(newStore)
    localStorage.setItem('adminStore', newStore)
  }

  return (
    <AdminContext.Provider value={{ globalStore, setGlobalStore: changeStore }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
