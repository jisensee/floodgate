import {
  useContract,
  useContractRead,
  useContractWrite,
} from '@starknet-react/core'
import { useQuery } from '@tanstack/react-query'
import abi from '../../abi.json'
import { getCrew } from '@/actions'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export const useContractCrew = () => {
  const { data: crewId, isLoading: crewIdLoading } = useContractRead({
    abi: abi,
    functionName: 'get_crew_id',
    address: contractAddress,
  })
  const { data: crewData, isLoading: crewDataLoading } = useQuery({
    queryKey: ['contract-crew-id'],
    queryFn: () => getCrew(Number(crewId) ?? 0),
    enabled: !!crewId,
  })

  return { crewData, isLoading: crewIdLoading || crewDataLoading }
}

export const useFuelShipTransaction = () => {
  const { contract } = useContract({
    abi: abi,
    address: contractAddress,
  })
  return useContractWrite({
    calls: [contract?.populateTransaction?.['set_crew_id']?.(1)],
  })
}
