<template>
    <div :class="classObject" @click="openEventForm">
        {{ day.format('D') }}
        <ul class="event-list">
            <li v-for="_event in events" @click="(event) => {openEventFormEdit(event, _event)}">{{ _event.description }}</li>
        </ul>
    </div>
</template>
<script>
    export default {
      props: ['day'],
      computed: {
        events() {
            return this.$store.state.events.filter(event => event.date.isSame(this.day, 'day'))
        },
        classObject() {
          const eventFormDate = this.$store.state.eventFormDate
          const eventFormActive = this.$store.state.eventFormActive
          const today = this.day.isSame(this.$moment(), 'day')
          return {
            day: true,
            today,
            past: this.day.isSameOrBefore(this.$moment(), 'day') && !today,
            active: eventFormDate.isSame(this.day, 'day') && (eventFormActive)
          }
        }
      },
      methods: {
        openEventForm(event) {
          this.$store.commit('eventFormPos', { x: event.clientX, y: event.clientY })
          this.$store.commit('eventFormActive', true)
          this.$store.commit('eventFormDate', this.day)
        },
        openEventFormEdit(event, currEvent){
          event.stopPropagation()

          const _currEvent = {
            id: currEvent.id,
            description: currEvent.description,
            date: currEvent.date
          }

          this.$store.commit('eventFormEditCurrent', _currEvent)
          this.$store.commit('eventFormEditPos', { x: event.clientX, y: event.clientY })
          this.$store.commit('eventFormEditActive', true)
        }
      }
    }

</script>