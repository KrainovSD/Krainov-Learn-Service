import React from 'react'
import HeaderContainer from '../components/HeaderContainer/HeaderContainer'
import styles from './index.module.scss'
import { WebsocketComponent } from 'components/Websocket'

const Index = () => {
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
        <WebsocketComponent />
      </HeaderContainer>
    </>
  )
}
export default Index
