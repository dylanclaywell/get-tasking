import MessageProvider from './contexts/Message'
import ThemeProvider from './contexts/Theme'
import Main from './pages/main'

export default function App() {
  return (
    <MessageProvider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </MessageProvider>
  )
}
