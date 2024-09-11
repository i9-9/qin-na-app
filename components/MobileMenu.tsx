import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react'
import Link from 'next/link'

interface MobileMenuProps {
  resetQuiz: () => void;
}

const links = [
  { href: '/', label: 'Inicio' },
  { href: 'https://lotoblanco.com/', label: 'Web de Loto Blanco' },
  { href: 'https://lotoblanco.com/acceso-alumnos/', label: 'Acceso Alumnos' },
]

export function MobileMenu({ resetQuiz }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  const handleLinkClick = (href: string) => {
    setOpen(false)
    if (href === '/') {
      resetQuiz()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="">
          <Menu className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col space-y-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium hover:underline"
              onClick={() => handleLinkClick(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}