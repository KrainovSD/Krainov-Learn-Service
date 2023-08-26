import { SocketMessage, useWebsocket } from 'helpers'
import React from 'react'
import styles from './Websocket.module.scss'
import clsx from 'clsx'
import { typings } from '@krainov/utils'

type Messages = WordsMessage | AnswerMessage
type WordsMessage = {
  event: 'words'
  data: {
    id: string
    word: string
    options?: string[]
  }
}
type AnswerMessage = {
  event: 'answer'
  data: {
    result: boolean
  }
}

export function WebsocketComponent() {
  const [currentWord, setCurrentWord] = React.useState<string | null>(null)
  const [currentOptions, setCurrentOptions] = React.useState<string[]>([])
  const [currentValue, setCurrentValue] = React.useState('')
  const currentIdRef = React.useRef<string | null>(null)
  const [isWaiting, setIsWaiting] = React.useState(false)
  const [currentResult, setCurrentResult] = React.useState<boolean | null>(null)

  const { sendMessage, isSocketDestroy } = useWebsocket<Messages>({
    url: 'ws://localhost:3000/word',
    handleMessage,
    handleClose,
  })

  function handleMessage(message: Messages) {
    console.log(message)
    switch (message.event) {
      case 'words': {
        setCurrentWord(message.data.word)
        if (message.data.options?.length === 4)
          setCurrentOptions(message.data.options)
        currentIdRef.current = message.data.id
        break
      }
      case 'answer': {
        setCurrentResult(message.data.result)
        setIsWaiting(false)
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
    if (isWaiting) return

    setIsWaiting(true)
    sendMessage('words', {
      id: currentIdRef.current,
      option: option,
    })
  }

  function handleNext() {
    setCurrentWord(null)
    setCurrentValue('')
    setCurrentOptions([])
    setCurrentResult(null)
    sendMessage('next', '')
  }

  return (
    <>
      <button
        style={{ fontSize: '20px', padding: '10px' }}
        onClick={startLearn}
      >
        Start learn
      </button>

      {currentWord && (
        <div className={styles.base}>
          <div className={styles.quest}>{currentWord}</div>
          <input
            type="text"
            value={currentValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentValue(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.code === 'Enter') {
                handleClickOption(e.currentTarget.value)
              }
            }}
            className={clsx(
              styles.input,
              typings.isBoolean(currentResult) &&
                currentResult &&
                styles.input__true,
              typings.isBoolean(currentResult) &&
                !currentResult &&
                styles.input__false,
            )}
          />
          {currentOptions.length === 4 && (
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
          )}
          <div className={styles.next} onClick={handleNext}>
            Далее
          </div>
        </div>
      )}
    </>
  )
}
