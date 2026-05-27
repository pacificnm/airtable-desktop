/**
 * Normalizes COUNTRY / ISO columns from building CSV rows before country dedupe.
 * Fixes common bad rows (swapped ISO2/ISO3, region codes in ISO2).
 */

export interface CountryCsvIsoFields {
  country: string
  iso2?: string
  iso3?: string
}

function isIso2(value: string): boolean {
  return /^[A-Za-z]{2}$/.test(value)
}

function isIso3(value: string): boolean {
  return /^[A-Za-z]{3}$/.test(value)
}

export function normalizeCountryCsvIsoFields(
  country: string | undefined,
  iso2: string | undefined,
  iso3: string | undefined,
): CountryCsvIsoFields {
  let c = country?.trim() ?? ''
  let i2 = iso2?.trim() || undefined
  let i3 = iso3?.trim() || undefined

  if (i2 && i3 && isIso3(i2) && isIso2(i3)) {
    ;[i2, i3] = [i3, i2]
  }

  if (i2 && !isIso2(i2)) {
    if (i3 && isIso2(i3)) {
      const swap = i2
      i2 = i3
      if (isIso3(swap)) i3 = swap
      else i3 = undefined
    } else {
      i2 = undefined
    }
  }

  if (i3 && !isIso3(i3)) {
    if (i2 && isIso3(i2)) {
      ;[i2, i3] = [i3, i2]
    } else {
      i3 = undefined
    }
  }

  if (!c && i2) c = i2
  if (!c && i3) c = i3

  if (isIso3(c) && !i3) i3 = c
  if (isIso2(c) && !i2) i2 = c

  return { country: c, iso2: i2, iso3: i3 }
}

export interface CountryAccumulator {
  country: string
  iso2?: string
  iso3?: string
  nikeRegion?: string
  nikeTerritory?: string
  sourceRow: number
  occurrenceCount: number
}

/** Prefer fuller country names and valid ISO codes when merging duplicate keys. */
export function mergeCountryAccumulator(
  existing: CountryAccumulator,
  incoming: CountryCsvIsoFields & {
    nikeRegion?: string
    nikeTerritory?: string
    sourceRow: number
  },
): void {
  existing.occurrenceCount += 1

  const preferCountry =
    incoming.country.length > existing.country.length &&
    !isIso2(incoming.country) &&
    !isIso3(incoming.country)
  if (preferCountry) {
    existing.country = incoming.country
  }

  if (incoming.iso2 && isIso2(incoming.iso2)) {
    if (!existing.iso2 || !isIso2(existing.iso2)) {
      existing.iso2 = incoming.iso2
    }
  }

  if (incoming.iso3 && isIso3(incoming.iso3)) {
    if (!existing.iso3 || !isIso3(existing.iso3)) {
      existing.iso3 = incoming.iso3
    }
  }

  if (incoming.nikeRegion && !existing.nikeRegion) {
    existing.nikeRegion = incoming.nikeRegion
  }
  if (incoming.nikeTerritory && !existing.nikeTerritory) {
    existing.nikeTerritory = incoming.nikeTerritory
  }
}
