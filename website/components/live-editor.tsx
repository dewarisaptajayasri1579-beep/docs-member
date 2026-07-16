'use client'

import { useState } from 'react'

export function LiveEditor({ html, raw, filePath, lang }: { html: string, raw: string, filePath: string, lang: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(raw)
  const [pin, setPin] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleEditClick = () => {
    if (!isEditing) {
      const enteredPin = prompt('Masukkan PIN Editor untuk mengedit halaman ini:')
      if (enteredPin) {
        setPin(enteredPin)
        setIsEditing(true)
      }
    } else {
      setIsEditing(false)
      setContent(raw) // reset
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content, pin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      
      alert('Berhasil disimpan ke GitHub! Halaman akan diperbarui setelah auto-deploy (sekitar 1-2 menit).')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="live-editor-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={handleEditClick}
          style={{ 
            background: 'transparent', 
            border: '1px solid #333', 
            color: '#888', 
            padding: '4px 12px', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {isEditing ? 'Batal Edit' : '📝 Edit Halaman Ini'}
        </button>
      </div>

      {isEditing ? (
        <div className="editor-container" style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          {error && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', 
              minHeight: '600px', 
              background: '#0a0a0a', 
              color: '#fff', 
              border: '1px solid #333',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '14px',
              borderRadius: '4px'
            }}
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              style={{
                background: isSaving ? '#555' : '#8a2be2',
                color: '#fff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '4px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      ) : (
        <article className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
