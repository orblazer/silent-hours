import assert, { AssertionError } from 'assert'
import { readFile, writeFile } from 'fs/promises'
import { globby } from 'globby'
import { nanoid } from 'nanoid'
import { join } from 'path'

// Get files
const destination = join('src', 'lib', 'markets.json')
const files = await globby('./data/markets/**/*.json')

// Build json from file
const results = await Promise.allSettled(
  files.map(async (file) => {
    const filename = file.replace('./data/markets/', './')

    const content = await readFile(file, 'utf-8')
    const markets = JSON.parse(content)
    assert(Array.isArray(markets), `[${filename}] The file is not an array`)

    let results = ''
    let maxIndex = markets.length - 1
    for (const [index, market] of markets.entries()) {
      // Verify data
      assert(typeof market.title === 'string', `[${filename}][index ${index}] The title is invalid`)
      assert(
        Array.isArray(market.coordinates) &&
          market.coordinates.length === 2 &&
          typeof market.coordinates[0] === 'number' &&
          typeof market.coordinates[1] === 'number',
        `[${filename}][index ${index}] The coordinates is invalid`
      )
      assert(
        typeof market.address === 'string',
        `[${filename}][index ${index}] The address is invalid`
      )
      assert(
        typeof market.postalCode === 'number',
        `[${filename}][index ${index}] The postalCode is invalid`
      )
      assert(typeof market.city === 'string', `[${filename}][index ${index}] The city is invalid`)
      assert(
        market.hours?.constructor.name === 'Object',
        `[${filename}][index ${index}] The hours is invalid`
      )

      // Build json
      results +=
        `{"_":"${nanoid()}","t":"${escape(market.title)}","c":[${market.coordinates.join(',')}],` +
        `"a":"${escape(market.address)}","p":${market.postalCode},` +
        `"ci":"${escape(market.city)}","h":{${Object.entries(market.hours)
          .map(([day, hours]) => `"${day}":"${escape(hours)}"`)
          .join(',')}}}${index < maxIndex ? ',' : ''}`
    }

    return results
  })
)

const successResults = results.filter((result) => result.status === 'fulfilled')

// Output file
await writeFile(destination, `[${successResults.map((result) => result.value).join(',')}]`)

// Fail if have error
if (successResults.length !== results.length) {
  console.group('Some files have error :')
  results
    .filter((result) => result.status === 'rejected')
    .map((result) => {
      if (result.reason instanceof AssertionError) {
        console.error(result.reason.message)
      } else {
        console.error(result.reason)
      }
    })
  console.groupEnd('Some files have error :')
  process.exit(1)
}

/**
 * Escape string characters
 * @param {string} value The value
 * @returns The escaped value
 */
function escape(value) {
  return value.replace(/"/g, '\\"')
}
