import { useCallback, useEffect, useState } from 'react'

export interface SSEMessage {
  message: string
  count: number
  timestamp: number
}

export const useSSE = (url: string, onMessage?: (message: SSEMessage) => void) => {
  const [messages, setMessages] = useState<SSEMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(() => {
    try {
      const eventSource = new EventSource(url)

      eventSource.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEMessage
          setMessages((prev) => [...prev, data])
          // メッセージ受信時のコールバック実行
          if (onMessage) {
            onMessage(data)
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        setError('Connection lost')
        eventSource.close()
      }

      return () => {
        eventSource.close()
        setIsConnected(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsConnected(false)
    }
  }, [url, onMessage])

  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isConnected,
    error,
    clearMessages,
  }
}
