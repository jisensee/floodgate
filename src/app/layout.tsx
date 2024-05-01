import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { Providers } from './providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Link } from '@/components/ui/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Floodgate',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='h-full'>
      <body className={cn(inter.className, 'h-full')}>
        <Providers>
          <div className='flex h-full flex-col'>
            <Header />
            <div className='flex-grow'>{children}</div>
            <Footer />
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}

const Footer = () => (
  <footer className='flex flex-col items-center justify-center gap-y-3 py-3'>
    <Separator />
    <Link href='/faq'>FAQs</Link>
    <Separator className='w-32' />
    <p className='text-muted-foreground'>
      Built by <span className='text-foreground'>Cheveuxxx</span> and{' '}
      <span className='text-foreground'>Denker</span>
    </p>
  </footer>
)
