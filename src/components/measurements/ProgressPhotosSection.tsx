import { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Loading from '@/components/common/Loading'
import EmptyState from '@/components/common/EmptyState'
import PhotoUploadModal from './PhotoUploadModal'
import PhotoDetailModal from './PhotoDetailModal'
import { useProgressPhotos } from '@/hooks/useProgressPhotos'
import { formatDate } from '@/lib/utils'
import type { MeasurementWithLatest, ProgressPhoto } from '@/types'

interface ProgressPhotosSectionProps {
  measurements: MeasurementWithLatest[]
}

export default function ProgressPhotosSection({ measurements }: ProgressPhotosSectionProps) {
  const { photos, isLoading, isUploading, error, fetchPhotos, uploadPhotos, deletePhoto } = useProgressPhotos()
  const [showUpload, setShowUpload] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handleUpload = async (files: File[], caption?: string) => {
    await uploadPhotos(files, measurements, caption)
    setShowUpload(false)
  }

  const handleDelete = async (id: string, imagePath: string) => {
    await deletePhoto(id, imagePath)
    setSelectedPhoto(null)
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Progress Photos
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setShowUpload(true)}>
          <Camera className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="py-8">
          <Loading />
        </div>
      ) : photos.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Camera className="w-6 h-6" />}
            title="No progress photos"
            description="Upload photos to track your visual progress"
            action={
              <Button variant="secondary" size="sm" onClick={() => setShowUpload(true)}>
                <Camera className="w-4 h-4" />
                Upload Photo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'Progress photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white font-medium">
                  {formatDate(photo.taken_at, 'MMM d, yyyy')}
                </p>
                {photo.caption && (
                  <p className="text-xs text-white/80 truncate">{photo.caption}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* Detail Modal */}
      <PhotoDetailModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photo={selectedPhoto}
        onDelete={handleDelete}
      />
    </div>
  )
}
