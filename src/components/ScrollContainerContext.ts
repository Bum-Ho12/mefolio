// components/ScrollContainerContext.ts
import { createContext, RefObject } from "react";

// The page scrolls inside ClientLayout's container, not the window.
// Sections that need scroll progress read the container ref from here.
export const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);
