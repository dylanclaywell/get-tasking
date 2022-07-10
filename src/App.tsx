import TitleBar from './components/TitleBar'
import AppProvider from './contexts/App'
import MessageProvider from './contexts/Message'
import ThemeProvider from './contexts/Theme'
import Main from './pages/main'

export default function App() {
  return (
    <AppProvider>
      <MessageProvider>
        <ThemeProvider>
          <Main />
        </ThemeProvider>
      </MessageProvider>
    </AppProvider>
  )
}
