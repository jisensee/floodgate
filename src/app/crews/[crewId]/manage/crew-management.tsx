'use client'

import { CrewDetails } from '../crew-details'
import { CrewLockForm } from './crew-lock-form'
import { CrewServicesConfigForm } from './crew-services-config-form'
import { UnregisterForm } from './unregister-form'
import { ManagerForm } from './manager-form'
import { FloodgateCrew } from '@/lib/contract-types'
import { RequireConnectedAccount } from '@/components/require-connected-account'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export type CrewManagementProps = {
  crew: FloodgateCrew
}

const Management = ({
  crew,
  address,
}: CrewManagementProps & { address: string }) => {
  const isManager = address && BigInt(address) === crew.managerAddress

  if (!isManager) return null

  return (
    <div className='flex flex-col items-center gap-y-5'>
      <CrewDetails crew={crew} />
      <Accordion className='w-full' type='single' defaultValue={'services'}>
        <AccordionItem value='services'>
          <AccordionTrigger>Services</AccordionTrigger>
          <AccordionContent>
            <CrewServicesConfigForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='manager'>
          <AccordionTrigger>Manager</AccordionTrigger>
          <AccordionContent>
            <ManagerForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='lock'>
          <AccordionTrigger>Lock/Unlock</AccordionTrigger>
          <AccordionContent>
            <CrewLockForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='unregister'>
          <AccordionTrigger className='text-destructive'>
            Unregister
          </AccordionTrigger>
          <AccordionContent>
            <UnregisterForm crew={crew} address={address} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export const CrewManagement = ({ crew }: CrewManagementProps) => (
  <RequireConnectedAccount>
    {(address) => <Management crew={crew} address={address} />}
  </RequireConnectedAccount>
)
