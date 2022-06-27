import {
  createSignal,
  createContext,
  useContext,
  JSX,
  Accessor,
  createResource,
  createEffect,
} from 'solid-js'

type Theme = 'light' | 'dark'

interface State {
  theme: Theme
}

type Context = [
  Accessor<State>,
  {
    setTheme: (theme: Theme) => void
  }
]

const initialState: Accessor<State> = () => ({ theme: 'light' })

const initialValues: Context = [initialState, { setTheme: () => undefined }]

const ThemeContext = createContext<Context>(initialValues)

interface Props {
  children: JSX.Element
}

async function fetchTheme({ uid }: { uid: string | null }) {
  if (!uid) {
    console.error('No uid')
    return
  }

  // const response = await query<null, Theme>(getThemeQuery)
  const response = {
    data: {
      theme: 'dark',
    },
  }

  if (!response || 'errors' in response) {
    console.error('Error getting tags')
    return
  }

  return response
}

export default function ThemeProvider(props: Props) {
  const [getState, setState] = createSignal<State>(initialState())
  const store: Context = [
    getState,
    {
      setTheme(theme: Theme) {
        document.documentElement.style.setProperty(
          '--default-background-color',
          `var(--light-mode-background-color)`
        )
        document.documentElement.style.setProperty(
          '--default-text-color',
          `var(--light-mode-text-color)`
        )

        setState({ ...getState(), theme })
      },
    },
  ]

  document.documentElement.style.setProperty(
    '--default-background-color',
    `var(--light-mode-background-color)`
  )
  document.documentElement.style.setProperty(
    '--default-text-color',
    `var(--light-mode-text-color)`
  )

  return (
    <ThemeContext.Provider value={store}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
