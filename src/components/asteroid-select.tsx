import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export type AsteroidSelectProps = {
  asteroidNames: Map<number, string>
  asteroidId?: number
  onAsteroidIdChange: (asteroidId?: number) => void
  allowAll?: boolean
}

export const AsteroidSelect = ({
  asteroidNames,
  asteroidId,
  onAsteroidIdChange,
  allowAll,
}: AsteroidSelectProps) => (
  <Select
    value={asteroidId?.toString() ?? '0'}
    onValueChange={(v) =>
      onAsteroidIdChange(v === '0' ? undefined : parseInt(v))
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {allowAll && <SelectItem value='0'>All</SelectItem>}
      {[...asteroidNames.entries()].map(([id, name]) => (
        <SelectItem key={id} value={id.toString()}>
          {name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
