import { BrandLogo } from '@/components/layout/BrandLogo'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo showText={false} className="pointer-events-none" />
            <p className="mt-3 text-sm font-semibold">EasyShop</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprar ficou fácil. As melhores ofertas com entrega rápida.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Institucional</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Sobre nós</li>
              <li>Trabalhe conosco</li>
              <li>Política de privacidade</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Ajuda</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Central de ajuda</li>
              <li>Trocas e devoluções</li>
              <li>Rastrear pedido</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Contato</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>suporte@easyshop.com</li>
              <li>0800 000 0000</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EasyShop — Todos os direitos reservados
        </p>
      </div>
    </footer>
  )
}
