/**
 * Bind click/touch outside the attached element
 * @param node The attached element
 * @param onClick The callback
 * @returns The action return
 */
export default function clickOutside(
  node: HTMLElement,
  onClick: (event: MouseEvent | TouchEvent) => void
): SvelteActionReturnType {
  const handleClick = (event: MouseEvent | TouchEvent) => {
    if (!event.composedPath().includes(node)) {
      onClick(event)
    }
  }

  document.addEventListener('click', handleClick)
  document.addEventListener('touchstart', handleClick)

  return {
    destroy() {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }
}
