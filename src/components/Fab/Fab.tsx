import { JSX, Show } from 'solid-js'

import styles from './Fab.module.css'

export interface Props {
  onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  icon: JSX.Element
  relativeToParent?: boolean
}

export default function Fab(props: Props) {
  const fab = (
    <button
      class={styles['fab']}
      classList={{
        [styles['fab--relative-to-parent']]: props.relativeToParent,
      }}
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
