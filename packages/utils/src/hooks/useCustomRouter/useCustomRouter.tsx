import { useRouter } from 'next/router'
import React from 'react'
import { ParsedUrlQuery } from 'querystring'

type Router = {
  pathname: string
  query: ParsedUrlQuery
}

export function useCustomRouter() {
  const initialRouter = useRouter()
  const [router, setRouter] = React.useState<Router>({
    pathname: '',
    query: {},
  })

  function setUrlWithRender(pathname: string, query?: ParsedUrlQuery) {
    if (typeof pathname !== 'string') return
    if (query) initialRouter.push({ pathname, query })
    else initialRouter.push({ pathname })
  }
  function setUrlWithOutRender(pathname: string, query?: ParsedUrlQuery) {
    if (typeof pathname !== 'string') return
    if (query)
      initialRouter.push(
        { pathname, query },
        { pathname, query },
        { shallow: true },
      )
    else initialRouter.push({ pathname }, { pathname }, { shallow: true })
  }

  React.useLayoutEffect(() => {
    setRouter((prevValue) => ({
      ...prevValue,
      pathname: initialRouter.pathname,
    }))
  }, [initialRouter.pathname])

  React.useLayoutEffect(() => {
    setRouter((prevValue) => ({ ...prevValue, query: initialRouter.query }))
  }, [initialRouter.query])

  return { router, setUrlWithOutRender, setUrlWithRender }
}
