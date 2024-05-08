import { useState } from 'react'
import { Lock, LockOpen, Save, Trash2 } from 'lucide-react'
import { CrewServicesConfigForm } from '@/components/crew-services-config-form'
import { Button } from '@/components/ui/button'
import {
  useSetCrewLocked,
  useSetCrewManager,
  useSetCrewServicesConfig,
  useUnregisterCrew,
} from '@/hooks/contract'
import { FloodgateCrew } from '@/lib/contract-types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export type CrewManagementProps = {
  crew: FloodgateCrew
}

export const CrewManagement = ({ crew }: CrewManagementProps) => {
  const [services, setServices] = useState(crew.services)
  const [managerAddress, setManagerAddress] = useState(
    '0x' + crew.managerAddress.toString(16)
  )
  const { write: unregister } = useUnregisterCrew(crew.id)
  const { write: toggleLocked } = useSetCrewLocked(crew.id, !crew.locked)
  const { write: setServiceConfig } = useSetCrewServicesConfig(
    crew.id,
    services
  )
  const { write: setCrewManager } = useSetCrewManager(crew.id, managerAddress)

  return (
    <div className='flex flex-col items-center gap-y-5'>
      <div className='flex flex-col gap-y-3 rounded-md border border-border p-3'>
        <CrewServicesConfigForm
          services={services}
          onServicesChange={setServices}
        />
        <Button
          variant='accent'
          onClick={() => setServiceConfig()}
          icon={<Save />}
        >
          Save service config
        </Button>
      </div>
      <div className='flex w-11/12 flex-col gap-y-1 rounded-md border border-border p-3'>
        <Label>Manager address</Label>
        <Input
          value={managerAddress}
          onChange={(e) => setManagerAddress(e.target.value)}
        />
        <Button
          className='mt-2'
          variant='accent'
          onClick={() => setCrewManager()}
          icon={<Save />}
        >
          Set Manager
        </Button>
      </div>
      <Button
        variant='accent'
        onClick={() => toggleLocked()}
        icon={crew.locked ? <LockOpen /> : <Lock />}
      >
        {crew.locked ? 'Unlock' : 'Lock'}
      </Button>
      <Button
        variant='destructive'
        onClick={() => unregister()}
        icon={<Trash2 />}
      >
        Unregister
      </Button>
    </div>
  )
}
