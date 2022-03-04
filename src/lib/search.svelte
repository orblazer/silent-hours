<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { search } from './search-api'
  import { coordsToUrl, replaceParams } from './url'

  export let value = ''
  export let autofocus = false
  export let debounce = 100
  export let maxResult = 5

  let prevValue = ''
  let formRef: HTMLFormElement = null
  let ref: HTMLInputElement = null

  let focusedIndex = 0
  let results: (City & { url: string })[] = []
  export let showResults = false
  let firstSearch = false

  const dispatch = createEventDispatcher<SearchEvent>()

  onMount(() => {
    if (autofocus) window.requestAnimationFrame(() => ref.focus())
  })

  async function handleChange() {
    if (value.length > 0 && value !== prevValue) {
      results = (await search(value, maxResult)).map((city) => ({
        ...city,
        url:
          location.pathname +
          `?search=${encodeURI(city.name)}&pos=${encodeURI(coordsToUrl(city.coordinates))}`
      }))

      focusedIndex = 0
      showResults = results.length > 0

      // Update url
      replaceParams(
        {
          search: value
        },
        'replace'
      )
    } else if (value.length === 0 && prevValue.length > 0) {
      results = []
    }

    prevValue = value
  }

  function debounceFn(fn: Function) {
    let timer: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), debounce)
    }
  }

  function handleSearchClick() {
    ref.focus()
  }

  function handleFocus() {
    if (results.length === 0 && value.length > 0 && !firstSearch) {
      firstSearch = true
      handleChange()
    }

    showResults = results.length > 0
  }

  function handleSelect({ url, ...city }: City & { url: string }) {
    dispatch('select', city)
    showResults = false
  }

  const allowedKeys = ['ArrowUp', 'ArrowDown', 'Escape', 'Tab', 'Enter']
  function handleKeydown(event: KeyboardEvent) {
    // Search shortcut
    if (event.key === '/' && ref !== document.activeElement) {
      event.preventDefault()
      ref.focus()
      return
    } else if (event.key === 'k' && event.ctrlKey) {
      event.preventDefault()

      if (ref !== document.activeElement) ref.focus()
      else {
        ref.blur()
        showResults = false
      }
      return
    }

    // Check if key is supported
    if (allowedKeys.indexOf(event.key) === -1) return
    // Check focus is in form
    if (!formRef.contains(document.activeElement)) return

    // Blur when escape
    if (event.key === 'Escape') {
      // Cancel usage
      event.preventDefault()
      ;(document.activeElement as HTMLElement).blur()
      showResults = false
      return
    }
    // Select item when press enter
    else if (event.key === 'Enter') {
      handleSelect(results[focusedIndex])
      return
    }

    // Loop focus
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      if (++focusedIndex > results.length - 1) {
        focusedIndex = 0

        // Exit search dialog
        if (event.key === 'Tab') {
          showResults = false
          return
        }
      }
    } else {
      if (--focusedIndex < 0) {
        focusedIndex = results.length - 1
      }
    }

    // Cancel usage
    event.preventDefault()
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<form
  bind:this={formRef}
  role="search"
  aria-labelledby="search"
  on:submit|preventDefault
  class={$$props.class}
>
  <div class="search-field" class:has-results={showResults} on:click={handleSearchClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" /><path
        d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>

    <input
      bind:this={ref}
      type="search"
      name="search"
      placeholder="Search an city..."
      autocomplete="off"
      spellcheck="false"
      {...$$restProps}
      id="search"
      bind:value
      on:focus={handleFocus}
      on:input={debounceFn(handleChange)}
    />

    <kbd class="shortcut">
      <kbd title="Control">Ctrl</kbd>
      <kbd>K</kbd>
    </kbd>
  </div>

  <ul class="results" class:hidden={!showResults} role="listbox">
    {#each results as item, index (item.id)}
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <li
        class="result-item"
        role="option"
        aria-selected={focusedIndex === index}
        on:click|preventDefault={() => handleSelect(item)}
        on:mouseover={() => (focusedIndex = index)}
      >
        <a href={item.url}>
          <strong>{item.name}</strong><br />
          {item.context}
        </a>
      </li>
    {/each}
  </ul>
</form>

<style>
  /* Search field */
  .search-field {
    display: flex;
    align-items: center;
    box-shadow: var(--elevation-shadow);
    background-color: var(--white);
    padding: 0.5rem;
    width: 100%;
    border-radius: 4px;
    cursor: text;
  }
  .search-field:hover,
  .search-field:focus-within {
    outline: 2px solid var(--accent-color);
  }
  .search-field.has-results {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .search-field svg {
    height: 1.5em;
    width: 1.5em;
  }
  .search-field input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
  }

  .shortcut {
    color: var(--muted-color);
    font: inherit;
  }

  /* Results */
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    background-color: var(--white);
    border: 1px solid var(--border-color);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .hidden {
    display: none;
    visibility: hidden;
  }

  .result-item:hover,
  .result-item:focus,
  .result-item[aria-selected='true'] {
    background-color: var(--accent-hover);
  }
  .result-item:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
  }

  .result-item a {
    display: block;
    padding: 0.5rem;
    text-decoration: none;
    color: inherit;
  }
</style>
