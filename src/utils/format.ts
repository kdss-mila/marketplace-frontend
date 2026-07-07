export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatInstallment(price: number, installments = 12): string {
  const value = price / installments
  return `${installments}x de ${formatCurrency(value)} sem juros`
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getProductMeta(productId: string, price: number) {
  const hash = hashString(productId)
  const discount = [0, 10, 15, 20, 25][hash % 5]
  const originalPrice = discount > 0 ? price / (1 - discount / 100) : price
  const rating = 3.5 + (hash % 15) / 10
  const reviews = 50 + (hash % 450)
  const freeShipping = hash % 3 !== 0

  return { discount, originalPrice, rating, reviews, freeShipping }
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/(\d{5})(\d)/, '$1-$2')
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidCep(cep: string): boolean {
  return onlyDigits(cep).length === 8
}
