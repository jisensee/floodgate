import { Page } from '@/components/page'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function FaqPage() {
  return (
    <Page title='Frequently Asked Questions' hideBorder>
      <Accordion type='single' collapsible defaultValue='what'>
        <AccordionItem value='what'>
          <AccordionTrigger>What is Floodgate?</AccordionTrigger>
          <AccordionContent>
            Floodgate is a service that allows Influence players to utilize
            above average crews for specific tasks. Currently we offer ship
            refueling which, due to various bonuses of the crew, allows you to
            fit a lot more propellant into your ship tank than normal.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='how'>
          <AccordionTrigger>How does this work?</AccordionTrigger>
          <AccordionContent>
            <p>
              We utilize the crew delegation mechanism to delegate control of a
              crew to a smart contract. This contract then handles the surface
              transport logic and also the fee payment.{' '}
            </p>
            <p>
              Additionally, the frontend will prompt for some additional
              transactions to temporarily permit the crew to acces your
              warehouse and ship. The full multicall looks like this:
            </p>
            <ol className='list list-decimal pl-5'>
              <li>Permit crew to remove products from source inventory</li>
              <li>Permit crew to add products to destination inventory</li>
              <li>
                Increase SWAY allowance by the fee amout with the contract as
                spender
              </li>
              <li>Call our contract to handle the transport and fee paymant</li>
              <li>Remove permission from source inventory</li>
              <li>Remove permission from destination inventory</li>
            </ol>
            This leaves no dangling permissions and makes sure your assets stay
            safe.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='price'>
          <AccordionTrigger>What does it cost?</AccordionTrigger>
          <AccordionContent>
            Each crew can have a different fee. The price will be displayed in
            the UI before you confirm the transaction. You can also see the
            price on the crew list.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='fee-distribution'>
          <AccordionTrigger>Who gets the fees?</AccordionTrigger>
          <AccordionContent>
            All paid fees are split between us developers to keep the service
            running and the crew owner.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Page>
  )
}
