import { createSignal, createEffect, Show, onCleanup } from 'solid-js'

import Fab from '../Fab'
import { useTheme } from '../../contexts/Theme'
import Icon from '../Icon'
import InputModal from './InputModal'
import { useKeyboardHandler } from '../../contexts/App'
import classnames from 'classnames'

import styles from './AddTodoItemWidget.module.css'

export interface Props {
  addTodoItem: (value: string) => void
  canOpen: boolean
}

export default function AddTodoItemWidget(props: Props) {
  const [getThemeState] = useTheme()
  const [getInputRef, setInputRef] = createSignal<HTMLInputElement>()
  const [getInputValue, setInputValue] = createSignal('')
  const [getInputIsOpen, setInputIsOpen] = createSignal(false)
  const [getInputIsExiting, setInputIsExiting] = createSignal(false)
  const [getUseMultipleEntries, setUseMultipleEntries] = createSignal(false)

  function handleKeyDownWhenAddingItem(event: KeyboardEvent) {
    if (event.key === 'Enter' && getInputValue() !== '') {
      props.addTodoItem(getInputValue())
      setInputValue('')

      if (!getUseMultipleEntries()) {
        closeAddTodoItemPrompt()
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopImmediatePropagation()
      closeAddTodoItemPrompt()
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (getInputIsOpen() && !getInputIsExiting()) {
      handleKeyDownWhenAddingItem(event)
    }
  }

  useKeyboardHandler({
    handler: handleKeyDown,
    when: () => Boolean(getInputIsOpen() && getInputRef()),
  })

  const closeAddTodoItemPrompt = () => {
    setInputIsExiting(true)
  }

  createEffect(() => {
    const inputRef = getInputRef()
    if (getInputIsOpen() && inputRef) {
      inputRef.focus()
    }
  })

  // Adding an event handler specifically for being able to add a new item
  // when this app widget is open (regardless of the state of the input modal).
  function handleGlobalKeyDown(event: KeyboardEvent) {
    if (event.key === 'a' && !getInputIsOpen() && props.canOpen) {
      event.preventDefault()
      event.stopImmediatePropagation()
      setInputIsOpen(true)
    }
  }
  document.addEventListener('keydown', handleGlobalKeyDown)
  onCleanup(() => {
    document.removeEventListener('keydown', handleGlobalKeyDown)
  })

  return (
    <>
      <InputModal
        isExiting={getInputIsExiting()}
        setInputRef={(el) => setInputRef(el)}
        isOpen={getInputIsOpen()}
        onChange={(e) => setInputValue(e.currentTarget?.value ?? '')}
        setIsExiting={setInputIsExiting}
        setIsOpen={setInputIsOpen}
        value={getInputValue()}
      />
      <Show when={getThemeState().theme === 'neu' || !getInputIsOpen()}>
        <Fab
          classes={classnames({
            [styles['add-todo-item-widget--neu']]:
              getThemeState().theme === 'neu' && getInputIsOpen(),
          })}
          relativeToParent
          onClick={() => setInputIsOpen(true)}
          icon={<Icon name="plus" />}
        />
      </Show>
    </>
  )
}
