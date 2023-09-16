import React from 'react'

export type UseWebsocket<T> = {
  url: string
  handleOpen?: () => void
  handleClose?: (code: number, reason: string) => void
  handleMessage: (message: T) => void
  handleError?: (e: Event) => void
}

export type SocketMessage<T = unknown> = T extends Record<string, any>
  ? T
  : Record<string, any>

export function useWebsocket<T extends Record<string, any>>({
  url,
  handleMessage,
  handleClose,
  handleError,
  handleOpen,
}: UseWebsocket<T>) {
  const socket = React.useRef<WebSocket | null>(null)
  const countAuthReconecting = React.useRef(0)
  const countErrorReconecting = React.useRef(0)
  const [isSocketDestroy, setIsSocketDestroy] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  //FIXME: Получить токен
  const token = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjNzJiMDIyLWY5NDctNGJmZC05NjkxLTIwYjc4MTJjY2Q5YyIsInJvbGUiOiJhZG1pbiIsInN1YnNjcmlwdGlvbiI6bnVsbCwiaWF0IjoxNjk0NTQ3NDcwLCJleHAiOjE2OTY2MjEwNzB9.PVb3xXStzcIL7KkMFQ3mRvTwz_CX3KTKfLluk9oX-Io`

  function onOpen(e: Event) {
    countErrorReconecting.current = 0
    setIsLoading(false)
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
      if (countErrorReconecting.current < 5)
        setTimeout(() => {
          connectSocket()
        }, 1000)

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
    setIsLoading(true)
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

  return { sendMessage, isSocketDestroy, isLoading }
}
