import { JSX } from 'solid-js'
import classnames from 'classnames'

import styles from './IconButton.module.css'
import { useTheme } from '../../contexts/Theme'
import Icon, { IconName } from '../Icon'

export interface Props {
  icon: IconName
  ref?: (el: HTMLButtonElement) => void
  onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  color?: 'default' | 'primary'
  classes?: {
    root?: string
  }
}

export default function IconButton(props: Props) {
  const [themeState] = useTheme()

  return (
    <button
      ref={props.ref}
      onClick={props.onClick}
      class={classnames(
        styles['button'],
        {
          [styles['button--primary']]: props.color === 'primary',
          [styles['button--default']]:
            props.color === 'default' || !props.color,
        },
        props.classes?.root
      )}
    >
      <i class={props.icon}></i>
      <Icon name={props.icon} />
    </button>
  )
}
