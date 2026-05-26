/**
 * Time-of-day theme resolver.
 *
 * "Auto" mode flips the site between light and dark based on the user's
 * local clock — no permission popup, no geolocation, no IP lookup.
 *
 * Bands chosen to match what feels right indoors:
 *   06:00 – 17:59  → light
 *   18:00 – 05:59  → dark
 *
 * Picking 6/6 (instead of true sunrise/sunset) keeps the behaviour
 * predictable across seasons and latitudes — users in Norway in June
 * don't want the page to be light at 3 a.m. just because the sun is up.
 */

export type Resolved = 'light' | 'dark'

const LIGHT_START_HOUR = 6
const DARK_START_HOUR = 18

export function getTimeOfDayTheme(date: Date = new Date()): Resolved {
  const hour = date.getHours()
  return hour >= LIGHT_START_HOUR && hour < DARK_START_HOUR ? 'light' : 'dark'
}

/** Milliseconds until the theme would flip if we sat idle. Useful for tooltips. */
export function msUntilNextFlip(date: Date = new Date()): number {
  const target = new Date(date)
  const hour = date.getHours()
  if (hour >= LIGHT_START_HOUR && hour < DARK_START_HOUR) {
    // Currently light — next flip is 18:00 today.
    target.setHours(DARK_START_HOUR, 0, 0, 0)
  } else {
    // Currently dark — next flip is 06:00 today (or tomorrow if we're past noon).
    if (hour >= DARK_START_HOUR) {
      target.setDate(target.getDate() + 1)
    }
    target.setHours(LIGHT_START_HOUR, 0, 0, 0)
  }
  return target.getTime() - date.getTime()
}

/** Human label for the auto-mode tooltip, e.g. "flips at 6:00 PM". */
export function nextFlipLabel(date: Date = new Date()): string {
  const target = new Date(date.getTime() + msUntilNextFlip(date))
  return target.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
