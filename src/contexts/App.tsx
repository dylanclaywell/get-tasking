import {
  createSignal,
  createContext,
  useContext,
  JSX,
  Accessor,
  Show,
  onCleanup,
  createEffect,
} from 'solid-js'
import { v4 } from 'uuid'

interface KeyboardHandler {
  id: string
  handler: (e: KeyboardEvent) => void
}

export interface State {
  keyboardHandlers: KeyboardHandler[]
}

type Context = [
  Accessor<State>,
  {
    registerKeyboardHandler: (
      id: string,
      keyboardHandler: (event: KeyboardEvent) => void
    ) => string
    unregisterKeyboardHandler: (id: string) => void
  }
]

const AppContext = createContext<Context>([
  () => ({ keyboardHandlers: [] }),
  {
    registerKeyboardHandler: () => '',
    unregisterKeyboardHandler: () => undefined,
  },
])

interface Props {
  children: JSX.Element
}

export default function AppProvider(props: Props) {
  const [getState, setState] = createSignal<State>({
    keyboardHandlers: [],
  })

  const store: Context = [
    getState,
    {
      registerKeyboardHandler: (id, keyboardHandler) => {
        // Prevent an infinite loop
        if (getState().keyboardHandlers.find((h) => h.id === id)) {
          return id
        }

        setState((prevState) => {
          return {
            ...prevState,
            keyboardHandlers: [
              ...prevState.keyboardHandlers,
              {
                id,
                handler: keyboardHandler,
              },
            ],
          }
        })
        return id
      },
      unregisterKeyboardHandler: (id: string) => {
        setState((prevState) => {
          return {
            ...prevState,
            keyboardHandlers: prevState.keyboardHandlers.filter(
              (handler) => handler.id !== id
            ),
          }
        })
      },
    },
  ]

  function handleKeyDown(event: KeyboardEvent) {
    const handlers = getState().keyboardHandlers
    handlers.length && handlers[handlers.length - 1]?.handler(event)
  }

  document.addEventListener('keydown', handleKeyDown)

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  )
}

export function useKeyboardHandler({
  handler,
  when: shouldRegister,
}: {
  handler: (e: KeyboardEvent) => void
  when?: () => boolean
}): {
  register: () => void
  unregister: () => void
} {
  const id = v4()
  const [, { registerKeyboardHandler, unregisterKeyboardHandler }] =
    useContext(AppContext)

  function register() {
    registerKeyboardHandler(id, handler)
  }

  function unregister() {
    unregisterKeyboardHandler(id)
  }

  createEffect(() => {
    if (shouldRegister?.()) {
      register()
    } else if (!shouldRegister?.()) {
      unregister()
    }
  })

  onCleanup(() => {
    unregister()
  })

  return { register, unregister }
}
