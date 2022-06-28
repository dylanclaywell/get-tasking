import { JSX } from 'solid-js'

import styles from './Fab.module.css'

export interface Props {
  onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  icon: JSX.Element
}

export default function Fab(props: Props) {
  return (
    <button class={styles['fab']} onClick={props.onClick}>
      {props.icon}
    </button>
  )
}
