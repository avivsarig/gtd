import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import { AppLayout } from "./components/AppLayout.tsx"
import { Home } from "./routes/Home.tsx"
import "./styles/global.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppLayout>
        <Home />{" "}
      </AppLayout>
    ),
  },
])

const root = document.getElementById("root")!

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
