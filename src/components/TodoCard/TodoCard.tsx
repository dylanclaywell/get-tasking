import { createSignal, JSX, onCleanup } from 'solid-js'
import classnames from 'classnames'

import styles from './TodoCard.module.css'
import Menu from '../Menu'
import MenuItem from '../MenuItem'
import IconButton from '../IconButton'
import { useTheme } from '../../contexts/Theme'
import Icon from '../Icon'

interface Tag {
  id: string
  name: string
  color: string
}

export interface Props {
  id: string
  isSelected: boolean
  title: string
  isCompleted: boolean
  tags: Tag[]
  onDelete: (id: string) => void
  onComplete: (id: string, isCompleted: boolean) => void
  onClick: (id: string) => JSX.EventHandler<HTMLDivElement, MouseEvent>
  style?: string | JSX.CSSProperties | undefined
}

export default function TodoCard(props: Props) {
  const [getCanHover, setCanHover] = createSignal(false)
  const [getIsEntering, setIsEntering] = createSignal(true)
  const [getThemeState] = useTheme()
  const [getMenuRef, setMenuRef] = createSignal<HTMLElement>()
  const [getMenuIsOpen, setMenuIsOpen] = createSignal(false)

  return (
    <div
      style={props.style}
      class={classnames(styles['todo-card'], {
        [styles['todo-card--done']]: props.isCompleted,
        [styles['todo-card--neu']]: getThemeState().theme === 'neu',
        [styles['todo-card--selected']]: props.isSelected,

        // Setting this class after loading so that hovering does not interfere with the animation
        [styles['todo-card--can-hover']]: getCanHover(),
      })}
      onClick={props.onClick(props.id)}
      onAnimationEnd={() => {
        if (getIsEntering()) {
          setIsEntering(false)
          setCanHover(true)
        }
      }}
    >
      <div class={styles['left-container']}>
        <div
          class={classnames(styles['todo-card__checkbox'], {
            [styles['todo-card__checkbox--done']]: props.isCompleted,
            [styles['todo-card__checkbox--neu']]:
              getThemeState().theme === 'neu',
          })}
          onClick={(e) => {
            e.stopImmediatePropagation()
            props.onComplete(props.id, props.isCompleted)
          }}
        >
          {props.isCompleted && (
            <Icon name="check" className={styles['todo-card__checkmark']} />
          )}
        </div>
        <div class={styles['todo-card__title-and-tag-container']}>
          <span
            class={classnames(styles['todo-card__label'], {
              [styles['label-done']]: props.isCompleted,
              [styles['todo-card__label--neu']]:
                getThemeState().theme === 'neu',
            })}
          >
            {props.title}
          </span>
          {props.tags.map((tag) => (
            <span
              class={styles['todo-card__tag']}
              style={{ 'background-color': tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
      <IconButton
        color="primary"
        classes={{ root: styles['todo-card__menu-button'] }}
        ref={(el) => setMenuRef(el)}
        icon="more-vertical"
        onClick={(e) => {
          e.stopImmediatePropagation()
          setMenuIsOpen(true)
        }}
      />
      <Menu
        anchor={getMenuRef()}
        isOpen={getMenuIsOpen()}
        onClose={() => {
          setMenuIsOpen(false)
        }}
      >
        <MenuItem
          classes={styles['todo-card__delete-button']}
          onClick={() => {
            props.onDelete(props.id)
            setMenuIsOpen(false)
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  )
}
