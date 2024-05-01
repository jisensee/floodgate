import { FC, PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageProps = {
  title: ReactNode
  hideBorder?: boolean
  fullSize?: boolean
} & PropsWithChildren

export const Page: FC<PageProps> = ({
  title,
  hideBorder,
  fullSize,
  children,
}) => (
  <main className='flex flex-col items-center gap-y-2 pt-14 md:pt-32'>
    {typeof title === 'string' ? <h1>{title}</h1> : title}
    <div
      className={cn('w-full p-3 md:rounded md:border md:border-border', {
        'border-none': hideBorder,
        'md:w-[34rem]': !fullSize,
        'md:h-[60vh]': !fullSize,
      })}
    >
      {children}
    </div>
  </main>
)
