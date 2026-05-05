import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import './index.css'
import App from './App.tsx'

const mantineTheme = createTheme({
  fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Consolas, monospace',
  primaryColor: 'gray',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>,
)
