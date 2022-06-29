import { createSignal, createEffect, onCleanup, Show } from 'solid-js'

import Fab from '../Fab'
import { useTheme } from '../../contexts/Theme'
import Icon from '../Icon'
import InputModal from './InputModal'

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

  const closeAddTodoItemPrompt = () => {
    setInputIsExiting(true)
  }

  const handleKeyDownWhenAddingItem = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && getInputValue() !== '') {
      props.addTodoItem(getInputValue())
      setInputValue('')

      if (!getUseMultipleEntries()) {
        closeAddTodoItemPrompt()
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopImmediatePropagation()
      closeAddTodoItemPrompt()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'a' && !getInputIsOpen() && props.canOpen) {
      e.preventDefault()
      e.stopImmediatePropagation()
      setInputIsOpen(true)
    }

    if (getInputIsOpen() && !getInputIsExiting()) {
      handleKeyDownWhenAddingItem(e)
    }
  }

  createEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  createEffect(() => {
    const inputRef = getInputRef()
    if (getInputIsOpen() && inputRef) {
      inputRef.focus()
    }
  })

  onCleanup(() =>
    document.removeEventListener('keydown', handleKeyDownWhenAddingItem)
  )

  return (
    <>
      <InputModal
        isExiting={getInputIsExiting()}
        setInputRef={(el) => setInputRef(el)}
        isOpen={getInputIsOpen()}
        onChange={(e) => setInputValue(e.currentTarget.value ?? '')}
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
