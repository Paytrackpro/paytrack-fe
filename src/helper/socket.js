import { reactive } from 'vue'
import * as io from 'socket.io-client'

export const state = reactive({
  connected: false,
})

const socket = io('http://localhost:6789', {
  path: '/socket.io',
  autoConnect: true,
  reconnection: true,
  transports: ['websocket'],
})

socket.on('disconnect', () => {
  state.connected = false
  // console.log('Disconnected')
})

socket.on('connect', () => {
  state.connected = true
  // console.log('Connected')
})

socket.on('connect', () => {
  state.connected = true
})

const joinRoom = (room) => {
  socket.emit('join', room)
}

const leftRoom = (room) => {
  socket.emit('left', room)
}

const isSocketConnected = () => {
  return state.connected
}

const connectSocket = (userId) => {
  socket.on('connect', async () => {
    socket.emit('join', userId)
    state.connected = true
  })
  socket.connect()
}

const disconnectSocket = () => {
  socket.disconnect()
}

const listenSocketEvent = (eventName, callback) => {
  socket.off(eventName, callback) // prevent duplicate listener
  socket.on(eventName, callback)
}
const removeListenSocketEvent = (eventName, callback) => {
  socket.off(eventName, callback)
}
function checkConnectionStatus() {
  if (state.connected) {
    return true
  } else {
    return false
  }
}

export {
  socket,
  isSocketConnected,
  joinRoom,
  leftRoom,
  connectSocket,
  disconnectSocket,
  listenSocketEvent,
  removeListenSocketEvent,
  checkConnectionStatus,
}
