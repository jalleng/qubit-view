import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import "./index.css";
import App from "./pages/App.tsx";

const mantineTheme = createTheme({
  fontFamily:
    'ui-monospace, "Cascadia Code", "Source Code Pro", Consolas, monospace',
  primaryColor: "gray",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
        <App />
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
);
