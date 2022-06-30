import { JSX } from 'solid-js'
import classnames from 'classnames'

import { useTheme } from '../../contexts/Theme'

import styles from './MenuItem.module.css'
import Icon, { IconName } from '../Icon'

export interface Props {
  children: JSX.Element
  classes?: string
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  isRounded?: boolean
  icon?: IconName
}

export default function MenuItem(props: Props) {
  const [getThemeState] = useTheme()

  return (
    <div
      onClick={props.onClick}
      class={classnames(
        styles['menu-item'],
        {
          [styles['menu-item--rounded']]: props.isRounded ?? true,
          [styles['menu-item--neu']]: getThemeState()?.theme === 'neu',
        },
        props.classes
      )}
    >
      {props.icon ? (
        <Icon
          name={props.icon}
          className={classnames(styles['menu-item__icon'])}
        />
      ) : null}
      {props.children}
    </div>
  )
}
