import { createResource, createSignal, Index, Suspense } from 'solid-js'
import { format } from 'date-fns'
import { debounce } from 'debounce'

import TodoCard from '../TodoCard'
import TodoEditPanel from '../TodoEditPanel'
import {
  Query,
  Mutation,
  MutationCreateTodoItemArgs,
  MutationDeleteTodoItemArgs,
  MutationUpdateTodoItemArgs,
  TodoItem as TodoItemGql,
  QueryTodoItemsArgs,
  Tag,
} from '../../generated/graphql'
import AddTodoItemWidget from '../AddTodoItemWidget'
import DateHeader from '../DateHeader'
import SkeletonTodoCard from '../SkeletonTodoCard'
import { ValueOf } from '../../utils/ValueOf'
import { useTheme } from '../../contexts/Theme'

import styles from './TodoList.module.css'
import { invoke } from '@tauri-apps/api'

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

async function fetchTodoItems({ currentDate }: { currentDate: Date }) {
  // const response = await query<QueryTodoItemsArgs, Query['todoItems']>(
  //   getTodoItemsQuery,
  //   {
  //     input: {
  //       dateCompleted: {
  //         date: getDateStringWithoutTime(currentDate),
  //       },
  //       filters: {
  //         overrideIncompleteItems: true,
  //       },
  //     },
  //   }
  // )

  console.log(getDateStringWithoutTime(currentDate))

  const blah = await invoke('get_todo_items', {
    dateCompleted: getDateStringWithoutTime(currentDate),
  })

  console.log(blah)

  const response: {
    data: {
      todoItems: TodoItemGql[]
    }
  } = {
    data: {
      todoItems: [
        {
          id: '1',
          title: 'Buy milk',
          description: '',
          dateCreated: {
            date: '2020-01-01',
            time: '12:00',
            timezone: '-08:00',
          },
          dateCompleted: {
            date: '2020-01-01',
            time: '12:00',
            timezone: '-08:00',
          },
          notes: '',
          tags: [
            {
              id: '1',
              name: 'Groceries',
              color: '#ff0000',
            },
          ],
          isCompleted: false,
        },
      ],
    },
  }

  if (!response || 'errors' in response) {
    console.error('Error getting todo items')
    return
  }

  return response
}

async function fetchTags({ uid }: { uid: string | null }) {
  const response: {
    data: {
      tags: Tag[]
    }
  } = {
    data: {
      tags: [
        {
          id: '1',
          name: 'Groceries',
          color: '#ff0000',
        },
      ],
    },
  }

  if (!response || 'errors' in response) {
    console.error('Error getting tags')
    return
  }

  return response
}

export default function TodoList() {
  const [theme] = useTheme()
  const [getCurrentDate, setCurrentDate] = createSignal<Date>(new Date())
  const [tagsData] = createResource(fetchTags)
  const [todoItemsData, { mutate }] = createResource(
    () => ({ currentDate: getCurrentDate() }),
    fetchTodoItems
  )
  const [getSelectedItemId, setSelectedItemId] = createSignal<string>()

  const todoItems = () =>
    todoItemsData()?.data.todoItems.map((item) => ({
      ...item,
      description: item.description ?? null,
      notes: item.notes ?? null,
      dateCompleted: item.dateCompleted
        ? getDateFromComponents({
            date: item.dateCompleted.date,
            time: item.dateCompleted.time,
            timezone: item.dateCompleted.timezone,
          })
        : null,
      dateCreated: getDateFromComponents({
        date: item.dateCreated.date,
        time: item.dateCreated.time,
        timezone: item.dateCreated.timezone,
      }),
    }))

  const getSelectedItem = () =>
    todoItems()?.find((item) => item.id === getSelectedItemId())

  const getIncompleteItems = () =>
    todoItems()?.filter((item) => !item.isCompleted)
  const getCompletedItems = () =>
    todoItems()?.filter((item) => {
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

  const addTodoItem = async (title: string) => {
    const dateCreated = new Date()
    // const response = await mutation<
    //   MutationCreateTodoItemArgs,
    //   Mutation['createTodoItem']
    // >(createTodoItemMutation, {
    //   input: {
    //     title,
    //     dateCreated: {
    //       date: getDateStringWithoutTime(dateCreated),
    //       time: getTimeStringWithoutDate(dateCreated),
    //       timezone: getTimezoneStringWithoutDate(dateCreated),
    //     },
    //   },
    // })

    const response = {
      data: {
        createTodoItem: {
          id: '1',
          title,
          description: '',
          dateCreated: {
            date: getDateStringWithoutTime(dateCreated),
            time: getTimeStringWithoutDate(dateCreated),
            timezone: getTimezoneStringWithoutDate(dateCreated),
          },
          dateCompleted: null,
          notes: '',
          tags: [],
          isCompleted: false,
        },
      },
    }

    if (!response || 'errors' in response) {
      console.error('Error creating todo item')
      return
    }

    const createTodoItem = response.data.createTodoItem

    mutate((prev) => ({
      data: {
        todoItems: [...(prev?.data.todoItems ?? []), createTodoItem],
      },
    }))
  }

  const deleteTodoItem = (id: string) => {
    mutate((prev) => ({
      data: {
        todoItems: prev?.data.todoItems.filter((item) => item.id !== id) ?? [],
      },
    }))
    // mutation<MutationDeleteTodoItemArgs, Mutation['deleteTodoItem']>(
    //   deleteTodoItemMutation,
    //   {
    //     id,
    //   }
    // )
  }

  const completeTodoItem = (id: string, isCompleted: boolean) => {
    const dateCompleted = isCompleted ? null : getCurrentDate()

    // mutation<MutationUpdateTodoItemArgs, TodoItemGql>(updateTodoItemMutation, {
    //   input: {
    //     id,
    //     isCompleted: !isCompleted,
    //     dateCompleted: dateCompleted
    //       ? {
    //           date: getDateStringWithoutTime(dateCompleted),
    //           time: getTimeStringWithoutDate(dateCompleted),
    //           timezone: getTimezoneStringWithoutDate(dateCompleted),
    //         }
    //       : null,
    //   },
    // })

    mutate((prev) => ({
      data: {
        todoItems: (prev?.data.todoItems ?? []).map((item) => ({
          ...item,
          isCompleted: item.id === id ? !item.isCompleted : item.isCompleted,
          dateCompleted: dateCompleted
            ? {
                date: getDateStringWithoutTime(dateCompleted),
                time: getTimeStringWithoutDate(dateCompleted),
                timezone: getTimezoneStringWithoutDate(dateCompleted),
              }
            : null,
        })),
      },
    }))
  }

  const updateTodoItem = debounce(
    (
      id: string,
      fieldName: keyof MutationUpdateTodoItemArgs['input'],
      value: ValueOf<MutationUpdateTodoItemArgs['input']>
    ) => {
      mutate((prev) => ({
        data: {
          todoItems: [
            ...(prev?.data.todoItems ?? []).map((item) => ({
              ...item,
              ...(item.id === id && {
                uid: '',
                id,
                [fieldName]:
                  fieldName === 'tags' && Array.isArray(value)
                    ? tagsData()?.data.tags.filter((t) =>
                        value.some((v) => v.id === t.id)
                      )
                    : value,
              }),
            })),
          ],
        },
      }))

      // mutation<MutationUpdateTodoItemArgs, TodoItemGql>(
      //   updateTodoItemMutation,
      //   {
      //     input: {
      //       id,
      //       [fieldName]: value,
      //     },
      //   }
      // )
    },
    500
  )

  return (
    <>
      <div
        class={styles['todo-list']}
        classList={{
          [styles.dark]: theme().theme === 'dark',
        }}
      >
        <DateHeader
          currentDate={getCurrentDate()}
          setCurrentDate={(date) => {
            mutate(() => undefined)
            setCurrentDate(date)
          }}
        />
        <Suspense
          fallback={
            <div class={styles['lists']}>
              <div class={styles['incomplete-list']}>
                <h2 class={styles['list-heading']}>Todo</h2>
                <SkeletonTodoCard />
                <SkeletonTodoCard />
                <SkeletonTodoCard />
              </div>
              <div class={styles['complete-list']}>
                <h2 class={styles['list-heading']}>Done</h2>
                <SkeletonTodoCard />
                <SkeletonTodoCard />
                <SkeletonTodoCard />
              </div>
            </div>
          }
        >
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
                    title={item().title}
                    isCompleted={item().isCompleted}
                    tags={item().tags}
                    onDelete={deleteTodoItem}
                    onComplete={completeTodoItem}
                    onClick={(id) => () => setSelectedItemId(id)}
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
                      title={item().title}
                      isCompleted={item().isCompleted}
                      tags={item().tags}
                      onDelete={deleteTodoItem}
                      onComplete={completeTodoItem}
                      onClick={(id) => () => setSelectedItemId(id)}
                    />
                  )}
                </Index>
              </div>
            )}
          </div>
        </Suspense>
        <AddTodoItemWidget
          addTodoItem={addTodoItem}
          canOpen={!getSelectedItem()}
        />
      </div>
      {getSelectedItem() && (
        <TodoEditPanel
          tags={tagsData()?.data.tags ?? []}
          item={getSelectedItem()!}
          updateTodoItem={updateTodoItem}
          onClose={() => setSelectedItemId(undefined)}
        />
      )}
    </>
  )
}
