import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from "sonner"
import { Home } from "./routes/Home.tsx"
import { Inbox } from "./routes/Inbox.tsx"
import "./styles/global.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/inbox",
    element: <Inbox />,
  },
])

const root = document.getElementById("root")!

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors closeButton />
  </StrictMode>,
)
