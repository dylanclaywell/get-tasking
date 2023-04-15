import { invoke } from '@tauri-apps/api'

import TitleBar from './components/TitleBar'
import AppProvider from './contexts/App'
import MessageProvider from './contexts/Message'
import TagsProvider from './contexts/Tags'
import ThemeProvider from './contexts/Theme'
import Main from './pages/main'

export default function App() {
  invoke('create_tables').then((success) => {
    if (!success) {
      console.error(
        'Failed to create tables. Please check the console for more information.'
      )
    }
  })

  return (
    <AppProvider>
      <MessageProvider>
        <ThemeProvider>
          <TagsProvider>
            <Main />
          </TagsProvider>
        </ThemeProvider>
      </MessageProvider>
    </AppProvider>
  )
}
