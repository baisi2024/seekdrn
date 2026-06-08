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
import { MultilingualInput } from '@/features/products/components/admin/multilingual-input'

interface TrustBarStat {
  label: Record<string, string>
  value: string
}

interface HeroConfig {
  title: Record<string, string>
  subtitle: Record<string, string>
  cta_text: Record<string, string>
  cta_link: string
  background_image: string
}

interface TrustBarConfig {
  stats?: TrustBarStat[]
}

interface CtaConfig {
  title: Record<string, string>
  subtitle: Record<string, string>
  button_text: Record<string, string>
}

interface SeoConfig {
  default_title: Record<string, string>
  default_description: Record<string, string>
  og_image: string
}

interface SettingsData {
  site_name: Record<string, string>
  seo_description: Record<string, string>
  contact_email: string
  contact_whatsapp: string
  enabled_languages: string[]
  enable_chinese: boolean
  enable_chinese_by_ip: boolean
  trust_bar_config?: TrustBarConfig
  cta_config?: CtaConfig
  seo_metadata?: SeoConfig
  hero_config?: HeroConfig
  gtm_id?: string
}

const DEFAULT_HERO_CONFIG: HeroConfig = { title: {}, subtitle: {}, cta_text: {}, cta_link: '', background_image: '' }
const DEFAULT_TRUST_BAR: TrustBarConfig = { stats: [] }
const DEFAULT_CTA: CtaConfig = { title: {}, subtitle: {}, button_text: {} }
const DEFAULT_SEO: SeoConfig = { default_title: {}, default_description: {}, og_image: '' }

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
    hero_config: DEFAULT_HERO_CONFIG,
    gtm_id: '',
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (data) {
        setSettings({
          ...data,
          hero_config: data.hero_config || DEFAULT_HERO_CONFIG,
        })
      }
      setLoading(false)
    }
    loadSettings()
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

  const hero: HeroConfig = settings.hero_config ?? DEFAULT_HERO_CONFIG
  const trustBar: TrustBarConfig = settings.trust_bar_config ?? DEFAULT_TRUST_BAR
  const cta: CtaConfig = settings.cta_config ?? DEFAULT_CTA
  const seo: SeoConfig = settings.seo_metadata ?? DEFAULT_SEO

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
        {/* Hero Config */}
        <Card>
          <CardHeader>
            <CardTitle>{t('settings_page.heroConfig')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label={t('settings_page.heroTitle')}
              value={hero.title || {}}
              onChange={(v) => setSettings({
                ...settings,
                hero_config: { ...hero, title: v }
              })}
            />
            <MultilingualInput
              label={t('settings_page.heroSubtitle')}
              value={hero.subtitle || {}}
              onChange={(v) => setSettings({
                ...settings,
                hero_config: { ...hero, subtitle: v }
              })}
              type="textarea"
            />
            <MultilingualInput
              label={t('settings_page.heroCtaText')}
              value={hero.cta_text || {}}
              onChange={(v) => setSettings({
                ...settings,
                hero_config: { ...hero, cta_text: v }
              })}
            />
            <div>
              <Label>{t('settings_page.heroCtaLink')}</Label>
              <Input
                value={hero.cta_link || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_config: { ...hero, cta_link: e.target.value }
                })}
                placeholder="/contact"
              />
            </div>
            <div>
              <Label>{t('settings_page.heroBackgroundImage')}</Label>
              <Input
                value={hero.background_image || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  hero_config: { ...hero, background_image: e.target.value }
                })}
                placeholder="https://example.com/hero-bg.jpg"
              />
            </div>
          </CardContent>
        </Card>

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

        {/* Trust Bar - Multilingual */}
        <Card>
          <CardHeader>
            <CardTitle>Trust Bar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('settings_page.statItem')} #{i + 1}
                </div>
                <MultilingualInput
                  label={t('settings_page.statLabel')}
                  value={trustBar.stats?.[i]?.label || {}}
                  onChange={(v) => {
                    const stats = [...(trustBar.stats || [])]
                    if (!stats[i]) stats[i] = { label: {}, value: '' }
                    stats[i] = { ...stats[i], label: v }
                    setSettings({ ...settings, trust_bar_config: { stats } })
                  }}
                />
                <div>
                  <Label>{t('settings_page.statValue')}</Label>
                  <Input
                    value={trustBar.stats?.[i]?.value || ''}
                    onChange={(e) => {
                      const stats = [...(trustBar.stats || [])]
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

        {/* CTA Section - Multilingual */}
        <Card>
          <CardHeader>
            <CardTitle>CTA Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label={t('settings_page.ctaTitle')}
              value={cta.title || {}}
              onChange={(v) => setSettings({
                ...settings,
                cta_config: { ...cta, title: v }
              })}
            />
            <MultilingualInput
              label={t('settings_page.ctaSubtitle')}
              value={cta.subtitle || {}}
              onChange={(v) => setSettings({
                ...settings,
                cta_config: { ...cta, subtitle: v }
              })}
              type="textarea"
            />
            <MultilingualInput
              label={t('settings_page.ctaButtonText')}
              value={cta.button_text || {}}
              onChange={(v) => setSettings({
                ...settings,
                cta_config: { ...cta, button_text: v }
              })}
            />
          </CardContent>
        </Card>

        {/* SEO & GTM - Multilingual */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & GTM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultilingualInput
              label={t('settings_page.seoDefaultTitle')}
              value={seo.default_title || {}}
              onChange={(v) => setSettings({
                ...settings,
                seo_metadata: { ...seo, default_title: v }
              })}
            />
            <MultilingualInput
              label={t('settings_page.seoDefaultDescription')}
              value={seo.default_description || {}}
              onChange={(v) => setSettings({
                ...settings,
                seo_metadata: { ...seo, default_description: v }
              })}
              type="textarea"
            />
            <div>
              <Label>OG Image URL</Label>
              <Input
                value={seo.og_image || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  seo_metadata: { ...seo, og_image: e.target.value }
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
