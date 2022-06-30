import classnames from 'classnames'
import { JSX, Show } from 'solid-js'

import { useTheme } from '../../contexts/Theme'

import styles from './Fab.module.css'

export interface Props {
  onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  icon: JSX.Element
  relativeToParent?: boolean
  classes?: string
}

export default function Fab(props: Props) {
  const [getThemeState] = useTheme()
  const fab = (
    <button
      class={classnames(
        styles['fab'],
        {
          [styles['fab--relative-to-parent']]: props.relativeToParent,
          [styles['fab--neu']]: getThemeState().theme === 'neu',
        },
        props.classes
      )}
      onClick={props.onClick}
    >
      {props.icon}
    </button>
  )

  return (
    <Show when={props.relativeToParent} fallback={fab}>
      <div class={styles['container']}>{fab}</div>
    </Show>
  )
}
