import { SocketMessage, useWebsocket } from 'helpers'
import React from 'react'
import styles from './Websocket.module.scss'
import clsx from 'clsx'
import { typings, utils } from '@krainov/kls-utils'

type Messages = WordsMessage | AnswerMessage | RestoreMessage | CompleteMessage
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
type RestoreMessage = {
  event: 'restore'
  data: Record<string, any>
}
type CompleteMessage = {
  event: 'complete'
  data: {
    message: string
  }
}

export function WebsocketComponent() {
  const [currentWord, setCurrentWord] = React.useState<string | null>(null)
  const [currentOptions, setCurrentOptions] = React.useState<string[]>([])
  const [currentValue, setCurrentValue] = React.useState('')
  const currentIdRef = React.useRef<string | null>(null)
  const [isWaiting, setIsWaiting] = React.useState(false)
  const [currentResult, setCurrentResult] = React.useState<boolean | null>(null)
  const [currentChoose, setCurrentChoose] = React.useState<string | null>(null)
  const [isHasSession, setIsHasSession] = React.useState(false)
  const [completeMessage, setCompleteMessage] = React.useState<null | string>(
    null,
  )

  const [currentType, setCurrentType] = React.useState('known')

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
        break
      }
      case 'restore': {
        setIsHasSession(true)
        break
      }
      case 'complete': {
        setCompleteMessage(message.data.message)
        break
      }
      default: {
        break
      }
    }
  }
  function handleClose(code: number, reason: string) {
    console.log(code, reason)
  }
  function startLearn(kind: string) {
    sendMessage('start', {
      type: currentType,
      kind,
    })
    setCompleteMessage(null)
  }

  function handleClickOption(option: string) {
    if (isWaiting) return

    setCurrentChoose(option)
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
    setCurrentChoose(null)
    sendMessage('next', '')
  }

  function handleRestore(isRestore?: boolean) {
    sendMessage('restore', {
      isRestore,
    })
    setIsHasSession(false)
  }

  const type = ['known', 'repeat', 'learn', 'learnOff']

  return (
    <>
      <div className={styles.buttons}>
        <select
          value={currentType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setCurrentType(e.target.value)
          }}
        >
          {type.map((item) => {
            return (
              <option value={item} key={item}>
                {item}
              </option>
            )
          })}
        </select>
        <button
          style={{ fontSize: '20px', padding: '10px' }}
          onClick={() => startLearn('normal')}
        >
          Start learn normal
        </button>
        <button
          style={{ fontSize: '20px', padding: '10px' }}
          onClick={() => startLearn('reverse')}
        >
          Start learn reverse
        </button>
      </div>

      {completeMessage && <div className={styles.complete}></div>}

      {!completeMessage && (
        <>
          {isHasSession && (
            <div className={styles.restore}>
              <div>Вы действительно хотите продолжить?</div>
              <button onClick={() => handleRestore(true)}>да</button>
              <button onClick={() => handleRestore(false)}>нет</button>
            </div>
          )}

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
                <div className={clsx(styles.options)}>
                  {currentOptions.map((option) => {
                    return (
                      <div
                        className={clsx(
                          styles.option,
                          typings.isBoolean(currentResult) &&
                            currentResult &&
                            currentChoose === option &&
                            styles.option__true,
                          typings.isBoolean(currentResult) &&
                            !currentResult &&
                            currentChoose === option &&
                            styles.option__false,
                        )}
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
      )}
    </>
  )
}
