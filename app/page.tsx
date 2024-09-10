import Image from 'next/image'
import QuizApp from '../components/quiz-app'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-10">
      <div className='flex flex-col items-center justify-center'>
        <h1 className="text-4xl font-bold mb-4">Qin-Na</h1>
        <h2>Escuela Loto Blanco Lianhua</h2>
        <Image
          src="/images/logo_loto.png"
          alt="Logo Loto"
          width={200}  // Adjust as needed
          height={200} // Adjust as needed
          className="mt-4 shadow-xl my-4"
        />
      </div>
      <QuizApp />
    </main>
  )
}