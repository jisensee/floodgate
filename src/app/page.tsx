import Link from 'next/link'
import { ContractCrewDisplay } from './contract-crew-display'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <Page title='Influence Ship Refueler' hideBorder>
      <div className='flex flex-col items-center gap-y-10'>
        <ContractCrewDisplay />
        <Link href='/refuel'>
          <Button size='lg'>Refuel your ship now</Button>
        </Link>
      </div>
    </Page>
  )
}
