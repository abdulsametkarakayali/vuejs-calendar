import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
Vue.use(Vuex);

import moment from 'moment-timezone'
moment.tz.setDefault('UTC')

import Axios from 'axios'

export default new Vuex.Store({
  state: {
    currentYear: (new Date()).getFullYear(),
    currentMonth: (new Date()).getMonth()+1,
    eventFormPosX: 0,
    eventFormPosY: 0,
    eventFormActive: false,
    eventFormDate: moment(),
    eventFormEditPosX: 0,
    eventFormEditPosY: 0,
    eventFormEditActive: false,
    eventFormEditCurrent: {},
    events: []
  },
  mutations: {
    setCurrentMonth(state, payload) {
      state.currentMonth = payload
    },
    setCurrentYear(state, payload) {
      state.currentYear = payload
    },
    eventFormPos(state, payload) {
      state.eventFormPosX = payload.x
      state.eventFormPosY = payload.y
    },
    eventFormActive(state, payload) {
      state.eventFormActive = payload
    },
    eventFormEditPos(state, payload) {
      state.eventFormEditPosX = payload.x
      state.eventFormEditPosY = payload.y
    },
    eventFormEditActive(state, payload) {
      state.eventFormEditActive = payload
    },
    eventFormEditCurrent(state, payload) {
      state.eventFormEditCurrent = payload
    },
    setEventFormEditCurrentDescription(state, payload) {
      state.eventFormEditCurrent.description = payload
    },
    addEvent(state, payload) {
      state.events.push(payload)
    },
    updateEvent(state, payload) {
      const index = _.findIndex(state.events, function(o) { return o.id === payload.id; })

      if (index <= -1) {
        return
      }

      let newEvents = [...state.events]
      newEvents[index] = payload
      state.events = newEvents
    },
    deleteEvent(state, payload) {
      const index = _.findIndex(state.events, function(o) { return o.id === payload.id; })

      if (index <= -1) {
        return
      }

      let newEvents = [...state.events]
      newEvents.splice(index, 1)
      state.events = newEvents
    },
    eventFormDate(state, payload) {
      state.eventFormDate = payload
    }
  },
  actions: {
    addEvent(context, payload) {
      return new Promise((resolve, reject) => {
        const event = {
          description: payload,
          date: context.state.eventFormDate
        };

        Axios.post('/events', event).then(response => {
          if (response.status === 200) {
            event.id = response.data.id
            context.commit('addEvent', event)
            resolve()
            return
          }
          reject()
        })
      })
    },
    updateEvent(context, payload) {
      return new Promise((resolve, reject) => {
        Axios.patch(`/events/${payload.id}`, payload).then(response => {
          if (response.status === 200) {
            context.commit('updateEvent', payload)
            resolve()
            return
          }
          reject()
        })
      })
    },
    deleteEvent(context, payload) {
      return new Promise((resolve, reject) => {
        Axios.delete(`/events/${payload.id}`, payload).then(response => {
          if (response.status === 200) {
            context.commit('deleteEvent', payload)
            resolve()
            return
          }
          reject()
        })
      })
    }

  }
})