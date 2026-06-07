'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Upload } from 'lucide-react'

interface Download {
  id?: string
  type: 'manual' | 'datasheet' | 'certificate' | 'media'
  title: Record<string, string>
  description: Record<string, string>
  file_url: string
  file_size?: number
  file_type?: string
  language?: string
  sort_order: number
}

interface Props {
  productId: string
  initialDownloads?: Download[]
  onSave: (downloads: Download[]) => Promise<void>
  onUpload: (file: File) => Promise<string>
}

export function DownloadsManager({ productId, initialDownloads = [], onSave, onUpload }: Props) {
  const [downloads, setDownloads] = useState<Download[]>(initialDownloads)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const addDownload = () => {
    const newDownload: Download = {
      type: 'manual',
      title: { en: '', zh: '' },
      description: { en: '', zh: '' },
      file_url: '',
      sort_order: downloads.length
    }
    setDownloads([...downloads, newDownload])
  }

  const deleteDownload = (index: number) => {
    setDownloads(downloads.filter((_, i) => i !== index))
  }

  const updateDownload = (index: number, field: keyof Download, value: any) => {
    setDownloads(downloads.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    ))
  }

  const updateDownloadTranslation = (index: number, field: 'title' | 'description', locale: string, value: string) => {
    setDownloads(downloads.map((d, i) =>
      i === index ? { ...d, [field]: { ...d[field], [locale]: value } } : d
    ))
  }

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(String(index))
    try {
      const url = await onUpload(file)
      updateDownload(index, 'file_url', url)
      updateDownload(index, 'file_size', file.size)
      updateDownload(index, 'file_type', file.type)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(downloads)
      alert('Saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Downloads</h2>
        <Button onClick={addDownload}>
          <Plus className="w-4 h-4 mr-2" />
          Add Download
        </Button>
      </div>

      {downloads.map((download, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Download {index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteDownload(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                value={download.type}
                onChange={(e) => updateDownload(index, 'type', e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="manual">Manual</option>
                <option value="datasheet">Datasheet</option>
                <option value="certificate">Certificate</option>
                <option value="media">Media</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (EN)</Label>
                <Input
                  value={download.title.en || ''}
                  onChange={(e) => updateDownloadTranslation(index, 'title', 'en', e.target.value)}
                />
              </div>
              <div>
                <Label>Title (ZH)</Label>
                <Input
                  value={download.title.zh || ''}
                  onChange={(e) => updateDownloadTranslation(index, 'title', 'zh', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (EN)</Label>
                <Input
                  value={download.description.en || ''}
                  onChange={(e) => updateDownloadTranslation(index, 'description', 'en', e.target.value)}
                />
              </div>
              <div>
                <Label>Description (ZH)</Label>
                <Input
                  value={download.description.zh || ''}
                  onChange={(e) => updateDownloadTranslation(index, 'description', 'zh', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Language</Label>
              <Input
                value={download.language || ''}
                onChange={(e) => updateDownload(index, 'language', e.target.value)}
                placeholder="e.g., en, zh, ar"
              />
            </div>

            <div>
              <Label>File</Label>
              <div className="flex gap-2">
                <Input
                  value={download.file_url}
                  onChange={(e) => updateDownload(index, 'file_url', e.target.value)}
                  placeholder="File URL"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(index, file)
                    }}
                  />
                  <Button
                    variant="outline"
                    disabled={uploading === String(index)}
                    render={<span />}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading === String(index) ? 'Uploading...' : 'Upload'}
                  </Button>
                </label>
              </div>
              {download.file_size && (
                <p className="text-sm text-muted-foreground mt-1">
                  Size: {formatFileSize(download.file_size)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
