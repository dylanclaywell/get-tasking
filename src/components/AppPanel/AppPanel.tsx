import classnames from 'classnames'

import { useTheme } from '../../contexts/Theme'
import MenuItem from '../MenuItem'
import type { AppContext } from '../../pages/main'

import styles from './AppPanel.module.css'

export interface Props {
  currentAppContext: AppContext
  setAppContext: (name: AppContext) => void
}

export default function AppPanel(props: Props) {
  const [getThemeState] = useTheme()

  return (
    <div
      class={styles['app-panel']}
      classList={{
        [styles['app-panel--neu']]: getThemeState().theme === 'neu',
      }}
    >
      <div>
        <div
          class={classnames(styles['app-panel__menu-item'], {
            [styles['app-panel__menu-item--neu']]:
              getThemeState().theme === 'neu',
            [styles['app-panel__menu-item--active']]:
              props.currentAppContext === 'todo',
          })}
          onClick={() => props.setAppContext('todo')}
        >
          Todo
        </div>
        <div
          class={classnames(styles['app-panel__menu-item'], {
            [styles['app-panel__menu-item--neu']]:
              getThemeState().theme === 'neu',
            [styles['app-panel__menu-item--active']]:
              props.currentAppContext === 'settings',
          })}
          onClick={() => props.setAppContext('settings')}
        >
          Settings
        </div>
      </div>
    </div>
  )
}
