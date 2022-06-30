import { createSignal, Match, Switch } from 'solid-js'

import TodoList from '../components/TodoList'
import Settings from '../components/Settings'
import AppPanel from '../components/AppPanel/AppPanel'

import styles from './main.module.css'
import { useTheme } from '../contexts/Theme'

export type AppContext = 'todo' | 'settings'

export default function Main() {
  const [getThemeState] = useTheme()
  const [getAppContext, setAppContext] = createSignal<AppContext>('todo')

  return (
    <div
      class={styles.main}
      classList={{
        [styles['main--neu']]: getThemeState().theme === 'neu',
      }}
    >
      <AppPanel
        setAppContext={setAppContext}
        currentAppContext={getAppContext()}
      />
      <Switch>
        <Match when={getAppContext() === 'todo'}>
          <TodoList />
        </Match>
        <Match when={getAppContext() === 'settings'}>
          <Settings />
        </Match>
      </Switch>
    </div>
  )
}
