import { useTheme } from '../../contexts/Theme'
import { format, sub, add } from 'date-fns'

import styles from './DateHeader.module.css'
import Icon from '../Icon'

export interface Props {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

export default function DateHeader(props: Props) {
  const [theme] = useTheme()
  const shiftLeft = () => {
    props.setCurrentDate(sub(props.currentDate, { days: 1 }))
  }

  const shiftRight = () => {
    props.setCurrentDate(add(props.currentDate, { days: 1 }))
  }

  return (
    <div class={styles['date-header']}>
      <button
        class={styles['date-header__date-button']}
        classList={{
          [styles['date-header__date-button--neu']]: theme()?.theme === 'neu',
        }}
        onClick={shiftLeft}
      >
        <Icon name="chevron-left" />
      </button>
      <div class={styles['date-header__current-day__container']}>
        <span class={styles['date-header__current-day']}>
          {format(props.currentDate, 'EEEE')}
        </span>
        <h1
          class={styles['date-header__current-date']}
          classList={{
            [styles['date-header__current-date--neu']]:
              theme()?.theme === 'neu',
          }}
        >
          {format(props.currentDate, 'LLLL do, yyyy')}
        </h1>
      </div>
      <button
        class={styles['date-header__date-button']}
        classList={{
          [styles['date-header__date-button--neu']]: theme()?.theme === 'neu',
        }}
        onClick={shiftRight}
      >
        <Icon name="chevron-right" />
      </button>
    </div>
  )
}
