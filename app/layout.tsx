import type { Metadata } from 'next'
import './globals.css'
import { UserContextProvider } from '@/contexts/UserContext'

export const metadata: Metadata = {
  title: 'Vместе',
  description: 'Welcome to Vместе WebApp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserContextProvider>
          <header className="bg-gray-900 text-white py-4 px-6 shadow-md">
            <h1 className="text-2xl font-bold">Vместе</h1>
          </header>
          <main>{children}</main>
        </UserContextProvider>
      </body>
    </html>
  )
}

