import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { apiClient } from './api/client'
import type { SSEMessage } from './hooks/useSSE'
import { useSSE } from './hooks/useSSE'

interface HealthStatus {
  status: string
}

interface AnalysisResponse {
  message: string
}

interface AnalysisResult {
  timestamp: number
  response: AnalysisResponse
}

function App() {
  const [status, setStatus] = useState<string>('Loading...')
  const [healthError, setHealthError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // SSE メッセージ受信時のコールバック
  const handleSSEMessage = useCallback(async (message: SSEMessage) => {
    try {
      // "SSE Message" を受信したら /api/analyze_sse にアクセス
      if (message.message === 'SSE Message') {
        const response = await apiClient.get<AnalysisResponse>('/api/analyze_sse')
        setAnalysisResults((prev) => [
          ...prev,
          {
            timestamp: Date.now(),
            response,
          },
        ])
        setAnalysisError(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setAnalysisError(errorMessage)
      console.error('Failed to analyze SSE message:', err)
    }
  }, [])

  const { messages, isConnected, error: sseError, clearMessages } = useSSE(
    `${apiUrl}/api/events`,
    handleSSEMessage
  )

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await apiClient.get<HealthStatus>('/api/health')
        setStatus(`Backend Status: ${data.status}`)
        setHealthError(null)
      } catch (err) {
        setHealthError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('Error')
      }
    }

    checkHealth()
  }, [])

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null
  const latestAnalysis = analysisResults.length > 0 ? analysisResults[analysisResults.length - 1] : null

  const clearAnalysisResults = useCallback(() => {
    setAnalysisResults([])
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 SSE Test Application</h1>
        
        <div className="status-container">
          <p className={healthError ? 'error' : 'success'}>{status}</p>
          {healthError && <p className="error-message">{healthError}</p>}
        </div>

        <div className="sse-container">
          <h2>Server-Sent Events</h2>
          
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {sseError && <p className="error-message">SSE Error: {sseError}</p>}

          <div className="messages-section">
            <div className="messages-header">
              <h3>Received Messages ({messages.length})</h3>
              {messages.length > 0 && (
                <button onClick={clearMessages} className="clear-btn">
                  Clear
                </button>
              )}
            </div>

            {latestMessage && (
              <div className="latest-message">
                <h4>Latest Message</h4>
                <div className="message-content">
                  <p><strong>Message:</strong> {latestMessage.message}</p>
                  <p><strong>Count:</strong> {latestMessage.count}</p>
                  <p><strong>Timestamp:</strong> {new Date(latestMessage.timestamp * 1000).toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            <div className="messages-list">
              <h4>All Messages</h4>
              <div className="messages-scroll">
                {messages.length === 0 ? (
                  <p className="no-messages">Waiting for messages...</p>
                ) : (
                  <ul>
                    {messages.map((msg, index) => (
                      <li key={index} className="message-item">
                        <span className="message-count">#{msg.count}</span>
                        <span className="message-text">{msg.message}</span>
                        <span className="message-time">
                          {new Date(msg.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="analysis-container">
            <h2>API Analysis Results</h2>
            
            {analysisError && <p className="error-message">Analysis Error: {analysisError}</p>}

            <div className="analysis-section">
              <div className="analysis-header">
                <h3>Analysis Results ({analysisResults.length})</h3>
                {analysisResults.length > 0 && (
                  <button onClick={clearAnalysisResults} className="clear-btn">
                    Clear
                  </button>
                )}
              </div>

              {latestAnalysis && (
                <div className="latest-analysis">
                  <h4>Latest Analysis Result</h4>
                  <div className="analysis-content">
                    <p><strong>Response Message:</strong> {latestAnalysis.response.message}</p>
                    <p><strong>Timestamp:</strong> {new Date(latestAnalysis.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )}

              <div className="analysis-list">
                <h4>All Analysis Results</h4>
                <div className="analysis-scroll">
                  {analysisResults.length === 0 ? (
                    <p className="no-messages">Waiting for analysis results...</p>
                  ) : (
                    <ul>
                      {analysisResults.map((result, index) => (
                        <li key={index} className="analysis-item">
                          <span className="analysis-count">#{index + 1}</span>
                          <span className="analysis-text">{result.response.message}</span>
                          <span className="analysis-time">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default App
