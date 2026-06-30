export function Footer() {
  return (
    <footer className="mt-auto border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Marketplace MVP — Frontend com API mockada via MSW</p>
        <p className="mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
      </div>
    </footer>
  )
}
