import React from 'react'

export type UseWebsocket = {
  url: string
  handleOpen?: () => void
  handleClose?: (code: number, reason: string) => void
  handleMessage: (message: SocketMessage) => void
  handleError?: (e: Event) => void
}

export type SocketMessage = {
  event: string
  data: Record<string, any>
}

export function useWebsocket({
  url,
  handleMessage,
  handleClose,
  handleError,
  handleOpen,
}: UseWebsocket) {
  const socket = React.useRef<WebSocket | null>(null)
  const countAuthReconecting = React.useRef(0)
  const countErrorReconecting = React.useRef(0)
  const [isSocketDestroy, setIsSocketDestroy] = React.useState(false)
  //FIXME: Получить токен
  const token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjNzJiMDIyLWY5NDctNGJmZC05NjkxLTIwYjc4MTJjY2Q5YyIsInJvbGUiOiJhZG1pbiIsInN1YnNjcmlwdGlvbiI6bnVsbCwiaWF0IjoxNjkxODcyMDg4LCJleHAiOjE2OTM5NDU2ODh9.s0tMq5R2WvupZhdrMaA34p87NygZfb9q3k0VeMHslUI`

  function onOpen(e: Event) {
    console.log(e)
    countErrorReconecting.current = 0
    sendMessage('auth', { token })
    handleOpen?.()
  }
  function onMessage(e: MessageEvent) {
    //FIXME: add safeparse
    const message = JSON.parse(e.data)
    handleMessage(message)
  }
  function onClose(e: CloseEvent) {
    socket.current = null
    if (e.code === 1008) {
      if (countAuthReconecting.current < 2) {
        //FIXME: Переполучить токен
        connectSocket()
        countAuthReconecting.current++
      } else {
        //FIXME: Закрыть
        setIsSocketDestroy(true)
      }
    } else if (e.code === 1006) {
      if (countErrorReconecting.current < 5) connectSocket()
      countErrorReconecting.current++
    } else {
      setIsSocketDestroy(true)
    }
    handleClose?.(e.code, e.reason)
  }
  function onError(e: Event) {
    handleError?.(e)
  }

  function sendMessage(event: string, data: any) {
    if (socket.current?.readyState === 1)
      socket.current?.send(JSON.stringify({ event, data }))
  }

  function connectSocket() {
    socket.current = new WebSocket(url)
    socket.current.onopen = onOpen
    socket.current.onmessage = onMessage
    socket.current.onclose = onClose
    socket.current.onerror = onError
  }

  React.useEffect(() => {
    connectSocket()
    return () => {
      socket.current?.close(1000, 'complete')
    }
  }, [])

  return { sendMessage, isSocketDestroy }
}
