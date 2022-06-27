import { JSX } from 'solid-js'
import classnames from 'classnames'

import styles from './Switch.module.css'

export interface Props {
  isChecked: boolean
  label: string
  labelIsOnLeft?: boolean
  onClick: JSX.EventHandler<HTMLInputElement, MouseEvent>
}

export default function Switch(props: Props) {
  return (
    <div
      class={classnames(styles['root'], {
        [styles['root-reverse']]: props.labelIsOnLeft,
      })}
    >
      <label class={styles['switch']}>
        <input
          class={styles['input']}
          type="checkbox"
          checked={props.isChecked}
          onClick={props.onClick}
        />
        <span
          class={classnames(styles['toggle'], {
            [styles['toggle-checked']]: props.isChecked,
          })}
        ></span>
      </label>
      <span>{props.label}</span>
    </div>
  )
}
