import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Format = {
  duration: (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) {
      parts.push(`${days}d`)
    }
    if (hours > 0) {
      parts.push(`${hours}h`)
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`)
    }
    if (remainingSeconds > 0) {
      parts.push(`${remainingSeconds}s`)
    }
    return parts.join(' ')
  },
  distance: (kilometers: number) =>
    kilometers.toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'km',
  mass: (kilograms: number) => {
    if (kilograms < 1000) {
      return `${kilograms}g`
    }
    if (kilograms < 1_000_000) {
      return Math.round(kilograms / 1000) + 't'
    }
    return (
      (kilograms / 1_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }) + 'kt'
    )
  },
}
