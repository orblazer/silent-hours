<script context="module" lang="ts">
  export const prerender = true

  const latlngRegex =
    /^(-?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?)),(-?(?:180(?:\.0+)?|(?:1[0-7]\d|[1-9]?\d)(?:\.\d+)?))$/
</script>

<script lang="ts">
  import { browser } from '$app/env'
  import getMarkets from '$lib/markets'
  import Map from '$lib/map.svelte'
  import Search from '$lib/search.svelte'
  import { coordsToUrl, replaceParams } from '$lib/url'
  import type { Marker } from 'leaflet'

  const zoom = 15
  const minMarkerZoom = 10
  const maxMarkers = 100

  let map: Map
  let search = ''
  let center: [number, number] = [0, 0]
  let markers: (Marker & { id: string })[] = []

  // Load data
  if (browser && 'URLSearchParams' in window) {
    const urlParams = new URLSearchParams(window.location.search)

    // Retrieve search
    search = decodeURIComponent(urlParams.get('search') ?? '')

    // Retrieve coords
    const matches = latlngRegex.exec(urlParams.get('pos'))
    if (matches) center = [Number(matches[1]), Number(matches[2])]
  }

  /**
   * Handle search result is selected
   * @param event The event data
   */
  function handleSearch({ detail }: CustomEvent<SearchEvent['select']>) {
    if (map) {
      map.setView(detail.coordinates, true)
      search = detail.name

      // Update url
      replaceParams({
        search: detail.name,
        pos: coordsToUrl(detail.coordinates)
      })
    }
  }

  /**
   * Handle map loaded event
   */
  function handleLoaded() {
    refreshMarkets(map.getBounds(), true)
  }

  /**
   * Handle map stop meved event
   * @param event The event data
   */
  function handleMoveEnd({ detail }: CustomEvent<MapEvent['moveend']>) {
    // Refresh markers when is not too unzoomed
    if (detail.zoom >= minMarkerZoom) {
      refreshMarkets(detail.bounds)
    }

    // Update url
    replaceParams({
      pos: coordsToUrl(detail.center)
    })
  }

  /**
   * Handle select an marker
   * @param event The event data
   */
  function handleSelect({ detail }: CustomEvent<MapEvent['select']>) {
    map.setView(detail.coordinates)

    // Update url
    replaceParams({
      search: detail.city,
      pos: coordsToUrl(detail.coordinates)
    })
  }

  /**
   * Refreh markers on maps
   * @param bounds The maps bounds
   * @param reset Force create all markers
   */
  function refreshMarkets(bounds: GeometryBounds, reset = false) {
    if (!map) {
      return
    }

    if (reset || markers.length === 0) {
      markers = getMarkets(bounds, [], maxMarkers)
        .map(map.addMarket)
        .filter((item) => {
          return item !== null
        })
    } else {
      // Remove outside markers
      markers = [
        ...markers.filter((item) => {
          if (!map.isInBounds(item.getLatLng())) {
            item.remove()
            return false
          }
          return true
        })
      ]

      // Add new markers
      markers = [
        ...markers,
        ...getMarkets(
          bounds,
          markers.map((item) => item.id),
          maxMarkers
        )
          .map(map.addMarket)
          .filter((item) => {
            return item !== null
          })
      ]
    }
  }
</script>

<svelte:head>
  <title>Map</title>
</svelte:head>

<div class="map">
  <Search
    class="search"
    placeholder="Cherchez une ville"
    bind:value={search}
    on:select={handleSearch}
  />
  <Map
    bind:this={map}
    {zoom}
    {center}
    on:loaded={handleLoaded}
    on:moveend={handleMoveEnd}
    on:select={handleSelect}
  />
</div>

<style>
  .map {
    position: relative;
    height: 100vh;
  }

  .map > :global(.search) {
    position: absolute;
    width: 25vw;
    min-width: 400px;
    z-index: 1000;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
