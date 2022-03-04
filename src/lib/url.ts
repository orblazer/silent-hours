/**
 * Convert coordinates to url
 * @param coordinates The coordinates want converted
 * @returns The url coordinates
 */
export function coordsToUrl(coordinates: [number, number]): string {
  return coordinates[0].toFixed(7) + ',' + coordinates[1].toFixed(7)
}

/**
 * Replace param in url
 * @param params The params want changed
 * @param [method=push] The method used for history (`push` = add new history, `replace` = replace the current history, `none` = nothing)
 * @returns The modified search url
 */
export function replaceParams(
  params: Record<string, string>,
  method: 'push' | 'replace' | 'none' = 'push'
): string {
  let newSearch = window.location.search

  // Replace params
  Object.entries(params).forEach(([param, value]) => {
    // Encode data
    param = encodeURIComponent(param)
    value = encodeURI(value)

    newSearch = newSearch.replace(new RegExp(`${param}=(.+?)(&|$)`), `${param}=${value}$2`)
  })

  // Update history
  if (method !== 'none' && window.location.search !== newSearch) {
    history[(method === 'push' ? 'pushState' : 'replaceState') as keyof typeof history](
      {},
      '',
      window.location.pathname + newSearch
    )
  }

  return newSearch
}
