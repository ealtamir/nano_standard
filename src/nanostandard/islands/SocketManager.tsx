import { createContext } from 'preact'
import { useEffect, useState, useContext } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

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
    const ws = new WebSocket(`ws://${window.location.host}${endpoint}`)

    // Connection opened
    ws.addEventListener('open', () => {
      console.log('Connected to WebSocket')
      setSocketData(prev => ({ ...prev, connected: true }))
      
      // Subscribe to all available topics
      ws.send(JSON.stringify({ 
        action: 'subscribe',
        topics: ['*'] // Use '*' to subscribe to all topics
      }))
    })

    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)
        setSocketData(prev => ({
          ...prev,
          data: { ...prev.data, ...message }
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
      ws.close()
    }
  }, [endpoint])

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
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
