import { createSignal, Index, Setter } from 'solid-js'
import classnames from 'classnames'
import { useTheme } from '../../contexts/Theme'
import cloneDeep from 'lodash.clonedeep'
import { debounce } from 'debounce'

import styles from './TagsTable.module.css'
import IconButton from '../IconButton'

interface Tag {
  id: string
  name: string
  color: string
}

interface Errors {
  name: string[]
  color: string[]
}

interface Props {
  tags: Tag[] | undefined
  mutateTags: Setter<
    | {
        data: {
          [key: string]: Tag[]
        }
      }
    | undefined
  >
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 15)
}

function generateRandomColor() {
  const numbers: string[] = []
  for (let i = 0; i < 6; i++) {
    numbers.push(generateRandomNumber().toString(16))
  }

  return `#${numbers.join('')}`
}

export default function TagsTable(props: Props) {
  const [getErrors, setErrors] = createSignal<Errors>({
    name: [],
    color: [],
  })
  const [getThemeState] = useTheme()

  const onChangeInput = debounce(
    async (
      id: string,
      name: keyof Omit<Tag, '__typename' | 'id'>,
      value: string,
      validation?: RegExp
    ) => {
      if (validation && !validation.test(value)) {
        addError(name, id)
        return
      }

      removeError(name, id)

      const tags = cloneDeep(props.tags)
      const tag = tags?.find((tag) => tag.id === id)
      const tagIndex = tags?.findIndex((tag) => tag.id === id)

      if (!tags || !tag || tagIndex === undefined) {
        console.error('Tag not found')
        return
      }

      const response = {
        data: {
          updateTag: {
            id,
            name: value,
            color: tag?.color,
          },
        },
      }

      if ('errors' in response) {
        console.error('Error updating tag')
        return
      }

      tags.splice(tagIndex, 1, response.data.updateTag)

      props.mutateTags(() => ({
        data: {
          tags,
        },
      }))
    },
    500
  )

  const addTagRow = async () => {
    const response = {
      data: {
        createTag: {
          id: 'new-tag-id',
          name: 'New Tag',
          color: generateRandomColor(),
        },
      },
    }

    if ('errors' in response) {
      console.error('Error adding tag')
      return
    }

    props.mutateTags((prev) => ({
      data: {
        tags: [...(prev?.data.tags ?? []), response.data.createTag],
      },
    }))
  }

  const deleteTag = async (id: string) => {
    // await mutation<MutationDeleteTagArgs, Status>(deleteTagMutation, {
    //   id: id,
    // })

    props.mutateTags((prev) => ({
      data: {
        tags: (prev?.data.tags ?? []).filter((t) => t.id !== id),
      },
    }))
  }

  const addError = (name: keyof Errors, id: string) => {
    const errors = cloneDeep(getErrors())

    if (!errors[name].includes(id)) {
      errors[name].push(id)
      setErrors(errors)
    }
  }

  const removeError = (name: keyof Errors, id: string) => {
    const errors = cloneDeep(getErrors())
    errors[name] = errors[name].filter((errorId) => errorId !== id)
    setErrors(errors)
  }

  const hasError = (name: keyof Errors, id: string) => {
    return getErrors()[name].includes(id)
  }

  return (
    <div
      class={styles['tag-table']}
      classList={{
        [styles['dark']]: getThemeState()?.theme === 'dark',
      }}
    >
      <Index each={props.tags}>
        {(tag) => (
          <div
            class={styles['tag-table-row']}
            classList={{
              [styles['dark']]: getThemeState()?.theme === 'dark',
            }}
          >
            <div>
              <input
                class={styles['tag-table-input']}
                classList={{
                  [styles['tag-table-input-error']]: hasError('name', tag().id),
                }}
                onInput={(e) => {
                  onChangeInput(tag().id, 'name', e.currentTarget.value)
                }}
                value={tag().name}
              />
            </div>
            <div class={styles['tag-color']}>
              <div
                class={styles['tag-color-sample']}
                style={{ 'background-color': tag().color }}
              />
              <input
                class={classnames(styles['tag-table-input'], {
                  [styles['tag-table-input-error']]: hasError(
                    'color',
                    tag().id
                  ),
                })}
                onInput={(e) => {
                  onChangeInput(
                    tag().id,
                    'color',
                    e.currentTarget.value,
                    /^#[A-Fa-f0-9]{6}$/
                  )
                }}
                value={tag().color}
              />
              <div class={styles['delete-icon']}>
                <IconButton
                  onClick={() => deleteTag(tag().id)}
                  icon="fa-solid fa-trash-can"
                />
              </div>
            </div>
          </div>
        )}
      </Index>
      <button
        class={classnames(styles['tag-table-add-row'], {
          [styles['dark']]: getThemeState()?.theme === 'dark',
        })}
        onClick={addTagRow}
      >
        Add tag
        <i class="fa-solid fa-plus" />
      </button>
    </div>
  )
}
