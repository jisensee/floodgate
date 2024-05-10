import NextLink from 'next/link'
import { Route } from 'next'
import { A, D, O, pipe } from '@mobily/ts-belt'
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

  const availableServices = pipe(
    crews.flatMap((c) => c.services),
    A.filter((s) => s.enabled),
    A.groupBy((s) => s.serviceType),
    D.map((services) =>
      pipe(
        services,
        O.fromNullable,
        O.map(A.sortBy((s) => s.actionSwayFee)),
        O.mapNullable(A.head),
        O.map((s) => s.actionSwayFee)
      )
    ),
    D.toPairs,
    A.filterMap(([service, fee]) =>
      O.map(fee, (f) => ({
        service: service as FloodgateServiceType,
        floorSwayFee: f,
      }))
    )
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
            {availableServices.map(({ service, floorSwayFee }) => (
              <ServiceOption
                key={service}
                serviceType={service}
                floorPrice={floorSwayFee}
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
