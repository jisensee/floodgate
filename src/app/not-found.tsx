import { Page } from '@/components/page'

export default function NotFound() {
  return (
    <Page title='This page does not exist'>
      <p className='text-center'>
        The link you used might be outdated or the crew is not registered
        anymore.
      </p>
    </Page>
  )
}
