"use client";
import { useEffect, useRef } from "react";

export default function GodotGame({ address }: { address: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusProgressRef = useRef<HTMLDivElement>(null);
  const statusProgressInnerRef = useRef<HTMLDivElement>(null);
  const statusIndeterminateRef = useRef<HTMLDivElement>(null);
  const statusNoticeRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // 1. 加载外部脚本
    /*
    const script = document.createElement("script");
    script.src = "/index.js";
    // script.async = true;
    document.body.appendChild(script);

    // 等待脚本加载完成后再初始化游戏
    script.onload = () => {
      // 确保 window.Engine 已定义
      if (typeof window.Engine === "undefined") {
        console.error("Godot Engine not loaded");
        return;
      }
      initGame();
    };
    */

    initGame();

    return () => {
      // 清理
      // document.body.removeChild(script);
    };
  }, []);

  function initGame() {

    const GODOT_CONFIG = {
      args: [],
      canvasResizePolicy: 2,
      executable: "index",
      experimentalVK: false,
      fileSizes: { "https://pub-d0a22ae00b7e4ba88d7fab67b772e4f7.r2.dev/index.pck": 108900000, "index.wasm": 1642372 },
      focusCanvas: true,
      gdextensionLibs: [],
      canvas: canvasRef.current,
      mainPack: 'https://pub-d0a22ae00b7e4ba88d7fab67b772e4f7.r2.dev/index.pck', // 远程资源
    };

    // 确保canvas元素存在
    if (!canvasRef.current) {
      console.error("Canvas element not found");
      return;
    }

    console.log('typeof engine', typeof window.Engine);
    // 正确初始化Godot引擎
    const engine = new window.Engine(GODOT_CONFIG);

    // 钱包地址设置函数
    function trySetWalletAddress(
      address: string,
      maxRetries = 10,
      interval = 3000
    ) {
      let retries = 0;

      function attempt() {
        if (typeof window.set_wallet_address === "function") {
          console.log("成功调用 set_wallet_address");
          window.set_wallet_address(address);
          return true;
        } else if (retries < maxRetries) {
          console.log(
            `等待 set_wallet_address 函数可用，尝试 ${retries + 1
            }/${maxRetries}`
          );
          retries++;
          setTimeout(attempt, interval);
          return false;
        } else {
          console.error("set_wallet_address 函数在多次尝试后仍不可用");
          return false;
        }
      }

      return attempt();
    }

    // 游戏状态管理
    const INDETERMINATE_STATUS_STEP_MS = 100;
    const statusProgress = statusProgressRef.current;
    const statusProgressInner = statusProgressInnerRef.current;
    const statusIndeterminate = statusIndeterminateRef.current;
    const statusNotice = statusNoticeRef.current;

    let initializing = true;
    let statusMode = "hidden";

    let animationCallbacks: ((time: number) => void)[] = [];
    function animate(time: number) {
      animationCallbacks.forEach((callback) => callback(time));
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function animateStatusIndeterminate(ms: number) {
      if (!statusIndeterminate) return;
      const i = Math.floor((ms / INDETERMINATE_STATUS_STEP_MS) % 8);
      if (
        (statusIndeterminate.children[i] as HTMLElement).style
          .borderTopColor === ""
      ) {
        Array.prototype.slice
          .call(statusIndeterminate.children)
          .forEach((child) => {
            child.style.borderTopColor = "";
          });
        (statusIndeterminate.children[i] as HTMLElement).style.borderTopColor =
          "#dfdfdf";
      }
    }

    function setStatusMode(
      mode: "progress" | "indeterminate" | "notice" | "hidden"
    ) {
      if (statusMode === mode || !initializing) {
        return;
      }

      if (statusProgress && statusIndeterminate && statusNotice) {
        [statusProgress, statusIndeterminate, statusNotice].forEach((elem) => {
          elem.style.display = "none";
        });
      }

      animationCallbacks = animationCallbacks.filter(function (value) {
        return value !== animateStatusIndeterminate;
      });

      switch (mode) {
        case "progress":
          if (statusProgress) statusProgress.style.display = "flex";
          break;
        case "indeterminate":
          if (statusIndeterminate) {
            statusIndeterminate.style.display = "flex";
            animationCallbacks.push(animateStatusIndeterminate);
          }
          break;
        case "notice":
          if (statusNotice) statusNotice.style.display = "flex";
          break;
        case "hidden":
          break;
        default:
          throw new Error("Invalid status mode");
      }
      statusMode = mode;
    }

    function setStatusNotice(text: string) {
      if (!statusNotice) return;

      while (statusNotice.lastChild) {
        statusNotice.removeChild(statusNotice.lastChild);
      }
      const lines = text.split("\n");
      lines.forEach((line) => {
        statusNotice.appendChild(document.createTextNode(line));
        statusNotice.appendChild(document.createElement("br"));
      });
    }

    function displayFailureNotice(err: Error | string) {
      const msg = err instanceof Error ? err.message : err;
      console.error(msg);
      setStatusNotice(msg);
      setStatusMode("notice");
      initializing = false;
    }

    // 初始化钱包
    trySetWalletAddress(address);

    const missing = window.Engine.getMissingFeatures();
    if (missing.length !== 0) {
      const missingMsg =
        "Error\nThe following features required to run Godot projects on the Web are missing:\n";
      displayFailureNotice(missingMsg + missing.join("\n"));
    } else {
      setStatusMode("indeterminate");
      console.log("engine.config", engine.config);
      engine.startGame({
        onProgress: function (current: number, total: number) {
          if (total > 0 && statusProgressInner) {
            statusProgressInner.style.width = `${(current / total) * 100}%`;
            setStatusMode("progress");
            if (current === total) {
              // wait for progress bar animation
              setTimeout(() => {
                setStatusMode("indeterminate");
              }, 500);
            }
          } else {
            setStatusMode("indeterminate");
          }
        },
      })
        .then(() => {
          setStatusMode("hidden");
          initializing = false;
        }, displayFailureNotice);
    }
  }

  return (
    <div className="godot-container">
      <div className="background-video">
        {/** 
        <video autoPlay muted loop>
          <source src="/loading_screen.mp4" type="video/mp4" />
        </video>
        */}
      </div>

      <canvas ref={canvasRef} id="canvas">
        HTML5 canvas appears to be unsupported in the current browser.
        <br />
        Please try updating or use a different browser.
      </canvas>

      <div id="status">
        <div
          ref={statusProgressRef}
          id="status-progress"
          style={{ display: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div ref={statusProgressInnerRef} id="status-progress-inner"></div>
        </div>
        <div
          ref={statusIndeterminateRef}
          id="status-indeterminate"
          style={{ display: "none" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div
          ref={statusNoticeRef}
          id="status-notice"
          className="godot"
          style={{ display: "none" }}
        ></div>
      </div>
    </div>
  );
}
