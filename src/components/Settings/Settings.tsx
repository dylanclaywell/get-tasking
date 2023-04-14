import { createResource, Suspense, useContext } from 'solid-js'
import { invoke } from '@tauri-apps/api'

import { useTheme } from '../../contexts/Theme'
import SkeletonSettings from '../SkeletonSettings'
import TagsTable from './TagsTable'

import styles from './Settings.module.css'
import RadioButton from '../RadioButton'
import { TagsContext } from '../../contexts/Tags'

export default function Settings() {
  const [tagsState, { mutateTags }] = useContext(TagsContext)
  const [getThemeState, { setTheme }] = useTheme()

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
        <TagsTable tags={tagsState().tags()} mutateTags={mutateTags} />
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
