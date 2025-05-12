// src/app/page.tsx
"use client";
import dynamic from "next/dynamic";
import React from "react";
import { useState } from "react";
import Wallet from "@/components/wallet";
// 禁用SSR的GodotGame组件，配置noSSR和加载提示
const GodotGame = dynamic(() => import("@/components/GodotGame"), {
  ssr: false,
  loading: () => <div className="loading">加载游戏中...</div>
});

export default function Home() {
  const [isLogin, setIsLogin] = useState(false);
  const [address, setAddress] = useState("");

  function handleLogin(isLogin: boolean, address: string) {
    if (!isLogin) {
      return;
    }

    setIsLogin(true);
    setAddress(address);

  }

  return (
    <>
      <main className="game-container">
        {isLogin ? (
          <GodotGame address={address} />
        ) : (
          <Wallet setIsLogin={handleLogin} />
        )}
      </main>
    </>
  );
}
