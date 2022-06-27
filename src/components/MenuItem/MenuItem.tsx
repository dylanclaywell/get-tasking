import { JSX } from 'solid-js'
import classnames from 'classnames'

import { useTheme } from '../../contexts/Theme'

import styles from './MenuItem.module.css'

export interface Props {
  children: JSX.Element
  classes?: string
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  isRounded?: boolean
  icon?: string
}

export default function MenuItem(props: Props) {
  const [themeState] = useTheme()

  return (
    <div
      onClick={props.onClick}
      class={classnames(props.classes, styles['menu-item'], {
        [styles['menu-item-rounded']]: props.isRounded ?? true,
        [styles['dark']]: themeState()?.theme === 'dark',
      })}
    >
      {props.icon ? (
        <i class={classnames(props.icon, styles['menu-item-icon'])}></i>
      ) : null}
      {props.children}
    </div>
  )
}
