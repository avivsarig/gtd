import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from "sonner"
import { HomePage, InboxPage } from "./pages"
import "./styles/global.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/inbox",
    element: <InboxPage />,
  },
])

const root = document.getElementById("root")!

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors closeButton />
  </StrictMode>,
)
