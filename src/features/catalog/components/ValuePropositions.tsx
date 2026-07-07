import { Truck, Zap, CreditCard, Shield, Headphones } from 'lucide-react'

const items = [
  { icon: Truck, label: 'Frete grátis', sub: 'Em compras acima de R$ 99' },
  { icon: Zap, label: 'Entrega rápida', sub: 'Receba em até 2 dias' },
  { icon: CreditCard, label: 'Parcele em até 12x', sub: 'Sem juros no cartão' },
  { icon: Shield, label: 'Compra segura', sub: 'Proteção total' },
  { icon: Headphones, label: 'Suporte 24/7', sub: 'Atendimento dedicado' },
]

export function ValuePropositions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ icon: Icon, label, sub }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold sm:text-sm">{label}</p>
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
