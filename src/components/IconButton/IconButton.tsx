import { JSX } from 'solid-js'
import classnames from 'classnames'

import styles from './IconButton.module.css'
import { useTheme } from '../../contexts/Theme'

export interface Props {
  icon: string
  ref?: (el: HTMLButtonElement) => void
  onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>
}

export default function IconButton(props: Props) {
  const [themeState] = useTheme()

  return (
    <button
      ref={props.ref}
      onClick={props.onClick}
      class={classnames(styles['button'], {
        [styles['button-dark']]: themeState()?.theme === 'dark',
      })}
    >
      <i class={props.icon}></i>
    </button>
  )
}
