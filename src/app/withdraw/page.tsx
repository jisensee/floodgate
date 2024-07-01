import { Withdraw } from './withdraw'
import { Page } from '@/components/page'

export default async function WithdrawPage() {
  return (
    <Page title='Withdraw collected fees'>
      <Withdraw />
    </Page>
  )
}
