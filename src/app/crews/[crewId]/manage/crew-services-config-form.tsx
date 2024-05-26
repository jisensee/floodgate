import { Fragment, useState } from 'react'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SwayIcon } from '@/components/asset-images'
import { Button } from '@/components/ui/button'
import {
  FloodgateCrew,
  FloodgateService,
  FloodgateServiceType,
  floodGateServiceTypes,
} from '@/lib/contract-types'
import { useDevteamShare, useSetCrewServicesConfig } from '@/hooks/contract'
import { useTransactionToast } from '@/hooks/transaction-toast'
import { SwayAmount } from '@/components/sway-amount'

export type CrewServicesConfigFormProps = {
  services: FloodgateService[]
  onServicesChange: (services: FloodgateService[]) => void
}

export const CrewServicesConfigForm = ({ crew }: { crew: FloodgateCrew }) => {
  const router = useRouter()
  const devteamShare = useDevteamShare() ?? 0
  const [services, setServices] = useState(
    floodGateServiceTypes.map(
      (serviceType) =>
        crew.services.find(
          (service) => service.serviceType === serviceType
        ) ?? {
          serviceType,
          enabled: false,
          actionSwayFee: 0n,
          secondsSwayFee: 0n,
        }
    )
  )

  const {
    write: setServiceConfig,
    data,
    status,
    error,
  } = useSetCrewServicesConfig(crew.id, services)

  const { isLoading } = useTransactionToast({
    txHash: data?.transaction_hash,
    submitStatus: status,
    submitError: error,
    successMessage: 'Service configuration saved!',
    pendingMessage: 'Saving service configuration...',
    onSuccess: router.refresh,
  })

  const handleChange = (
    serviceType: FloodgateServiceType,
    newValues: Partial<FloodgateService>
  ) =>
    setServices((s) =>
      s.map((service) =>
        service.serviceType === serviceType
          ? { ...service, ...newValues }
          : service
      )
    )

  return (
    <div className='flex flex-col items-center gap-y-3'>
      <div className='grid w-full grid-cols-[min-content,1fr] items-center gap-x-3 gap-y-2'>
        <p className='col-span-2 text-sm text-muted-foreground'>
          Configure which services others can use with this crew.
        </p>
        {services.map((service) => (
          <Fragment key={service.serviceType}>
            <Checkbox
              id={service.serviceType}
              checked={service.enabled}
              onCheckedChange={(checked) =>
                handleChange(service.serviceType, { enabled: checked === true })
              }
            />
            <Label className='text-lg' htmlFor={service.serviceType}>
              {service.serviceType}
            </Label>
            <Input
              className='col-span-2'
              type='number'
              leadingIcon={<SwayIcon size={24} />}
              value={(service.actionSwayFee / 1_000_000n).toString()}
              disabled={!service.enabled}
              onChange={(e) =>
                handleChange(service.serviceType, {
                  actionSwayFee: BigInt(e.target.value) * 1_000_000n,
                })
              }
            />
            <div className='col-span-2 flex items-center gap-x-1 text-muted-foreground'>
              <span>You will receive</span>
              <SwayAmount
                className='text-foreground'
                amount={Number(service.actionSwayFee) * (1 - devteamShare)}
                convert
              />
              <span>
                per action after applying the{' '}
                <span className='text-foreground'>
                  {Math.round(devteamShare * 100)}%
                </span>{' '}
                dev team share.
              </span>
            </div>
          </Fragment>
        ))}
      </div>
      <Button
        className='w-fit'
        variant='accent'
        onClick={() => setServiceConfig()}
        disabled={services.some(
          (service) => service.enabled && service.actionSwayFee === 0n
        )}
        loading={isLoading}
        icon={<Save />}
      >
        Save service config
      </Button>
    </div>
  )
}
