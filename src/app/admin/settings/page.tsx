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
  trust_bar_config?: Record<string, any>
  cta_config?: Record<string, any>
  seo_metadata?: Record<string, any>
  gtm_id?: string
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
    trust_bar_config: { stats: [] },
    cta_config: { title: {}, subtitle: {}, button_text: {} },
    seo_metadata: { default_title: {}, default_description: {}, og_image: '' },
    gtm_id: '',
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

        <Card>
          <CardHeader>
            <CardTitle>Trust Bar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-1">
                  <Label>Label EN #{i + 1}</Label>
                  <Input
                    value={(settings.trust_bar_config as any)?.stats?.[i]?.label?.en || ''}
                    onChange={(e) => {
                      const stats = [...((settings.trust_bar_config as any)?.stats || [])]
                      if (!stats[i]) stats[i] = { label: {}, value: '' }
                      stats[i] = { ...stats[i], label: { ...stats[i].label, en: e.target.value } }
                      setSettings({ ...settings, trust_bar_config: { stats } })
                    }}
                  />
                </div>
                <div className="w-32">
                  <Label>Value #{i + 1}</Label>
                  <Input
                    value={(settings.trust_bar_config as any)?.stats?.[i]?.value || ''}
                    onChange={(e) => {
                      const stats = [...((settings.trust_bar_config as any)?.stats || [])]
                      if (!stats[i]) stats[i] = { label: {}, value: '' }
                      stats[i] = { ...stats[i], value: e.target.value }
                      setSettings({ ...settings, trust_bar_config: { stats } })
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTA Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title (EN)</Label>
              <Input
                value={((settings.cta_config as any)?.title?.en) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  cta_config: { ...(settings.cta_config as any), title: { ...((settings.cta_config as any)?.title || {}), en: e.target.value } }
                })}
              />
            </div>
            <div>
              <Label>Subtitle (EN)</Label>
              <Input
                value={((settings.cta_config as any)?.subtitle?.en) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  cta_config: { ...(settings.cta_config as any), subtitle: { ...((settings.cta_config as any)?.subtitle || {}), en: e.target.value } }
                })}
              />
            </div>
            <div>
              <Label>Button Text (EN)</Label>
              <Input
                value={((settings.cta_config as any)?.button_text?.en) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  cta_config: { ...(settings.cta_config as any), button_text: { ...((settings.cta_config as any)?.button_text || {}), en: e.target.value } }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & GTM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Title (EN)</Label>
              <Input
                value={((settings.seo_metadata as any)?.default_title?.en) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo_metadata: { ...(settings.seo_metadata as any), default_title: { ...((settings.seo_metadata as any)?.default_title || {}), en: e.target.value } }
                })}
              />
            </div>
            <div>
              <Label>Default Description (EN)</Label>
              <Input
                value={((settings.seo_metadata as any)?.default_description?.en) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo_metadata: { ...(settings.seo_metadata as any), default_description: { ...((settings.seo_metadata as any)?.default_description || {}), en: e.target.value } }
                })}
              />
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input
                value={((settings.seo_metadata as any)?.og_image) || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo_metadata: { ...(settings.seo_metadata as any), og_image: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>GTM Container ID</Label>
              <Input
                value={settings.gtm_id || ''}
                onChange={(e) => setSettings({ ...settings, gtm_id: e.target.value })}
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  )
}
