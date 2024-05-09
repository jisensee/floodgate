import * as R from 'remeda'
import NextLink from 'next/link'
import { Route } from 'next'
import { getFloodgateCrews } from '@/actions'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/components/ui/link'
import { FloodgateServiceType } from '@/lib/contract-types'
import { SwayAmount } from '@/components/sway-amount'
import { getServiceData } from '@/components/service-button'

export default async function Home() {
  const crews = await getFloodgateCrews()
  const availableServices = R.pipe(
    crews,
    R.flatMap((c) => c.services),
    R.filter((s) => s.enabled),
    R.map((s) => s.serviceType)
  )

  return (
    <Page title='Floodgate' hideBorder fullSize>
      <div className='flex flex-col items-center gap-y-5'>
        <p className='text-center text-xl'>
          Hire specialized crews from all over the belt!
        </p>
        <div className='flex flex-col items-center gap-y-3'>
          <p className='text-2xl text-primary'>What would you like to do?</p>
          <div>
            {availableServices.map((service) => (
              <ServiceOption
                key={service}
                serviceType={service}
                floorPrice={5000000000n}
              />
            ))}
          </div>
        </div>
        <div className='flex items-center justify-center gap-x-3'>
          <Separator />
          Or
          <Separator />
        </div>
        <p>
          <Link href='/crews'>
            <Button variant='outline'>Browse all registered crews</Button>
          </Link>
        </p>
      </div>
    </Page>
  )
}

type ServiceOptionProps = {
  serviceType: FloodgateServiceType
  floorPrice: bigint
}

const ServiceOption = ({ serviceType, floorPrice }: ServiceOptionProps) => {
  const { link, icon, name, description } = getServiceData(serviceType)
  return (
    <NextLink
      className='hover:ring-3 flex flex-col items-center gap-y-2 rounded-md border p-3 ring-1 hover:ring-primary'
      href={link as Route}
    >
      <div className='flex items-center gap-x-3'>
        {icon}
        <p className='text-lg'>{name}</p>
      </div>
      <p className='text-sm text-muted-foreground'>{description}</p>
      <div className='flex items-center gap-x-2'>
        <p className='text-sm font-semibold'>Starting at</p>
        <SwayAmount amount={floorPrice} convert />
      </div>
    </NextLink>
  )
}
