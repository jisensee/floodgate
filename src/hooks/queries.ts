import { useQuery } from '@tanstack/react-query'
import { getFloodgateCrews } from '@/actions'

export const useAccountCrews = (address: string) =>
  useQuery({
    queryKey: ['my-crews', address],
    queryFn: () =>
      getFloodgateCrews({
        manager: address,
        includeLocked: true,
      }),
  })
