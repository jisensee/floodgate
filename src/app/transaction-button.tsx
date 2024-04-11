import {
  useContract,
  useContractRead,
  useContractWrite,
} from '@starknet-react/core'
import abi from '../../abi.json'
import { Button } from '@/components/ui/button'

const contractAddress =
  '0x0186ba136872b0593290a06db4aead0dca922e103c496f14cd84146708a16d56'

export const TransactionButton = () => {
  const { data } = useContractRead({
    abi: abi,
    functionName: 'get_crew_id',
    address: contractAddress,
  })
  const { contract } = useContract({
    abi: abi,
    address: contractAddress,
  })
  const { writeAsync } = useContractWrite({
    calls: [contract?.populateTransaction?.['set_crew_id']?.(1)],
  })
  console.log(data)
  return (
    <div>
      <p>Crew ID: {data?.toString()}</p>
      <Button onClick={() => writeAsync()}>Submit Transaction</Button>
    </div>
  )
}
