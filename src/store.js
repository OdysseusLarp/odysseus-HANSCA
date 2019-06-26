import axios from 'axios'


export default {
  modules: {
    navigator: {
      strict: true,
      namespaced: true,
      state: {
        stack: [],
        options: { 
          animation: 'none'
        }
      },
      mutations: {
        push(state, page) {
          state.stack.push(page)
        },
        pop(state) {
          if (state.stack.length > 1) {
            state.stack.pop()
          }
        },
        replace(state, page) {
          state.stack.pop()
          state.stack.push(page)
        },
        reset(state, page) {
          state.stack = [page || state.stack[0]]
        },
        options(state, newOptions = {}) {
          state.options = newOptions
        }
      },
      getters: {
        current: state => {
          return state.stack[state.stack.length - 1].name
        }
      }
    },
    user: {
      strict: true,
      namespaced: true,
      state: {
        user: {},
        skillFactor: 1,
        analyseBaseTime: 90,
      },
      mutations: {
        login(state, user) {
          state.user = user
        },
        skillFactor(state, value) {
          state.skillFactor = value;
        },
        analyseBaseTime(state, value) {
          state.analyseBaseTime = value;
        },
        logout(state) {
          state.user = {}
        }
      },
      getters: {
        userLevel: state => {
          return state.user.user_level
        }
      }
    },
    // Copy-paste from odysseus-misc-ui
    backend: {
      state: {
        dataBlobs: [],
        boxId: "",
        backend: {
          uri: "https://odysseus.nicou.me/",
          username: "odysseus",
          password: "saunatonttu",
        }
      },
      mutations: {
        setBackend (state, backend) {
          state.backend = backend
        },
        setBoxId (state, boxId) {
          state.boxId = boxId
        },
        setDataBlob (state, data) {
          let found = false
          state.dataBlobs = state.dataBlobs.map(e => {
            if (e.type === data.type && e.id == data.id) {
              found = true
              return data
            } else {
              return e
            }
          })
          if (!found) {
            state.dataBlobs.push(data)
          }
        },
        deleteDataBlob (state, data) {
          state.dataBlobs = state.dataBlobs.filter(e => e.type !== data.type || e.id !== data.id)
        },
      },
      actions: {
        saveDataBlob ({ commit, dispatch, state }, data) {
          const type = data.type
          const id = data.id
          commit('setDataBlob', data)
    
          axios.post(`/data/${type}/${id}`, data)
          .then(response => {
            commit('setDataBlob', response.data)
          })
          .catch(e => {
            console.error("Error saving data blob, fetching back from server", e)
            dispatch('fetchDataBlob', data)
          })
        },
        fetchDataBlob ({ commit, state }, data) {
          const type = data.type
          const id = data.id
    
          axios.get(`/data/${type}/${id}`)
          .then(response => {
            commit('setDataBlob', response.data)
          })
          .catch(e => {
            console.error("Error fetching data blob: ", e)
          })
        },
        /* type and/or id may be undefined --> all types / ids */
        syncDataBlobs ({ commit, state, dispatch }, data) {
          const type = data.type
          const id = data.id
          let path
          if (type && id) {
            path = `/data/${type}/${id}`
          } else if (type) {
            path = `/data/${type}`
          } else {
            path = '/data'
          }
          axios.get(path)
          .then(response => {
            if (Array.isArray(response.data)) {
              response.data.forEach(e => commit('setDataBlob', e))
    
              const missing = state.dataBlobs.filter(b => !response.data.find(e => e.type === b.type && e.id === b.id))
              // console.log("SYNC MISSING IN ACTION", JSON.stringify(missing))
              if (type && id) {
                console.error("type and id defined, should not have received an array!")
              } else if (type) {
                missing.filter(e => e.type === type).forEach(e => commit('deleteDataBlob', e))
              } else {
                missing.forEach(e => commit('deleteDataBlob', e))
              }
            } else {
              commit('setDataBlob', response.data)
            }
          })
          .catch(e => {
            console.error("Error fetching data blobs (retrying in 5 secs): ", e)
            setTimeout(() => dispatch('syncDataBlobs', data), 5000)
          })
        },
      },
    }
  }
}
