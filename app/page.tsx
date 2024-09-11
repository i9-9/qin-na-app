import Image from 'next/image'
import QuizApp from '../components/quiz-app'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-0">
      <div className='flex flex-col items-center justify-center'>
        <h1 className="text-4xl font-bold mt-8">Qin-Na</h1>
        <h2>Escuela Loto Blanco Lianhua</h2>
        <Link href="/">
          <Image
            src="/images/logo_loto.png"
            alt="Logo Loto"
            width={230}  
            height={230} 
            className="mt-4 shadow-xl my-2 rounded-lg"
          />
        </Link>
      </div>
      <QuizApp />
    </main>
  )
}