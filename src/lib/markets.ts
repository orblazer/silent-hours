import markets from './markets.json'

/**
 *
 * @param bounds The bounds for limit search
 * @param excludes The ids want excludes
 * @param limit
 * @returns
 */
export default function getMarkets(
  bounds: GeometryBounds,
  excludes: string[],
  limit = 100
): Market[] {
  // Search markets in bounds
  const [sLat, sLng] = bounds.min
  const [eLat, eLng] = bounds.max

  let results = markets.filter((item) => {
    const [lat, lng] = item.c // coordinates

    // sLat > lat < eLat && eLng > lng < sLng
    const inBounds = lat > sLat && lat < eLat && lng > sLng && lng < eLng

    return inBounds && excludes.indexOf(item._) === -1
  })

  // Randomize marker if have more than limit
  if (results.length > 100) {
    results = results.sort(() => 0.5 - Math.random()).slice(0, limit)
  }

  return results.map((item) => ({
    id: item._,
    title: item.t,
    coordinates: item.c as [number, number],
    address: item.a,
    postalCode: item.p,
    city: item.ci,
    hours: item.h
  }))
}
