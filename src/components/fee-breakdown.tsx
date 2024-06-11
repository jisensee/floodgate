import { SwayAmount } from './sway-amount'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export const FeeBreakdown = ({
  devteamShare,
  actionFee,
}: {
  devteamShare: number
  actionFee: bigint
}) => {
  const managerShare = 1 - devteamShare
  const devteamAmount = Math.floor(Number(actionFee) * devteamShare)
  const managerAmount = Math.floor(Number(actionFee) * managerShare)

  return (
    <div>
      <p className='text-muted-foreground'>
        The fee you pay is split the following way:
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Share</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Dev team
            </TableCell>
            <TableCell>{Math.round(devteamShare * 100)}%</TableCell>
            <TableCell>
              <SwayAmount amount={devteamAmount} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Crew manager
            </TableCell>
            <TableCell>{Math.round(managerShare * 100)}%</TableCell>
            <TableCell>
              <SwayAmount amount={managerAmount} convert />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='font-medium text-muted-foreground'>
              Total
            </TableCell>
            <TableCell>100%</TableCell>
            <TableCell>
              <SwayAmount amount={actionFee} convert />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
