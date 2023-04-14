import { createEffect, JSX, onCleanup, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useKeyboardHandler } from '../../contexts/App'

import { useTheme } from '../../contexts/Theme'

import styles from './Menu.module.css'

export interface Props {
  children: JSX.Element
  isOpen: boolean
  onClose: () => void
  anchor: HTMLElement | undefined
  maxHeight?: number
}

const width = 16
const rootFontSize = parseInt(
  window
    .getComputedStyle(document.body)
    .getPropertyValue('font-size')
    .split('px')[0]
)

export default function Menu(props: Props) {
  useKeyboardHandler({
    handler: (event) => {
      if (props.isOpen) {
        event.preventDefault()
        event.stopImmediatePropagation()
        event.stopPropagation()

        if (event.key === 'Escape') {
          props.onClose()
        }
      }
    },
    when: () => props.isOpen,
  })

  const [getTheme] = useTheme()
  const getXPosition = () => {
    const left = props.anchor?.getBoundingClientRect().left ?? 0
    const right = props.anchor?.getBoundingClientRect().right ?? 0
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    )

    // Set right instead of left if the menu extends passed the width of the screen
    if (left + width * rootFontSize > viewportWidth) {
      return { right: `${viewportWidth - right}px` }
    }

    return { left: `${left}px` }
  }

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class={styles.overlay} onClick={() => props.onClose()} />
        <div
          class={styles.menu}
          classList={{ [styles.dark]: getTheme()?.theme === 'dark' }}
          style={{
            top: `${props.anchor?.getBoundingClientRect().bottom ?? 0}px`,
            ...getXPosition(),
            width: `${width}rem`,
          }}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  )
}
