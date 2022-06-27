import styles from './SkeletonSettings.module.css'
import classnames from 'classnames'

export default function SkeletonSettings() {
  return (
    <div class={styles['container']}>
      <div class={classnames(styles['heading'], styles['skeleton'])} />
      <div class={classnames(styles['text-long'], styles['skeleton'])} />
      <div class={classnames(styles['text-medium'], styles['skeleton'])} />
      <div class={classnames(styles['text-short'], styles['skeleton'])} />
    </div>
  )
}
