<script lang="ts">
  import type L from 'leaflet'
  import { createEventDispatcher, onMount, SvelteComponent } from 'svelte'
  import 'leaflet/dist/leaflet.css'
  import MapPopup from './map-popup.svelte'

  export let center: L.LatLngExpression
  export let zoom: number
  export let options: Omit<L.MapOptions, 'center' | 'zoom'> = {}

  let leaflet: typeof L = null
  let map: L.Map = null
  let bounds: L.LatLngBounds = null

  let container: HTMLDivElement
  let dispatch = createEventDispatcher<MapEvent>()

  onMount(async () => {
    leaflet = await import('leaflet')

    map = new leaflet.Map(container, { ...options, center, zoom })
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        detectRetina: true
      })
      .addTo(map)

    bounds = map.getBounds()

    const handleMoveEnd = () => {
      bounds = map.getBounds()
      const center = map.getCenter()

      dispatch('moveend', {
        bounds: getBounds(),
        center: [center.lat, center.lng],
        zoom: map.getZoom()
      })
    }
    map.on('moveend', handleMoveEnd, this)

    dispatch('loaded')

    return {
      destroy() {
        map.off('moveend', handleMoveEnd, this)
        map.remove()
        map = null
      }
    }
  })

  function resizeMap() {
    if (map) {
      map.invalidateSize()
    }
  }

  /**
   * Set the view to
   * @param center
   * @param zoom
   */
  export function setView(center: L.LatLngExpression, resetZoom = false) {
    if (map) {
      map.setView(center, resetZoom ? zoom : undefined)
    }
  }

  /**
   * Add market to the map
   * @param market The market data
   */
  export function addMarket(market: Market): null | (L.Marker & { id: string }) {
    if (!leaflet || !map) return null

    const marker = leaflet.marker(market.coordinates, {
      riseOnHover: true,
      title: market.title,
      alt: market.title
    })
    // Set it to marker
    ;(marker as any).id = market.id

    // Attach component to popup
    let popupComponent: SvelteComponent
    marker.bindPopup(() => {
      let container = leaflet.DomUtil.create('div')
      popupComponent = new MapPopup({
        target: container,
        props: {
          data: market
        }
      })
      return container
    })

    marker
      .on('popupopen', () => dispatch('select', market))
      .on('popupclose', () => {
        if (popupComponent) {
          let old = popupComponent
          popupComponent = null

          // Wait to destroy until after the fadeout completes.
          setTimeout(() => {
            old.$destroy()
          }, 500)
        }
      })

    return marker.addTo(map) as L.Marker & { id: string }
  }

  /**
   * Get maps bounds
   * @returns map bounds
   */
  export function getBounds(): GeometryBounds {
    if (!map) {
      return {
        min: [0, 0],
        max: [0, 0]
      }
    }

    const min = bounds.getSouthWest()
    const max = bounds.getNorthEast()
    return {
      min: [min.lat, min.lng],
      max: [max.lat, max.lng]
    }
  }

  /**
   * Check if position is in bounds
   * @param position The position want check
   * @returns The position is in bounds
   */
  export function isInBounds(position: L.LatLngExpression) {
    return bounds.contains(position)
  }
</script>

<svelte:window on:resize={resizeMap} />

<div bind:this={container} {...$$restProps} />

<style>
  div {
    position: relative;
    width: 100%;
    height: 100%;
  }

  div:global(.leaflet-container a) {
    color: var(--accent-color);
  }

  div :global(.leaflet-control-attribution),
  div :global(.leaflet-control-scale-line) {
    color: currentColor;
  }

  /* Zoom control */
  div :global(.leaflet-bar) {
    margin-top: 1rem;
    margin-left: 1rem;
    border: none;
    box-shadow: var(--elevation-shadow);
  }
  div :global(.leaflet-bar a) {
    color: currentColor;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--white);
  }
  div :global(.leaflet-bar a:not(.leaflet-disabled):hover),
  div :global(.leaflet-bar a:not(.leaflet-disabled):focus) {
    background-color: var(--accent-hover);
    outline: 1px solid var(--accent-color);
  }
  div :global(.leaflet-bar .leaflet-disabled) {
    background-color: var(--disabled-color);
  }

  /* Popup */
  div :global(.leaflet-popup-content-wrapper),
  div :global(.leaflet-popup-tip) {
    color: inherit;
    background-color: var(--white);
    box-shadow: var(--elevation-shadow);
  }

  div :global(.leaflet-popup-content-wrapper) {
    border-radius: 4px;
  }
  div :global(.leaflet-popup-content) {
    margin: 1rem;
  }

  div :global(a.leaflet-popup-close-button) {
    color: currentColor;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-family: inherit;
    font-size: 18px;
    font-weight: bold;
  }
  div :global(a.leaflet-popup-close-button:hover) {
    color: var(--accent-color);
  }
</style>
