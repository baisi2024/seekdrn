'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({
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
    fetchSettings()
  }, [])

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

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1)
      
      if (error) throw error
      alert('Settings saved')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input
                value={settings.site_name?.en || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  site_name: { ...settings.site_name, en: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={settings.contact_whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enable_chinese}
                onCheckedChange={(v) => setSettings({ ...settings, enable_chinese: v })}
              />
              <Label>Enable Chinese</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.enable_chinese_by_ip}
                onCheckedChange={(v) => setSettings({ ...settings, enable_chinese_by_ip: v })}
              />
              <Label>Auto-detect Chinese by IP</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
