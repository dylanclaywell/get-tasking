import { JSX, Show } from 'solid-js'
import { Portal } from 'solid-js/web'

import TextField from '../TextField'

import styles from './InputModal.module.css'

export interface Props {
  isOpen: boolean
  isExiting: boolean
  onChange: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
  value: string
  setInputRef: (ref: HTMLInputElement) => void
  setIsOpen: (isOpen: boolean) => void
  setIsExiting: (isExiting: boolean) => void
}

export default function InputModal(props: Props) {
  return (
    <Show when={props.isOpen}>
      <Portal>
        <div
          class={styles['input-modal__overlay']}
          classList={{
            [styles['input-modal__overlay--open']]: props.isOpen,
          }}
        />
        <div
          class={styles['input-modal__input-container']}
          classList={{
            [styles['input-modal__input-container--leaving']]: props.isExiting,
          }}
          onAnimationEnd={() => {
            if (props.isExiting) {
              props.setIsOpen(false)
              props.setIsExiting(false)
              props.onChange(
                new InputEvent('change') as InputEvent & {
                  currentTarget: HTMLInputElement
                }
              )
            }
          }}
        >
          <TextField
            fullWidth
            forwardRef={props.setInputRef}
            label="Title"
            value={props.value}
            onChange={props.onChange}
            inputProps={{
              className: styles['input-modal__input-control'],
            }}
          />
        </div>
      </Portal>
    </Show>
  )
}
