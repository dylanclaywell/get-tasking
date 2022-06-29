import { createSignal, createEffect, onCleanup, Show } from 'solid-js'

import Fab from '../Fab'
import { useTheme } from '../../contexts/Theme'
import Icon from '../Icon'
import InputModal from './InputModal'
import { useKeyboardHandler } from '../../contexts/App'

export interface Props {
  addTodoItem: (value: string) => void
  canOpen: boolean
}

export default function AddTodoItemWidget(props: Props) {
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
    if (event.key === 'a' && !getInputIsOpen() && props.canOpen) {
      event.preventDefault()
      event.stopImmediatePropagation()
      setInputIsOpen(true)
    }

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
      <Show when={!getInputIsOpen()}>
        <Fab
          relativeToParent
          onClick={() => setInputIsOpen(true)}
          icon={<Icon name="plus" />}
        />
      </Show>
    </>
  )
}
