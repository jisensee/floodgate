import { Wheat } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FoodStatusProps = {
  foodRatio: number
  className?: string
}
export const FoodStatus = ({ foodRatio, className }: FoodStatusProps) => (
  <div
    className={cn(
      'flex items-center gap-x-1',
      foodRatio > 0.5 ? 'text-success' : 'text-destructive',
      className
    )}
  >
    <Wheat />
    <span>{Math.round(foodRatio * 100)}%</span>
  </div>
)
