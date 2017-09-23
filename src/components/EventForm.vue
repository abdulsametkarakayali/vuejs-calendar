<template>
    <div id="event-form" :class="{ active: active }" :style="{ top: top, left: left }">
        <h4>Add an event</h4>
        <p>{{ date }}</p>
        <div class="text">
            <input v-focus type="text" v-model="description" @keyup.enter="create">
        </div>
        <div class="buttons">
            <button @click="create">Create</button>
        </div>
        <button id="close-button" @click="close" >&#10005</button>
    </div>
</template>
<script>
    export default {
      data() {
        return {
          description: ''
        };
      },
      methods: {
        close() {
          this.$store.commit('eventFormActive', false)
          this.description = ''
        },
        create() {
          if (!this.description.trim()) {
            return
          }

          this.$store.dispatch('addEvent', this.description).then(() => {
            this.close()
          })
        }
      },
      computed: {
        date() {
          return this.$store.state.eventFormDate.format('dddd, MMM Do')
        },
        active() {
          return this.$store.state.eventFormActive
        },
        top() {
          return `${this.$store.state.eventFormPosY}px`
        },
        left() {
          return `${this.$store.state.eventFormPosX}px`
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