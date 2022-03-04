// TODO: Move in separate file or to an API
const data = [
  {
    title: 'Carrefour',
    coordinates: [44.36131292335287, 2.0341881030834115],
    address: 'Av. de Toulouse',
    postalCode: 12200,
    city: 'Villefranche-de-Rouergue',
    hours: {
      lundi: '14-15h'
    }
  }
] as Market[]

export default function getMarkets(bounds: GeometryBounds, excludes: LatLng[]) {
  const [sLat, sLng] = bounds.min
  const [eLat, eLng] = bounds.max

  return data.filter((item) => {
    const [lat, lng] = item.coordinates

    // sLat > lat < eLat && eLng > lng < sLng
    const inBounds = lat > sLat && lat < eLat && lng > sLng && lng < eLng

    if (inBounds) {
      // Check if is excludes
      return excludes.findIndex((coords) => coords[0] === lat && coords[1] === lng) === -1
    }
    return false
  })
}
