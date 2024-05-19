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
  console.log('socket disconnected')
  state.connected = false
})

const joinRoom = (room) => {
  socket.emit('join', room)
}

const isSocketConnected = () => {
  return state.connected
}

const connectSocket = (userId) => {
  socket.on('connect', async () => {
    console.log('socket connected')
    socket.emit('join', userId)
    state.connected = true
  })
  socket.connect()
}

const disconnectSocket = () => {
  socket.disconnect()
}

const listenSocketEvent = (eventName, callback) => {
  socket.on(eventName, callback)
}
const removeListenSocketEvent = (eventName, callback) => {
  socket.off(eventName, callback)
}

export { isSocketConnected, joinRoom, connectSocket, disconnectSocket, listenSocketEvent, removeListenSocketEvent }
