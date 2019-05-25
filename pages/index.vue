<template>
  <section class="section">
    <div class="columns is-mobile">
      <card title="According to my schedule...">
        <li v-for="evt of currentEvents" :key="evt.uid">{{evt.summary}}</li>
      </card>

      <card title="I could also be doing"></card>
    </div>

    <vue-cal
      style="height: 100%"
      small
      showAllDayEvents
      startWeekOnSunday
      :events="events"
      :disable-views="['years', 'year', 'month']"
    ></vue-cal>
  </section>
</template>

<script>
import luxon from 'luxon'
import Card from '~/components/Card'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
// console.log(luxon);

export default {
  name: 'Wyd',

  components: {
    card: Card,
    'vue-cal': VueCal
  },

  methods: {
    _currentEvents() {
      this.currentEvents = this.$calendarDataNow()
    },

    _fillEvents() {
      let data = []
      this.$calendarData.forEach(event => {
        if (event.dtstart) {
          data.push({
            allDay: event.isWholeDay,
            start: event.dtstart.toFormat('y-MM-dd H:mm:ss'),
            end: (event.isWholeDay ? event.dtend.minus(1) : event.dtend).toFormat(
              'y-MM-dd H:mm:ss'
            ),
            title: event.summary
            // content: '<i class="v-icon material-icons">directions_run</i>'
            // class: 'sport'
          })
        }
      })

      this.events = data
    }
  },

  data: function() {
    this.$calendarLoadCallbacks.push(this._fillEvents)
    this.$calendarLoadCallbacks.push(this._currentEvents)

    return {
      currentEvents: [],
      events: []
    }
  }
}
</script>
