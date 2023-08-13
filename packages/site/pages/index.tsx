import React from 'react'
import HeaderContainer from '../components/HeaderContainer/HeaderContainer'
import styles from './index.module.scss'
import { typings, utils } from 'common/utils'

const Index = () => {
  function handleOpenSocket(e: Event) {
    console.log('open ______________')
    console.log(e)
  }
  function handleMessageSocket(e: MessageEvent) {
    console.log('message ______________')
    console.log(e)
  }
  function handleErrorSocket(e: Event) {
    console.log('error ______________')
    console.log(e)
  }
  function handleCloseSocket(e: CloseEvent) {
    console.log('close ______________')
    console.log(e)
  }

  const [filterSocket, setFilterSocket] = React.useState<WebSocket | null>(null)

  function handleClick() {
    console.log('test')
    console.log(filterSocket)
    filterSocket?.send('events')
  }

  React.useEffect(() => {
    const filterSocket = new WebSocket('ws://localhost:3000/word')
    if (filterSocket) {
      filterSocket.onopen = handleOpenSocket
      filterSocket.onmessage = handleMessageSocket
      filterSocket.onclose = handleCloseSocket
      filterSocket.onerror = handleErrorSocket
      setFilterSocket(filterSocket)
    }
    return () => {
      if (filterSocket) {
        filterSocket.close(1000, 'Work complete')
      }
    }
  }, [])

  React.useEffect(() => {
    // console.log(typings.isString('test'))
    // console.log(typings.isString(''))
    // console.log(utils.common.getId())
    // console.log('test')
    // console.log(process.env.NEXT_PUBLIC_TEST)
  }, [])

  return (
    <>
      <HeaderContainer title="Main" keyword="lol">
        <div>
          <div onClick={handleClick}>click</div>
          <h1 className={styles.base}>qwq</h1>
          <div className={styles.one}>
            Тестовое представление теста Test words by ROBOTO
          </div>
          <div className={styles.three}>
            Тестовое представление теста Test words by ROBOTO
          </div>
          <div className={styles.four}>
            Тестовое представление теста Test words by ROBOTO
          </div>
          <div className={styles.five}>
            Тестовое представление теста Test words by ROBOTO
          </div>
          <div className={styles.seven}>
            Тестовое представление теста Test words by ROBOTO
          </div>
          <div className={styles.nine}>
            Тестовое представление теста Test words by ROBOTO
          </div>
        </div>
      </HeaderContainer>
    </>
  )
}
export default Index
