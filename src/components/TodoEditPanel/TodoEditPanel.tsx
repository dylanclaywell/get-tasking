import { createEffect, createSignal, onCleanup, Setter } from 'solid-js'
import { format } from 'date-fns'

import { TodoItem } from '../../types/Models'
import IconButton from '../IconButton'
import TextField from '../TextField'
import Select, { Option } from '../Select'
import { ValueOf } from '../../utils/ValueOf'
import { useTheme } from '../../contexts/Theme'

import styles from './TodoEditPanel.module.css'
import { UpdateTodoItemArgs } from '../../types/Operations'
import { useKeyboardHandler } from '../../contexts/App'
import { invoke } from '@tauri-apps/api'

interface Tag {
  id: string
  name: string
  color: string
}

export interface Props {
  item: TodoItem | undefined
  tags: Tag[]
  mutateTodoItems: Setter<TodoItem[] | undefined>
  updateTodoItem: (
    id: string,
    fieldName: keyof UpdateTodoItemArgs,
    value: ValueOf<UpdateTodoItemArgs>
  ) => void
  onClose: () => void
  setIsClosing: (isClosing: boolean) => void
  isOpen: boolean
  isClosing: boolean
}

const rootFontSize = parseInt(
  window
    .getComputedStyle(document.body)
    .getPropertyValue('font-size')
    .split('px')[0]
)

export default function TodoEditPanel(props: Props) {
  const [theme] = useTheme()

  const [getIsResizing, setIsResizing] = createSignal(false)
  const [getMouseX, setMouseX] = createSignal<number>()

  const closePanel = () => {
    if (props.isClosing === true) {
      props.setIsClosing(false)
      props.onClose()
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    setMouseX(e.clientX)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      props.setIsClosing(true)
    }
  }

  useKeyboardHandler({
    handler: handleKeyDown,
    when: () => props.isOpen,
  })

  createEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
  })

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove)
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
        [styles['todo-edit-panel-closing']]: props.isClosing,
        [styles['todo-edit-panel--neu']]: theme().theme === 'neu',
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
            const todoItemId = props.item?.id
            if (!todoItemId) return

            const existingTags = props.item?.tags ?? []
            const tagIds = newValues.map((v) => v.value)
            const tagsToAdd = props.tags.filter(
              (tag) =>
                tagIds.includes(tag.id) &&
                !existingTags.some((t) => t.id === tag.id)
            )
            const tagsToRemove = existingTags.filter(
              (tag) => !tagIds.includes(tag.id)
            )

            for (const tag of tagsToAdd) {
              await invoke('add_tag_to_todo_item', {
                todoItemId,
                tagId: tag.id,
              })

              props.mutateTodoItems((todoItems) => {
                if (!todoItems) return todoItems

                return todoItems.map((t) => {
                  if (t.id === todoItemId) {
                    return {
                      ...t,
                      tags: [...t.tags, ...tagsToAdd],
                    }
                  }

                  return t
                })
              })
            }

            for (const tag of tagsToRemove) {
              await invoke('remove_tag_from_todo_item', {
                todoItemId,
                tagId: tag.id,
              })

              props.mutateTodoItems((todoItems) => {
                if (!todoItems) return todoItems

                return todoItems.map((t) => {
                  if (t.id === todoItemId) {
                    return {
                      ...t,
                      tags: t.tags.filter((t) => t.id !== tag.id),
                    }
                  }

                  return t
                })
              })
            }
          }}
          values={props.item?.tags.map((tag) => tag.id) ?? []}
        />
      </div>
    </div>
  )
}
