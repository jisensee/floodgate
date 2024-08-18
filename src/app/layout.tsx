import type { Metadata } from 'next'
import { StrictMode } from 'react'
import NextLink from 'next/link'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
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
    <StrictMode>
      <html lang='en' className='h-full'>
        <body className={cn(inter.className, 'h-full')}>
          <Analytics />
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
    </StrictMode>
  )
}

const Footer = () => (
  <footer className='flex flex-col items-center justify-center gap-y-3 pb-5 pt-3'>
    <Separator />
    <Link href='/faq'>FAQs</Link>
    <Separator className='w-32' />
    <div className='flex items-center gap-x-2'>
      <p className='text-muted-foreground'>
        Built by <span className='text-foreground'>Cheveuxxx</span> and{' '}
        <span className='text-foreground'>Denker</span> on{' '}
      </p>
      <NextLink
        className='inline-flex'
        href='https://github.com/jisensee/floodgate'
        target='_blank'
      >
        {' '}
        <SiGithub />
      </NextLink>
    </div>
  </footer>
)
