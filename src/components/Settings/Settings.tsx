import { createResource, Suspense } from 'solid-js'

import { useTheme } from '../../contexts/Theme'
import ToggleSwitch from '../Switch'
import SkeletonSettings from '../SkeletonSettings'
import TagsTable from './TagsTable'

import styles from './Settings.module.css'

async function fetchTags({ uid }: { uid: string | null }) {
  if (!uid) {
    console.error('No uid')
    return
  }

  const response = {
    data: {
      tags: [],
    },
  }

  if (!response || 'errors' in response) {
    console.error('Error getting tags')
    return
  }

  return response
}

export default function Settings() {
  const [getThemeState, { setTheme }] = useTheme()
  const [data, { mutate }] = createResource(fetchTags)

  return (
    <div class={styles['settings']}>
      <h1 class={styles['settings-heading']}>Settings</h1>
      <Suspense
        fallback={
          <div class={styles['skeleton']}>
            <SkeletonSettings />
            <SkeletonSettings />
          </div>
        }
      >
        <h2>Tags</h2>
        <TagsTable tags={[]} mutateTags={mutate} />
        <div class={styles['settings-theme-container']}>
          <span>Light Theme</span>
          <ToggleSwitch
            isChecked={getThemeState().theme === 'dark'}
            label="Dark Theme"
            onClick={() => setTheme('dark')}
          />
        </div>
      </Suspense>
    </div>
  )
}
