import { FC, PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageProps = {
  title: ReactNode
  hideBorder?: boolean
} & PropsWithChildren

export const Page: FC<PageProps> = ({ title, hideBorder, children }) => (
  <main className='flex min-h-screen flex-col items-center gap-y-2 pt-14 md:pt-32'>
    <h1>{title}</h1>
    <div
      className={cn(
        'h-[85vh] w-full p-3 md:h-[60vh] md:w-[34rem] md:rounded md:border md:border-border',
        {
          'border-none': hideBorder,
        }
      )}
    >
      {children}
    </div>
  </main>
)
