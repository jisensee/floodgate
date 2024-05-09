import { Fragment } from 'react'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { SwayIcon } from './asset-images'
import { FloodgateService, FloodgateServiceType } from '@/lib/contract-types'

export type CrewServicesConfigFormProps = {
  services: FloodgateService[]
  onServicesChange: (services: FloodgateService[]) => void
}

export const CrewServicesConfigForm = ({
  services,
  onServicesChange,
}: CrewServicesConfigFormProps) => {
  const allServices: FloodgateService[] =
    services.length === 0
      ? [
          {
            serviceType: 'RefuelShip',
            enabled: false,
            actionSwayFee: 0n,
            secondsSwayFee: 0n,
          },
        ]
      : services

  const handleChange = (
    serviceType: FloodgateServiceType,
    newValues: Partial<FloodgateService>
  ) =>
    onServicesChange(
      allServices.map((service) =>
        service.serviceType === serviceType
          ? { ...service, ...newValues }
          : service
      )
    )

  return (
    <div className='grid grid-cols-[min-content,1fr] items-center gap-x-3 gap-y-2'>
      {allServices.map((service) => (
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
          <div />
          <Input
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
        </Fragment>
      ))}
    </div>
  )
}
