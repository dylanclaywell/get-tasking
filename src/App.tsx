import TitleBar from './components/TitleBar'
import AppProvider from './contexts/App'
import MessageProvider from './contexts/Message'
import TagsProvider from './contexts/Tags'
import ThemeProvider from './contexts/Theme'
import Main from './pages/main'

export default function App() {
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
