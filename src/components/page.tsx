import { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageProps = {
  title: ReactNode
  subtitle?: ReactNode
  fullSize?: boolean
  scrollable?: boolean
} & PropsWithChildren

export const Page = ({
  title,
  subtitle,
  fullSize,
  scrollable,
  children,
}: PageProps) => (
  <main className='flex h-full justify-center px-2 pt-14 md:pt-20'>
    <div
      className={cn('flex flex-col items-center gap-y-2', {
        'md:w-[34rem]': !fullSize,
      })}
    >
      {typeof title === 'string' ? (
        <h1 className='text-center'>{title}</h1>
      ) : (
        title
      )}
      {subtitle && (
        <p className='text-center text-muted-foreground'>{subtitle}</p>
      )}
      <div
        className={cn('w-full p-3 ', {
          'overflow-y-auto': scrollable,
          'md:h-[65vh]': !fullSize,
        })}
      >
        {children}
      </div>
    </div>
  </main>
)
