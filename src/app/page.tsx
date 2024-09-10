import NextLink from 'next/link'
import { Route } from 'next'
import { A, D, F, O, pipe } from '@mobily/ts-belt'
import { LandPlot, Pickaxe } from 'lucide-react'
import { ReactNode } from 'react'
import { getFloodgateCrews } from '@/actions'
import { Page } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { FloodgateServiceType } from '@/lib/contract-types'
import { SwayAmount } from '@/components/sway-amount'
import { getServiceData } from '@/components/service-button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const crews = await getFloodgateCrews()

  const availableServices = pipe(
    crews.flatMap((c) => c.services),
    A.filter((s) => s.enabled),
    A.groupBy((s) => s.serviceType),
    D.map((services) =>
      pipe(
        services,
        F.toMutable,
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
    <Page title='Floodgate' fullSize>
      <div className='flex flex-col items-center gap-y-5'>
        <p className='text-center text-xl'>
          Hire specialized crews from all over the belt and use handy tools.
        </p>
        <div className='flex flex-col items-center gap-y-3'>
          <p className='text-2xl text-primary'>What would you like to do?</p>
          <div className='flex max-w-[36rem] flex-col gap-y-3'>
            {availableServices.map(({ service, floorSwayFee }) => (
              <ServiceOption
                key={service}
                serviceType={service}
                floorPrice={floorSwayFee}
              />
            ))}
          </div>
        </div>
        <p>
          <Link href='/crews'>
            <Button variant='outline'>Browse all registered crews</Button>
          </Link>
        </p>
        <Separator className='w-3/5' />
        <h1>Tools</h1>
        <ServiceLink
          link='/tools/mining-companion'
          icon={<Pickaxe />}
          title='Mining Companion'
          description='Manage extractors and core samples.'
          floorPrice={BigInt(200 * 1e6)}
          isNew
        />
        <ServiceLink
          link='/tools/lot-management'
          icon={<LandPlot />}
          title='Lot management'
          description='See and bulk extend all your lot leases at once.'
          floorPrice={BigInt(1_000 * 1e6)}
        />
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
    <ServiceLink
      link={link as Route}
      icon={icon}
      title={name}
      description={description}
      floorPrice={floorPrice}
    />
  )
}

type ServiceLinkProps = {
  link: Route
  icon: ReactNode
  title: string
  description: string
  floorPrice: bigint
  isNew?: boolean
}
const ServiceLink = ({
  link,
  icon,
  title,
  description,
  floorPrice,
  isNew,
}: ServiceLinkProps) => (
  <NextLink
    className='relative flex w-full flex-col items-center gap-y-2 overflow-hidden rounded-md border p-3 ring-1 hover:ring-2 hover:ring-primary'
    href={link}
  >
    {isNew && (
      <Badge className='text-md absolute right-2 top-2' variant='secondary'>
        🎉 New
      </Badge>
    )}
    <div className='flex items-center gap-x-3'>
      {icon}
      <p className='text-lg'>{title}</p>
    </div>
    <p className='text-center text-sm text-muted-foreground'>{description}</p>
    <div className='flex items-center gap-x-2'>
      <p className='text-sm font-semibold'>Starting at</p>
      <SwayAmount amount={floorPrice} convert />
    </div>
  </NextLink>
)
