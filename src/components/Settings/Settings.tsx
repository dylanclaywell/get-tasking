import { createResource, Suspense, createUniqueId } from 'solid-js'

import { useTheme } from '../../contexts/Theme'
import ToggleSwitch from '../Switch'
import SkeletonSettings from '../SkeletonSettings'
import TagsTable from './TagsTable'

import styles from './Settings.module.css'
import RadioButton from '../RadioButton'

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
        <div class={styles['settings__theme-container']}>
          <h2>Theme</h2>
          <fieldset
            class={styles['settings__radio-buttons']}
            classList={{
              [styles['settings__radio-buttons--neu']]:
                getThemeState().theme === 'neu',
            }}
          >
            <RadioButton
              isChecked={getThemeState().theme === 'light'}
              onChange={(isChecked) => {
                if (isChecked) {
                  setTheme('light')
                }
              }}
              value="light"
              group="theme"
              label="Light"
            />
            <RadioButton
              isChecked={getThemeState().theme === 'neu'}
              onChange={(isChecked) => {
                if (isChecked) {
                  setTheme('neu')
                }
              }}
              value="dark"
              group="theme"
              label="Neumorphic"
            />
          </fieldset>
        </div>
      </Suspense>
    </div>
  )
}
