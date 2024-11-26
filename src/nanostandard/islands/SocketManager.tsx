import { createContext } from 'preact'
import { useEffect, useState, useContext } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import type { SocketMessage } from '../routes/api/data.tsx'

interface SocketManagerProps {
  children: ComponentChildren
  endpoint?: string
}

interface SocketContext {
  data: Record<string, any>
  connected: boolean
}

export function SocketManager({ 
  children, 
  endpoint = '/api/data' 
}: SocketManagerProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [socketData, setSocketData] = useState<SocketContext>({
    data: {},
    connected: false
  })

  useEffect(() => {
    // Create WebSocket connection
    const url = `ws://${window.location.host}${endpoint}`
    console.log(`Connecting to ${url}`)
    const ws = new WebSocket(url)

    // Connection opened
    ws.addEventListener('open', () => {
      console.log('Connected to WebSocket')
      setSocketData(prev => ({ ...prev, connected: true }))
      
      // Subscribe to all available topics
      console.log('Subscribing to all topics')
      ws.send(JSON.stringify({ 
        type: 'subscribe',
        topics: ['*'] // Use '*' to subscribe to all topics
      } as SocketMessage))
    })

    // Set up keepalive interval
    const keepaliveInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          type: 'keepalive',  
          topics: []
        } as SocketMessage))
      }
    }, 40000) // 40 seconds

    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        console.log('Received message:', event.data.slice(0, 100))
        const message = JSON.parse(event.data)
        setSocketData(prev => ({
          ...prev,
          data: message
        }))
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    })

    // Handle connection close
    ws.addEventListener('close', () => {
      console.log('Disconnected from WebSocket')
      setSocketData(prev => ({ ...prev, connected: false }))
    })

    // Handle errors
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
    })

    setSocket(ws)

    // Cleanup on unmount
    return () => {
      clearInterval(keepaliveInterval)
      ws.close()
    }
  }, [endpoint])

  return (
    <div className="container mx-auto max-w-[2000px] px-4">
      <SocketContext.Provider value={socketData}>
        {children}
      </SocketContext.Provider>
    </div>
  )
}

// Update context creation to only include data and connection status
export const SocketContext = createContext<SocketContext>({
  data: {},
  connected: false
})

// Rename hook to better reflect its purpose
export function useSocketData() {
  return useContext(SocketContext)
}
