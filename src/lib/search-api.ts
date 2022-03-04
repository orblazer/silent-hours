interface Feature {
  geometry: {
    coordinates: [number, number]
  }
  properties: {
    id: string
    score: number
    city: string
    context: string
  }
}

/**
 * Search an city
 * @param query The query
 * @param limit The search limit
 * @returns The founded city
 */
export async function search(query: string, limit = 10): Promise<City[]> {
  query = encodeURI(query)

  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search?autocomplete=1&type=municipality&limit=${limit}&q=${query}`
  )
  const { features }: { features: Feature[] } = await res.json()

  return features.map(({ geometry, properties }) => ({
    id: properties.id,
    score: properties.score,
    name: properties.city,
    context: properties.context,
    coordinates: [geometry.coordinates[1], geometry.coordinates[0]]
  }))
}
