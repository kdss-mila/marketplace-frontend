import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const slides = [
  {
    title: 'Até 70% OFF em tecnologia',
    subtitle: 'Notebooks, smartphones e acessórios com frete grátis',
    cta: 'Comprar agora',
    href: '/busca?q=tecnologia',
    gradient: 'from-indigo-600 via-indigo-500 to-violet-500',
    image: 'https://picsum.photos/seed/hero-tech/800/400',
  },
  {
    title: 'Frete grátis em milhares de produtos',
    subtitle: 'Aproveite entrega rápida para todo o Brasil',
    cta: 'Ver ofertas',
    href: '/busca?q=ofertas',
    gradient: 'from-violet-600 via-purple-500 to-indigo-500',
    image: 'https://picsum.photos/seed/hero-shipping/800/400',
  },
  {
    title: 'Parcele em até 12x sem juros',
    subtitle: 'Compre agora e pague com tranquilidade',
    cta: 'Explorar',
    href: '/',
    gradient: 'from-indigo-700 via-indigo-600 to-blue-500',
    image: 'https://picsum.photos/seed/hero-pay/800/400',
  },
]

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => api.scrollNext(), 5000)
    return () => clearInterval(interval)
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api]
  )

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <div
                className={cn(
                  'relative flex min-h-[220px] items-center overflow-hidden rounded-2xl bg-gradient-to-r p-6 sm:min-h-[260px] sm:p-8 lg:min-h-[280px]',
                  slide.gradient
                )}
              >
                <div className="relative z-10 max-w-md flex-1">
                  <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/80 sm:text-base">{slide.subtitle}</p>
                  <Button
                    asChild
                    className="mt-5 bg-white text-primary hover:bg-white/90"
                  >
                    <Link to={slide.href}>
                      {slide.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 sm:block lg:right-8">
                  <img
                    src={slide.image}
                    alt=""
                    className="h-48 w-auto rounded-xl object-cover opacity-90 shadow-2xl lg:h-56"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir para slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              current === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  )
}
