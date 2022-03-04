/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  VITE_DEFAULT_MAP_CENTER: string
}

type LatLng = [number, number]
interface GeometryBounds {
  min: LatLng
  max: LatLng
}

interface City {
  id: string
  score: number
  name: string
  context: string
  coordinates: LatLng
}

interface Market {
  title: string
  coordinates: LatLng
  address: string
  postalCode: number
  city: string
  hours: Record<string, string>
}

// Events
interface MapEvent {
  loaded: undefined
  moveend: {
    bounds: GeometryBounds
    center: LatLng
    zoom: number
  }
  select: Market
}
interface SearchEvent {
  select: City
}
