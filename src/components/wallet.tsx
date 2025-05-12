"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import type { ReactNode } from "react"
import { WagmiProvider, type Config } from "wagmi"
import { cookieStorage, createStorage } from "wagmi"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, arbitrum, solana } from "@reown/appkit/networks"
import type { AppKitNetwork } from "@reown/appkit/networks"
import { SolanaAdapter } from "@reown/appkit-adapter-solana"
import { ConnectButton } from "./connect-button"

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost
// export const projectId = "bfe3544dbd1d55468277e75e3747f77e" // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined")
}

export const networks = [solana, mainnet, arbitrum] as [AppKitNetwork, ...AppKitNetwork[]]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  // 移除 defaultNetwork 属性，因为它不是 WagmiAdapter 构造函数参数中的有效属性
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
})

const solanaWeb3JsAdapter = new SolanaAdapter()

// Set up queryClient
const queryClient = new QueryClient()

// Set up metadata
const metadata = {
  name: "next-reown-appkit",
  description: "next-reown-appkit",
  url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
}

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks,
  metadata,
  themeMode: "dark",
  features: {
    email: false, // Optional - defaults to your Cloud configuration
    analytics: false, // Optional - defaults to your Cloud configuration
    socials: [],
  },
  themeVariables: {},
  defaultNetwork: solana,
})

function ContextProvider({
  children,
}: {
  children: ReactNode
}) {
  // 在客户端组件中不使用cookie初始化
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

// 改为同步函数，移除async
export default function Wallet({
  setIsLogin
}: {
  setIsLogin: (value: boolean, address: string) => void
}) {
  return (
    <ContextProvider>
      <ConnectButton setIsLogin={setIsLogin} />
    </ContextProvider>
  )
}

