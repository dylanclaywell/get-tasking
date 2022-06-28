import { useTheme } from '../../contexts/Theme'
import MenuItem from '../MenuItem'
import type { AppContext } from '../../pages/main'
import Icon from '../Icon'

import styles from './AppPanel.module.css'

export interface Props {
  setAppContext: (name: AppContext) => void
}

export default function AppPanel(props: Props) {
  const [getThemeState] = useTheme()

  return (
    <div
      class={styles['app-panel']}
      classList={{
        [styles['dark']]: getThemeState().theme === 'dark',
      }}
    >
      <div>
        <MenuItem
          icon="check"
          isRounded={false}
          onClick={() => props.setAppContext('todo')}
        >
          Todo
        </MenuItem>
        <MenuItem
          icon="settings"
          isRounded={false}
          onClick={() => props.setAppContext('settings')}
        >
          Settings
        </MenuItem>
      </div>
    </div>
  )
}
