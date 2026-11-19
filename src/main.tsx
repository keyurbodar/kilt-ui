import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "./fonts.css";
import { applyRootAttributes } from "./root";
import { router } from "./routes";

applyRootAttributes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
