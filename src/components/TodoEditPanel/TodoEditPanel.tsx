import { createEffect, createSignal, onCleanup } from 'solid-js'
import { format } from 'date-fns'

import { TodoItem } from '../../types/Models'
import IconButton from '../IconButton'
import TextField from '../TextField'
import Select, { Option } from '../Select'
import { ValueOf } from '../../utils/ValueOf'
import { useTheme } from '../../contexts/Theme'

import styles from './TodoEditPanel.module.css'
import { UpdateTodoItemArgs } from '../../types/Operations'

interface Tag {
  id: string
  name: string
  color: string
}

export interface Props {
  item: TodoItem | undefined
  tags: Tag[]
  updateTodoItem: (
    id: string,
    fieldName: keyof UpdateTodoItemArgs,
    value: ValueOf<UpdateTodoItemArgs>
  ) => void
  onClose: () => void
  isOpen: boolean
}

const rootFontSize = parseInt(
  window
    .getComputedStyle(document.body)
    .getPropertyValue('font-size')
    .split('px')[0]
)

export default function TodoEditPanel(props: Props) {
  const [theme] = useTheme()
  const [getIsClosing, setIsClosing] = createSignal(false)
  const [getIsResizing, setIsResizing] = createSignal(false)
  const [getMouseX, setMouseX] = createSignal<number>()

  const handleCloseButtonClick = () => {
    setIsClosing(true)
  }

  const closePanel = () => {
    if (getIsClosing() === true) {
      setIsClosing(false)
      props.onClose()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    setMouseX(e.clientX)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      setIsClosing(true)
    }
  }

  createEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
  })

  createEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('keydown', handleKeyDown)
  })

  const getPanelLeftValue = () => {
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    )
    const maxLeft = viewportWidth - 15 * rootFontSize
    const mouseX = getMouseX() ?? 0

    if (mouseX && mouseX >= maxLeft) {
      return `${maxLeft}px`
    }

    return `${mouseX}px`
  }

  return (
    <div
      class={styles['todo-edit-panel']}
      classList={{
        [styles['todo-edit-panel--open']]: props.isOpen,
        [styles['todo-edit-panel-closing']]: getIsClosing(),
        [styles.dark]: theme().theme === 'dark',
      }}
      style={{
        left: getIsResizing() ? getPanelLeftValue() : undefined,
      }}
      onAnimationEnd={closePanel}
    >
      <div
        class={styles['resizer']}
        onMouseDown={(e) => {
          e.preventDefault()
          setIsResizing(true)
        }}
        onMouseUp={() => setIsResizing(false)}
      />
      <div class={styles['close-button-container']}>
        <IconButton icon="fa-solid fa-xmark" onClick={handleCloseButtonClick} />
      </div>
      <div class={styles['inputs-container']}>
        <TextField
          value={props.item?.title ?? ''}
          onChange={(e) =>
            props.updateTodoItem(
              props.item?.id ?? '',
              'title',
              e.currentTarget.value ?? ''
            )
          }
          fullWidth
          label="Title"
        />
        <TextField
          value={props.item?.description ?? ''}
          onChange={(e) =>
            props.updateTodoItem(
              props.item?.id ?? '',
              'description',
              e.currentTarget.value ?? ''
            )
          }
          fullWidth
          label="Description"
        />
        <TextField
          value={
            props.item
              ? format(props.item.dateCreated, 'yyyy-MM-dd hh:mm a')
              : ''
          }
          fullWidth
          isDisabled
          label="Date Created"
        />
        <TextField
          value={
            props.item?.dateCompleted
              ? format(props.item.dateCompleted, 'yyyy-MM-dd hh:mm a')
              : ''
          }
          fullWidth
          isDisabled
          label="Date Completed"
        />
        <TextField
          value={props.item?.notes ?? ''}
          fullWidth
          label="Notes"
          onChange={(e) =>
            props.updateTodoItem(
              props.item?.id ?? '',
              'notes',
              e.currentTarget.value ?? ''
            )
          }
          multiline
          classes={{ input: styles['notes'] }}
        />
        <Select
          fullWidth
          label="Tags"
          options={props.tags.map((tag) => ({
            label: tag.name,
            value: tag.id,
          }))}
          onChange={async (newValues: Option<string>[]) => {
            // props.updateTodoItem(
            //   props.item.id,
            //   'tags',
            //   newValues.map((v) => ({ id: v.value }))
            // )
          }}
          values={props.item?.tags.map((tag) => tag.id) ?? []}
        />
      </div>
    </div>
  )
}
