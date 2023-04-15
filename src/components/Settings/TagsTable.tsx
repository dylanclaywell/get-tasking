import { createSignal, Index, Setter, For } from 'solid-js'
import { invoke } from '@tauri-apps/api'
import classnames from 'classnames'
import { useTheme } from '../../contexts/Theme'
import cloneDeep from 'lodash.clonedeep'
import { debounce } from 'debounce'

import styles from './TagsTable.module.css'
import IconButton from '../IconButton'
import Icon from '../Icon'
import { Tag } from '../../types/Models'

interface Errors {
  name: string[]
  color: string[]
}

interface Props {
  tags: Tag[] | undefined
  mutateTags: Setter<Tag[] | undefined>
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

  const onBlur = async (
    id: string,
    name: keyof Omit<Tag, 'id'>,
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

    await invoke('update_tag', {
      id,
      ...(name === 'name' && { name: value }),
      ...(name === 'color' && { color: value }),
    })

    tags.splice(tagIndex, 1, {
      ...tag,
      [name]: value,
    })

    props.mutateTags(() => tags)
  }

  const addTagRow = async () => {
    const newTag = JSON.parse(
      await invoke('create_tag', {
        name: 'New Tag',
        color: generateRandomColor(),
      })
    ) as Tag

    props.mutateTags((prev) => [...(prev || []), newTag])
  }

  const deleteTag = async (id: string) => {
    await invoke('delete_tag', { id })

    props.mutateTags((prev) => prev?.filter((tag) => tag.id !== id))
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
                onBlur={(e) => {
                  onBlur(tag().id, 'name', e.currentTarget.value)
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
                onBlur={(e) => {
                  onBlur(
                    tag().id,
                    'color',
                    e.currentTarget.value,
                    /^#[A-Fa-f0-9]{6}$/
                  )
                }}
                value={tag().color}
              />
              <div class={styles['delete-icon']}>
                <IconButton onClick={() => deleteTag(tag().id)} icon="trash2" />
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
        <Icon name="plus" />
      </button>
    </div>
  )
}
