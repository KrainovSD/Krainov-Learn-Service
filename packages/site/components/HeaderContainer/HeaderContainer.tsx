import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect } from 'react'

type Props = {
  keyword: string
  title: string
}

export default function HeaderContainer({
  children,
  keyword,
  title,
}: PropsWithChildren<Props>) {
  const router = useRouter()
  const clickHandlerOne = () => {
    router.push(
      router.pathname,
      {
        pathname: router.pathname,
        query: { test: 1 },
      },
      { shallow: true },
    )
  }
  const clickHandlerTwo = () => {
    router.push(
      {
        pathname: router.pathname,
        query: { test: 2 },
      },
      {
        pathname: router.pathname,
        query: { test: 2 },
      },
      { shallow: true },
    )
  }

  useEffect(() => {}, [router.query])

  return (
    <>
      <Head>
        {/* <meta keywords={`test next react js ${keyword}`}></meta> */}
        <title>{title}</title>
      </Head>
      <div>
        <Link href="/"> Главная</Link>
        <Link href="/users"> Юзеры</Link>
      </div>
      <div>
        <button onClick={clickHandlerOne}>1</button>
        <button onClick={clickHandlerTwo}>2</button>
      </div>
      <div>{children}</div>
    </>
  )
}
