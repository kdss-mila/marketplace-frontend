import { useRef, useState } from 'react'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { uploadProductImage } from '@/features/seller-panel/api/sellerApi'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const file = files[0]

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG ou WebP.')
      return
    }

    if (file.size > MAX_BYTES) {
      setError('Arquivo muito grande. Limite de 5 MB.')
      return
    }

    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      onChange([...value, url])
    } catch {
      setError('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-gray-400"
      >
        {uploading ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-gray-400" />
        ) : (
          <ImagePlus className="mb-2 h-8 w-8 text-gray-400" />
        )}
        <p className="text-sm text-gray-500">
          {uploading ? 'Enviando...' : 'Clique ou arraste uma imagem'}
        </p>
        <p className="mt-1 text-xs text-gray-400">JPEG, PNG ou WebP — máx. 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative h-24 w-24 rounded-md overflow-hidden border">
              <img src={url} alt={`Imagem ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-white/80 p-0.5 text-gray-700 hover:bg-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
