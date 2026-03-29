import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

interface PhotoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[], caption?: string) => Promise<void>
  isUploading: boolean
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}: PhotoUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(prev => [...prev, ...files])

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return
    await onUpload(selectedFiles, caption || undefined)
    handleClose()
  }

  const handleClose = () => {
    setSelectedFiles([])
    setPreviews([])
    setCaption('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Progress Photos">
      <div className="space-y-4">
        {/* File picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {previews.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8
                       flex flex-col items-center gap-2 hover:border-primary-500 dark:hover:border-primary-400
                       transition-colors"
          >
            <Image className="w-8 h-8 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tap to select photos
            </p>
          </button>
        ) : (
          <div className="space-y-3">
            {/* Preview grid */}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {/* Add more button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg
                           flex items-center justify-center hover:border-primary-500 transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Caption */}
        <Input
          label="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="e.g. Week 4 progress"
        />

        {/* Upload button */}
        <Button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photo${selectedFiles.length > 1 ? 's' : ''}` : 'Photos'}
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}
