"use client"

import { createContext, useContext } from "react"
import type { ResolvedGlobalConfig } from "@/lib/types/cms"
import { defaultGlobalConfig } from "@/config/defaults"

const GlobalConfigContext = createContext<ResolvedGlobalConfig>(defaultGlobalConfig)

export function useGlobalConfig() {
  return useContext(GlobalConfigContext)
}

interface GlobalConfigProviderProps {
  config: ResolvedGlobalConfig
  children: React.ReactNode
}

export function GlobalConfigProvider({ config, children }: GlobalConfigProviderProps) {
  return (
    <GlobalConfigContext.Provider value={config}>
      {children}
    </GlobalConfigContext.Provider>
  )
}
