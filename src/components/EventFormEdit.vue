<template>
    <div id="event-form" :class="{ active: active }" :style="{ top: top, left: left }">
        <h4>Edit Event</h4>
        <p>{{ date }}</p>
        <!--<p>Thursday, Sep 21st</p>-->

        <div class="text">
            <input v-focus type="text" v-model="description" @keyup.enter="update">
        </div>
        <div class="buttons">
            <button @click="remove" class="btn-remove">Delete</button>
            <button @click="update">Update</button>
        </div>
        <button id="close-button" @click="close" >&#10005</button>
    </div>
</template>
<script>
  export default {
    props: ['event'],
    methods: {
      close() {
        this.$store.commit('eventFormEditActive', false)
      },
      update() {
        if (!this.description.trim()) {
          return
        }

        let updatedEvent = this.$store.state.eventFormEditCurrent
        updatedEvent.description = this.description

        this.$store.dispatch('updateEvent', updatedEvent).then(() => {
          this.close()
        })

      },
      remove() {
        this.$store.dispatch('deleteEvent', this.$store.state.eventFormEditCurrent).then(() => {
          this.close()
        })
      }
    },
    computed: {
      description: {
        get: function () {
          return this.$store.state.eventFormEditCurrent.description
        },
        set: function (newValue) {
          this.$store.commit('setEventFormEditCurrentDescription', newValue)
        }
      },
      date() {
        if(this.$store.state.eventFormEditCurrent.date) {
          return this.$store.state.eventFormEditCurrent.date.format('dddd, MMM Do')
        }
      },
      active() {
        return this.$store.state.eventFormEditActive
      },
      top() {
        return `${this.$store.state.eventFormEditPosY}px`
      },
      left() {
        return `${this.$store.state.eventFormEditPosX}px`
      }
    },
    directives: {
      focus: {
        update(el) {
          el.focus()
        }
      }
    }
  }
</script>