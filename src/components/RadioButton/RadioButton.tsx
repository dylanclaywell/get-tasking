import { createUniqueId } from 'solid-js'

import { useTheme } from '../../contexts/Theme'

import styles from './RadioButton.module.css'

export interface Props {
  onChange: (isChecked: boolean) => void
  value: string
  group: string
  label: string
  isChecked: boolean
}

export default function RadioButton(props: Props) {
  const [getThemeState] = useTheme()
  const id = createUniqueId()

  return (
    <label
      for={id}
      class={styles['radio-button']}
      classList={{
        [styles['radio-button--neu']]: getThemeState().theme === 'neu',
      }}
    >
      {props.label}
      <input
        checked={props.isChecked}
        type="radio"
        id={id}
        value={props.value}
        name={props.group}
        onClick={(event) => {
          props.onChange(event.currentTarget.checked)
        }}
      />
      <span class={styles['radio-button__checkmark']} />
    </label>
  )
}
