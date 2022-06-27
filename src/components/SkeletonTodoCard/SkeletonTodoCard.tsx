import styles from './SkeletonTodoCard.module.css'

export default function SkeletonTodoCard() {
  return (
    <div class={styles['card']}>
      <div class={styles['checkmark']} />
      <div class={styles['title']} />
    </div>
  )
}
