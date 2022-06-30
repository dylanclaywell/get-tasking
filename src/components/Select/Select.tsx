import { JSX, createSignal, For } from 'solid-js'
import { v4 } from 'uuid'
import classnames from 'classnames'
import cloneDeep from 'lodash.clonedeep'

import { useTheme } from '../../contexts/Theme'
import Menu from '../Menu'
import MenuItem from '../MenuItem'

import styles from './Select.module.css'

export interface Option<ValueType> {
  value: ValueType
  label: string
}

export interface PropsBase<ValueType> {
  options: Option<ValueType>[]
  label: string
  classes?: {
    root?: string
    input?: string
    label?: string
  }
  fullWidth?: boolean
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onClick?: JSX.EventHandler<HTMLInputElement, MouseEvent>
}

export interface MultiSelectProps<ValueType> extends PropsBase<ValueType> {
  values: ValueType[]
  onChange: (option: Option<ValueType>[]) => void
}

export interface SingleSelectProps<ValueType> extends PropsBase<ValueType> {
  value: ValueType
  onChange: (option: Option<ValueType>) => void
}

export type Props<ValueType> =
  | SingleSelectProps<ValueType>
  | MultiSelectProps<ValueType>

export default function Select<
  ValueType extends string | number | string[] | undefined
>(props: Props<ValueType>) {
  const [theme] = useTheme()
  const [getMultiSelectValues, setMultiSelectValues] = createSignal<
    Option<ValueType>[]
  >(
    'values' in props
      ? props.values
          .map((value) => props.options.find((o) => o.value === value)!)
          .filter(Boolean) ?? []
      : []
  )
  const [getInputRef, setInputRef] = createSignal<HTMLDivElement>()
  const [getIsMenuOpen, setIsMenuOpen] = createSignal(false)
  const [getIsFocused, setIsFocused] = createSignal(false)
  const id = `input-${v4()}`

  const onFocus: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    setIsFocused(true)
    props.onFocus?.(event)
  }

  const onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = (event) => {
    setIsFocused(false)
    props.onBlur?.(event)
  }

  return (
    <>
      <div class={classnames(props.classes?.root)}>
        <label
          for={id}
          class={classnames(
            styles['select__label'],
            {
              [styles['select__label--small']]:
                getIsFocused() ||
                ('value' in props && Boolean(props.value)) ||
                ('values' in props && Boolean(props.values.length)),
            },
            props.classes?.label
          )}
        >
          {props.label}
        </label>
        {'value' in props ? (
          <input
            id={id}
            ref={(el) => setInputRef(el)}
            class={classnames(
              styles['select__input'],
              {
                [styles['select__input--focused']]: getIsFocused(),
                [styles['select__input--full-width']]: Boolean(props.fullWidth),
                [styles['select__input--neu']]: theme().theme === 'neu',
              },
              props.classes?.input
            )}
            onClick={() => setIsMenuOpen(true)}
            onFocus={onFocus}
            onBlur={onBlur}
            value={
              props.options.find((option) => option.value === props.value)
                ?.label ?? ''
            }
            readOnly
          />
        ) : (
          <div
            ref={(el) => setInputRef(el)}
            class={classnames(
              styles['select__input'],
              {
                [styles['select__input--focused']]: getIsFocused(),
                [styles['select__input--full-width']]: Boolean(props.fullWidth),
                [styles['select__input--neu']]: theme().theme === 'neu',
              },
              styles['select__input--multi'],
              props.classes?.input
            )}
            onClick={() => setIsMenuOpen(true)}
          >
            {props.values.map((value) => (
              <div
                class={styles['select__input--multi__value']}
                classList={{
                  [styles.dark]: theme()?.theme === 'dark',
                }}
              >
                {props.options.find((o) => o.value === value)?.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <Menu
        isOpen={getIsMenuOpen()}
        anchor={getInputRef()}
        onClose={() => setIsMenuOpen(false)}
      >
        <For each={props.options}>
          {(option) => (
            <MenuItem
              classes={classnames({
                [styles['select__menu-item--selected']]:
                  'values' in props &&
                  props.values.some((value) => option.value === value),
                [styles.dark]: theme()?.theme === 'dark',
              })}
              onClick={() => {
                if ('values' in props) {
                  setMultiSelectValues((values) => {
                    let clonedValues = cloneDeep(values)

                    if (clonedValues.some((v) => option.value === v.value)) {
                      clonedValues = clonedValues.filter(
                        (v) => v.value !== option.value
                      )
                      return clonedValues
                    }

                    return [...clonedValues, option]
                  })

                  props.onChange(getMultiSelectValues())
                } else {
                  props.onChange(option)
                }

                setIsMenuOpen(false)
              }}
            >
              {option.label}
            </MenuItem>
          )}
        </For>
      </Menu>
    </>
  )
}
