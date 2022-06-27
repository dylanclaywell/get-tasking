import { useTheme } from '../../contexts/Theme'
import { format, sub, add } from 'date-fns'

import styles from './DateHeader.module.css'

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
        class={styles['date-header-date-button']}
        classList={{ [styles.dark]: theme()?.theme === 'dark' }}
        onClick={shiftLeft}
      >
        <i class="fa-solid fa-chevron-left" />
        {format(sub(props.currentDate, { days: 1 }), 'LLLL do')}
      </button>
      <div class={styles['date-header-current-day-container']}>
        <span
          class={styles['date-header-current-day']}
          classList={{ [styles.dark]: theme()?.theme === 'dark' }}
        >
          {format(props.currentDate, 'EEEE')}
        </span>
        <h1 class={styles['date-header-current-date']}>
          {format(props.currentDate, 'LLLL do, yyyy')}
        </h1>
      </div>
      <button
        class={styles['date-header-date-button']}
        classList={{ [styles.dark]: theme()?.theme === 'dark' }}
        onClick={shiftRight}
      >
        {format(add(props.currentDate, { days: 1 }), 'LLLL do')}
        <i class="fa-solid fa-chevron-right" />
      </button>
    </div>
  )
}
