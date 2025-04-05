import Image from 'next/image'
import QuizApp from '../components/quiz-app'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="h-screen flex flex-col overflow-hidden bg-background">
      <div className="p-2 md:p-4">
        <nav className="flex justify-between items-center border-2 border-foreground">
          <div className="flex items-center p-2">
            <Link href="/" className="mr-4">
              <Image
                src="/images/logo_loto.png"
                alt="Logo Loto"
                width={50}  
                height={50} 
                className="transition-transform"
                priority
              />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-trajan-black uppercase tracking-wider">Qin-Na</h1>
              <h2 className="text-xs md:text-sm font-trajan-regular tracking-wide">Escuela Loto Blanco Lianhua</h2>
            </div>
          </div>
        </nav>
      </div>

      <div className="flex-grow p-2 md:p-4">
        <div className="h-full border-2 border-foreground">
          <QuizApp />
        </div>
      </div>
    </main>
  )
}