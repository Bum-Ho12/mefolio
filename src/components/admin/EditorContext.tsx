'use client';

import { createContext, useContext } from 'react';

export interface RefOption {
    id: string;
    title: string;
    subtitle?: string;
}

export interface EditorContextValue {
    refOptions: Record<string, RefOption[]>;
    errors: Record<string, string>;
    cloudinaryEnabled: boolean;
}

export const EditorContext = createContext<EditorContextValue>({ refOptions: {}, errors: {}, cloudinaryEnabled: false });

export const useEditorContext = () => useContext(EditorContext);
