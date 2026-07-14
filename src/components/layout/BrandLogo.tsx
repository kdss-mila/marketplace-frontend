import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  showText?: boolean
  className?: string
}

export function BrandLogo({ showText = true, className }: BrandLogoProps) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center gap-2.5', className)}>
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          aria-hidden="true"
        >
          <path
            d="M6 7.5C6 5.567 7.567 4 9.5 4h5C16.433 4 18 5.567 18 7.5V8h1.5A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-9A1.5 1.5 0 0 1 4.5 8H6v-.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.5h6M9 15.5h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <span className="hidden text-lg font-bold tracking-tight sm:block">
          <span className="text-emerald-600">Easy</span>
          <span className="text-foreground">Shop</span>
        </span>
      )}
    </Link>
  )
}
