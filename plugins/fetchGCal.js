import Vue from 'vue'

Vue.prototype.$calendarData = [];
Vue.prototype.$calendarLoadCallbacks = [];

export default function({ app }, inject) {
  inject('calendarDataNow', () =>
    Vue.prototype.$calendarData.filter(
      evt => evt.interval && evt.interval.contains(new Date())
    )
  )

  // TODO: Do it properly: https://developers.google.com/calendar/v3/reference/
  function CORS(url) {
    return 'https://cors-anywhere.herokuapp.com/' + `${url}`
  }

  const ical = require('ical.js')
  const luxon = require('luxon')

  // https://www.raymondcamden.com/2017/08/24/serverless-ical-parsing
  function flattenEvent(e) {
    let event = {}
    for (let i = 0; i < e[1].length; i++) {
      let prop = e[1][i]
      event[prop[0]] = prop[3]
    }

    // Set dates to Date objects
    if (event.dtstart) {
      event.isWholeDay = event.dtstart && event.dtstart.length == 10
      event.dtstart = luxon.DateTime.fromISO(event.dtstart)
      event.dtend = event.dtend
        ? luxon.DateTime.fromISO(event.dtend)
        : event.dtstart
      event.interval = luxon.Interval.fromDateTimes(event.dtstart, event.dtend)
    }

    //   if (event.dtstamp) event.dtstamp = luxon.DateTime.fromISO(event.dtstamp)
    //   if (event.created) event.created = luxon.DateTime.fromISO(event.created)
    //   if (event['last-modified']) event['last-modified'] = luxon.DateTime.fromISO(event['last-modified'])

    return event
  }

  // https://fullcalendar.io/docs/vue

  fetch(
    CORS(
      'https://calendar.google.com/calendar/ical/zzmetrox%40gmail.com/private-6666a937211db8f9e886851a9e31303f/basic.ics'
    )
  )
    .then(e => e.text())
    .then(data => {
      try {
        console.info('Got data from Google Calendar')
        let parsed = ical.parse(data)
        let events = parsed[2]

        let result = []
        events.forEach(e => result.push(flattenEvent(e)))

        function getDay(dayCount) {
          return luxon.DateTime.local()
            .startOf('day')
            .plus({ days: dayCount })
        }

        let offset = 0
        let dateToday = getDay(offset + 0)
        let dateTomorrow = getDay(offset + 1)

        let interval = luxon.Interval.fromDateTimes(dateToday, dateTomorrow)
        console.info('Interval')

        for (let event of result) {
          // if (event.summary == "Church") console.error(event);
          if (event.interval && interval.overlaps(event.interval)) {
            console.log(event.summary)
          }
          Vue.prototype.$calendarData.push(event)
        }

        Vue.prototype.$calendarLoadCallbacks.forEach(cb=>cb())
        ;
        console.info('Done')
      } catch (e) {
        console.log('Error', e)
      }
    })
}
