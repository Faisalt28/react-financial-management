import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button'

export function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null)

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKey)
        document.body.style.overflow = prevOverflow
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const modalElement = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-xs"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          className={cn(
            'relative w-full my-auto rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-[8px_8px_0px_0px_#9333ea] transition-all duration-200 text-left',
            sizes[size],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 border-b-2 border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              id="modal-close-btn"
              className="w-8 h-8 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              <X size={16} />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalElement, document.body)
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="flex gap-2.5 justify-end pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            id="confirm-cancel-btn"
            className="border-2 border-zinc-950 dark:border-zinc-700 font-bold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
            id="confirm-ok-btn"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
