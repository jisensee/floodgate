import { UseQueryResult } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { match } from 'ts-pattern'

export type AsyncDataProps<TData, TError> = {
  result: UseQueryResult<TData, TError>
  onLoading: ReactNode
  onError?: (error: TError) => ReactNode
  children: (data: TData) => ReactNode
}
export const AsyncData = <TData, TError>({
  result,
  onLoading,
  onError,
  children,
}: AsyncDataProps<TData, TError>) =>
  match(result)
    .with(
      {
        status: 'success',
      },
      ({ data }) => children(data)
    )
    .with({ status: 'error' }, ({ error }) => (onError ? onError(error) : null))
    .otherwise(() => onLoading)
