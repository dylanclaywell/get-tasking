import {
  createEffect,
  createResource,
  createSignal,
  Index,
  Suspense,
  useContext,
} from 'solid-js'
import { format } from 'date-fns'
import { debounce } from 'debounce'

import TodoCard from '../TodoCard'
import TodoEditPanel from '../TodoEditPanel'
import { Tag } from '../../generated/graphql'
import AddTodoItemWidget from '../AddTodoItemWidget'
import DateHeader from '../DateHeader'
import SkeletonTodoCard from '../SkeletonTodoCard'
import { ValueOf } from '../../utils/ValueOf'
import { useTheme } from '../../contexts/Theme'

import styles from './TodoList.module.css'
import { invoke } from '@tauri-apps/api'
import { TodoItem, TodoItemModel } from '../../types/Models'
import { UpdateTodoItemArgs } from '../../types/Operations'
import { TagsContext } from '../../contexts/Tags'

function padDateComponent(component: number) {
  return component < 10 ? `0${component}` : component
}

function getDateStringWithoutTime(date: Date) {
  return `${date.getFullYear()}-${padDateComponent(
    date.getMonth() + 1
  )}-${padDateComponent(date.getDate())}`
}

function getTimeStringWithoutDate(date: Date) {
  return `${padDateComponent(date.getHours())}:${padDateComponent(
    date.getMinutes()
  )}`
}

function getTimezoneStringWithoutDate(date: Date) {
  return format(date, 'XXX')
}

function getDateFromComponents({
  date,
  time,
  timezone,
}: {
  date: string
  time: string
  timezone: string
}) {
  return new Date(`${date}T${time}${timezone}`)
}

async function fetchTodoItemTags(id: string) {
  return JSON.parse(
    await invoke('get_todo_item_tags', { todoItemId: id })
  ) as Tag[]
}

async function fetchTodoItems({
  currentDate,
}: {
  currentDate: Date
}): Promise<TodoItem[]> {
  const todoItems = JSON.parse(
    await invoke('get_todo_items', {
      dateCompleted: getDateStringWithoutTime(currentDate),
    })
  ) as TodoItemModel[]

  return await Promise.all(
    todoItems.map(async (todoItem) => {
      return {
        id: todoItem.id,
        title: todoItem.title,
        description: todoItem.description,
        dateCreated: getDateFromComponents({
          date: todoItem.date_created,
          time: todoItem.time_created,
          timezone: todoItem.timezone_created,
        }),
        dateCompleted:
          todoItem.date_completed &&
          todoItem.time_completed &&
          todoItem.timezone_completed
            ? getDateFromComponents({
                date: todoItem.date_completed,
                time: todoItem.time_completed,
                timezone: todoItem.timezone_completed,
              })
            : null,
        notes: todoItem.notes,
        tags: await fetchTodoItemTags(todoItem.id),
        isCompleted: todoItem.is_completed,
      }
    })
  )
}

async function fetchTags() {
  return await invoke('get_tags')
}

export default function TodoList() {
  const [tagsState] = useContext(TagsContext)
  const [theme] = useTheme()
  const [getPanelIsClosing, setPanelIsClosing] = createSignal(false)
  const [getCurrentDate, setCurrentDate] = createSignal<Date>(new Date())
  const [todoItems, { mutate }] = createResource(
    () => ({ currentDate: getCurrentDate() }),
    fetchTodoItems
  )
  const [getSelectedItemId, setSelectedItemId] = createSignal<string>()

  const getSelectedItem = () =>
    todoItems()?.find((item) => item.id === getSelectedItemId())

  const getIncompleteItems = () =>
    todoItems()
      ?.filter((item) => !item.isCompleted)
      .sort((a, b) => {
        return a.dateCreated.getTime() - b.dateCreated.getTime()
      })
  const getCompletedItems = () =>
    todoItems()
      ?.filter((item) => {
        const dateCompleted = item.dateCompleted
          ? new Date(item.dateCompleted)
          : undefined

        return (
          item.isCompleted &&
          dateCompleted &&
          getDateStringWithoutTime(dateCompleted) ===
            getDateStringWithoutTime(getCurrentDate())
        )
      })
      .sort((a, b) => {
        // Forcing non-null assertion because the filter should ensure the dateCompleted is not null
        return a.dateCompleted!.getTime() - b.dateCompleted!.getTime()
      })

  const addTodoItem = async (title: string) => {
    const dateCreated = new Date()

    const createdTodoItem = JSON.parse(
      await invoke('create_todo_item', {
        title,
        dateCreated: getDateStringWithoutTime(dateCreated),
        timeCreated: getTimeStringWithoutDate(dateCreated),
        timezoneCreated: getTimezoneStringWithoutDate(dateCreated),
      })
    ) as TodoItemModel

    mutate((prev) => [
      ...(prev ?? []),
      {
        ...createdTodoItem,
        isCompleted: createdTodoItem.is_completed,
        dateCreated: getDateFromComponents({
          date: createdTodoItem.date_created,
          time: createdTodoItem.time_created,
          timezone: createdTodoItem.timezone_created,
        }),
        dateCompleted:
          createdTodoItem.date_completed &&
          createdTodoItem.time_completed &&
          createdTodoItem.timezone_completed
            ? getDateFromComponents({
                date: createdTodoItem.date_completed,
                time: createdTodoItem.time_completed,
                timezone: createdTodoItem.timezone_completed,
              })
            : null,
        tags: [],
      },
    ])
  }

  const deleteTodoItem = (id: string) => {
    mutate((prev) => prev?.filter((item) => item.id !== id) ?? [])

    void invoke('delete_todo_item', { id })
  }

  const toggleTodoItem = async (id: string, isCompleted: boolean) => {
    const currentDate = getCurrentDate()

    if (isCompleted) {
      await invoke('uncomplete_todo_item', {
        id,
      })
    } else {
      await invoke('complete_todo_item', {
        id,
        dateCompleted: getDateStringWithoutTime(currentDate),
        timeCompleted: getTimeStringWithoutDate(currentDate),
        timezoneCompleted: getTimezoneStringWithoutDate(currentDate),
      })
    }

    mutate((prev) =>
      (prev ?? []).map((item) => ({
        ...item,
        isCompleted: item.id === id ? !item.isCompleted : item.isCompleted,
        dateCompleted: item.id === id && isCompleted ? null : currentDate,
      }))
    )
  }

  const updateTodoItem = debounce(
    (
      id: string,
      fieldName: keyof UpdateTodoItemArgs,
      value: ValueOf<UpdateTodoItemArgs>
    ) => {
      mutate((prev) =>
        (prev ?? []).map((item) => ({
          ...item,
          ...(item.id === id && {
            uid: '',
            id,
            [fieldName]: value,
          }),
        }))
      )

      void invoke('update_todo_item', {
        id,
        [fieldName]: value,
      })
    },
    500
  )

  return (
    <>
      <div
        class={styles['todo-list']}
        classList={{
          [styles['todo-list--neu']]: theme().theme === 'neu',
        }}
      >
        <DateHeader
          currentDate={getCurrentDate()}
          setCurrentDate={(date) => {
            mutate(() => undefined)
            setCurrentDate(date)
          }}
        />

        <div class={styles['lists']}>
          <div class={styles['incomplete-list']}>
            <h2 class={styles['list-heading']}>Todo</h2>
            <Index each={getIncompleteItems()}>
              {(item, index) => (
                <TodoCard
                  style={{
                    'animation-duration': `${index * 20 + 300}ms`,
                  }}
                  id={item().id}
                  isSelected={item().id === getSelectedItemId()}
                  title={item().title}
                  isCompleted={item().isCompleted}
                  tags={item().tags}
                  onDelete={deleteTodoItem}
                  onComplete={toggleTodoItem}
                  onClick={(id) => () => {
                    if (getSelectedItemId() === id) {
                      setPanelIsClosing(true)
                    } else {
                      setSelectedItemId(id)
                    }
                  }}
                />
              )}
            </Index>
          </div>
          {getCompletedItems()?.length && (
            <div class={styles['complete-list']}>
              <h2 class={styles['list-heading']}>Done</h2>
              <Index each={getCompletedItems()}>
                {(item, index) => (
                  <TodoCard
                    style={{
                      'animation-duration': `${index * 10 + 300}ms`,
                    }}
                    id={item().id}
                    isSelected={item().id === getSelectedItemId()}
                    title={item().title}
                    isCompleted={item().isCompleted}
                    tags={item().tags}
                    onDelete={deleteTodoItem}
                    onComplete={toggleTodoItem}
                    onClick={(id) => () => {
                      if (getSelectedItemId() === id) {
                        setPanelIsClosing(true)
                      } else {
                        setSelectedItemId(id)
                      }
                    }}
                  />
                )}
              </Index>
            </div>
          )}
        </div>
        <AddTodoItemWidget
          addTodoItem={addTodoItem}
          canOpen={!getSelectedItem()}
        />
      </div>
      {
        <TodoEditPanel
          isClosing={getPanelIsClosing()}
          setIsClosing={setPanelIsClosing}
          isOpen={Boolean(getSelectedItem())}
          tags={tagsState().tags() ?? []}
          item={getSelectedItem() ?? undefined}
          updateTodoItem={updateTodoItem}
          onClose={() => {
            setSelectedItemId(undefined)
          }}
          mutateTodoItems={mutate}
        />
      }
    </>
  )
}
