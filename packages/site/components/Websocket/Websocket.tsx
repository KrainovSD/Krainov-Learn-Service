import { SocketMessage, useWebsocket } from 'helpers'
import React from 'react'
import styles from './Websocket.module.scss'

export function WebsocketComponent() {
  const [currentWord, setCurrentWord] = React.useState<string | null>(null)
  const [currentOptions, setCurrentOptions] = React.useState([])
  const currentIdRef = React.useRef<string | null>(null)

  const { sendMessage, isSocketDestroy } = useWebsocket({
    url: 'ws://localhost:3000/word',
    handleMessage,
    handleClose,
  })

  function handleMessage(message: SocketMessage) {
    console.log(message)
    switch (message.event) {
      case 'words': {
        setCurrentWord(message.data.word)
        setCurrentOptions(message.data.options)
        currentIdRef.current = message.data.id
      }
      default: {
        break
      }
    }
  }
  function handleClose(code: number, reason: string) {
    console.log(code, reason)
  }
  function startLearn() {
    sendMessage('start', {
      type: 'known',
      kind: 'normal',
    })
  }

  function handleClickOption(option: string) {
    setCurrentWord(null)
    setCurrentOptions([])

    console.log({
      id: currentIdRef.current,
      option: option,
    })
    sendMessage('words', {
      id: currentIdRef.current,
      option: option,
    })
  }

  return (
    <>
      <button
        style={{ fontSize: '20px', padding: '10px' }}
        onClick={startLearn}
      >
        Start learn
      </button>

      {currentWord && currentOptions.length === 4 && (
        <div className={styles.base}>
          <div className={styles.quest}>{currentWord}</div>
          <div className={styles.options}>
            {currentOptions.map((option) => {
              return (
                <div
                  className={styles.option}
                  key={option}
                  onClick={() => handleClickOption(option)}
                >
                  {option}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
