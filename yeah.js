let a = 0

import fetch from 'node-fetch'
import IcalExpander from 'ical-expander'

function mapper (component) {
  if (component[0] === 'vevent') {
    let obj = component[1].reduce(
      (obj, v) => ({
        ...obj,

        // Combine repeated properties as an array
        [v[0]]: obj[v[0]]
          ? [...(Array.isArray(obj[v[0]]) ? obj[v[0]] : []), v[3]]
          : v[3]
      }),
      {}
    )

    delete obj['rrule']
    delete obj['exdate']
    delete obj['created']
    delete obj['last-modified']
    delete obj['sequence']
    delete obj['dtstamp'] // This is just the current data

    // obj['dtstart'] = new Date(obj['dtstart']) // Convert to JS Date
    // obj['dtend'] = new Date(obj['dtend']) // Convert to JS Date
    return obj
  }

  return '?'
}

function doTheParse (ics) {
  const calendar = new IcalExpander({ ics, maxIterations: 100 })

  return calendar
    .after(new Date())
    .occurrences.map(
      ({
        startDate: { _cachedUnixTime: startDate },
        endDate: { _cachedUnixTime: endDate },
        item: {
          component: { jCal: component }
        }
      }) => ({
        ...mapper(component),
        // Apply correct start and end dates
        dtstart: new Date(startDate * 1000),
        dtend: new Date(endDate * 1000)
      })
    )

  // return calendar
  // .after(new Date())
  // .events.map(({ component: { jCal: component } }) => mapper(component))
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get () {
  let calenderURLS = [

  ]

  return JSON.stringify(
    (
      await Promise.all(
        calenderURLS.map(async url =>
          doTheParse(await fetch(url).then(r => r.text()))
        )
      )
    ).flat(),
    undefined,
    4
  )
}

get().then(console.log)
