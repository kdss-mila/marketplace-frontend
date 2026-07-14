import type { Product } from '@/types'

export type FavoriteItem = Pick<
  Product,
  'sellerId' | 'sellerName' | 'weight' | 'dimensions'
> & {
  productId: string
  title: string
  price: number
  image: string
}
