'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { AdminPage } from '@/components/admin/core'

interface SettingsData {
  site_name: Record<string, string>
  seo_description: Record<string, string>
  contact_email: string
  contact_whatsapp: string
  enabled_languages: string[]
  enable_chinese: boolean
  enable_chinese_by_ip: boolean
}

export default function SettingsPage() {
  const t = useAdminTranslations()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    site_name: { en: 'SeekDrone' },
    seo_description: { en: '' },
    contact_email: 'sales@seekdrn.com',
    contact_whatsapp: '',
    enabled_languages: ['en', 'ar', 'es', 'fr', 'pt', 'id'],
    enable_chinese: false,
    enable_chinese_by_ip: false,
  })
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (data) {
        setSettings(data)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [supabase])

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1)

      if (error) throw error
      alert(t('settingsSaved'))
    } catch (error) {
      console.error('Save error:', error)
      alert(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>{t('loading')}</div>

  return (
    <AdminPage
      title="settings_page.title"
      actions={
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      }
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings_page.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('settings_page.siteName')}</Label>
              <Input
                value={settings.site_name?.en || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  site_name: { ...settings.site_name, en: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>{t('settings_page.contactEmail')}</Label>
              <Input
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('settings_page.whatsapp')}</Label>
              <Input
                value={settings.contact_whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings_page.languageSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enable_chinese}
                onCheckedChange={(v) => setSettings({ ...settings, enable_chinese: v })}
              />
              <Label>{t('settings_page.enableChinese')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enable_chinese_by_ip}
                onCheckedChange={(v) => setSettings({ ...settings, enable_chinese_by_ip: v })}
              />
              <Label>{t('settings_page.autoDetectChinese')}</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  )
}
