'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AdminLanguageContextType {
  language: 'en' | 'zh'
  setLanguage: (lang: 'en' | 'zh') => void
}

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  language: 'en',
  setLanguage: () => {}
})

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'zh'>('en')

  // 从 localStorage 恢复语言偏好
  useEffect(() => {
    const saved = localStorage.getItem('admin-language')
    if (saved === 'en' || saved === 'zh') {
      setLanguageState(saved)
    }
  }, [])

  // 设置语言并保存
  const setLanguage = (lang: 'en' | 'zh') => {
    setLanguageState(lang)
    localStorage.setItem('admin-language', lang)
  }

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </AdminLanguageContext.Provider>
  )
}

export const useAdminLanguage = () => useContext(AdminLanguageContext)
