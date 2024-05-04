'use client'

import { InfluenceEntity } from 'influence-typed-sdk/api'
import { Apple, Cog, Lock, Trash, User } from 'lucide-react'
import { CrewDetails } from '../crew-details'
import { CrewLockForm } from './crew-lock-form'
import { CrewServicesConfigForm } from './crew-services-config-form'
import { UnregisterForm } from './unregister-form'
import { ManagerForm } from './manager-form'
import { FeedingConfigForm } from './feeding-config-form'
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
  availableWarehouses: InfluenceEntity[]
}

const Management = ({
  crew,
  availableWarehouses,
  address,
}: CrewManagementProps & { address: string }) => {
  const isManager = address && BigInt(address) === crew.managerAddress

  if (!isManager) return null

  return (
    <div className='flex flex-col items-center gap-y-5'>
      <CrewDetails crew={crew} />
      <Accordion className='w-full' type='single' defaultValue={'services'}>
        <AccordionItem value='services'>
          <AccordionTrigger>
            <div className='flex items-center gap-x-2'>
              <Cog />
              Services
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CrewServicesConfigForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='feeding'>
          <AccordionTrigger>
            <div className='flex items-center gap-x-2'>
              <Apple />
              Feeding Config
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <FeedingConfigForm
              crew={crew}
              availableWarehouses={availableWarehouses}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='manager'>
          <AccordionTrigger>
            <div className='flex items-center gap-x-2'>
              <User />
              Manager
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ManagerForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='lock'>
          <AccordionTrigger>
            <div className='flex items-center gap-x-2'>
              <Lock />
              Lock/Unlock
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CrewLockForm crew={crew} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='unregister'>
          <AccordionTrigger className='text-destructive'>
            <div className='flex items-center gap-x-2'>
              <Trash />
              Unregister
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <UnregisterForm crew={crew} address={address} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export const CrewManagement = (props: CrewManagementProps) => (
  <RequireConnectedAccount>
    {(address) => <Management {...props} address={address} />}
  </RequireConnectedAccount>
)
