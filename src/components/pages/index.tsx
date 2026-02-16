import Home from "./Home";
import { createHashRouter } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <div>404 | Page not found.</div>,
  },
]);

export default router;
