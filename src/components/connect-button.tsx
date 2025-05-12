"use client"
import { useEffect } from "react"
import { useAppKitAccount } from '@reown/appkit/react'

export const ConnectButton = ({
  setIsLogin
}: {
  setIsLogin: (value: boolean, address: string) => void
}) => {
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } =
    useAppKitAccount();

  useEffect(() => {
    if (isConnected) {
      // 当钱包连接成功时，设置登录状态为true
      setIsLogin(true, address)
      console.log("isConnected address", isConnected, address, caipAddress, status, embeddedWalletInfo)
    }
  }, [isConnected, setIsLogin, address, caipAddress, status, embeddedWalletInfo])

  return (
    <div>
      <appkit-button />
    </div>
  )
}
