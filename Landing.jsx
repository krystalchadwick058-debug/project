import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import "../style/landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      {/* ===== Three.js 背景（保持不变）===== */}
      <Canvas
        className="hero-canvas"
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ physicallyCorrectLights: true }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <directionalLight position={[-6, -2, 3]} intensity={2.5} color="#6a7cff" />
        <Environment preset="studio" />
      </Canvas>

      {/* ===== UI 悬浮层（不变）===== */}
      <header className="nav">
        <div className="logo">
          <img src="logo.jpg" alt="Logo" />
          <span>交易所</span>
        </div>
        <nav>
          <a>关于我们</a>
          <a>操作指南</a>
          <a>联系我们</a>
        </nav>
        <button onClick={() => navigate("/login")}>登录</button>
      </header>

      <div className="content">
        <h1>
          合约交易——<br />算法领导者
        </h1>
        <br />
        <p>
          AI技术专业级的调控和灵活调整风险管理参数——企业级信赖
        </p>
        <div className="actions">
          <button className="primary" onClick={() => navigate("/login")}>
            开始使用
          </button>
          <button className="ghost">了解更多</button>
        </div>
      </div>

      {/* ===== 加粗线条 + 整体放大 + 连续平滑旋转 3D 正方体 ===== */}
      <div className="glass-cube-container">
        <div className="glass-cube">
          {/* 外层：260px */}
          <div className="layer outer">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face left"></div>
            <div className="face right"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
          {/* 中层：130px */}
          <div className="layer middle">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face left"></div>
            <div className="face right"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
          {/* 内层：78px */}
          <div className="layer inner">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face left"></div>
            <div className="face right"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-cube-container {
          position: absolute;
          top: 50%;
          left: 68%;
          transform: translate(-50%, -50%);
          width: 260px; /* 🔥 放大到 260px */
          height: 260px;
          perspective: 1800px; /* 透视感同步增强 */
          z-index: 5;
        }

        .glass-cube {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .layer {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .logo img{
          width:50px;
          hetght: auto;
        }

        /* 外层：260px */
        .outer .face { --size: 260px; --depth: 130px; }
        .outer {
          animation: spin 18s linear infinite;
        }

        /* 中层：130px */
        .middle .face { --size: 130px; --depth: 65px; }
        .middle {
          animation: spin 22s linear infinite;
        }

        /* 内层：78px */
        .inner .face { --size: 78px; --depth: 39px; }
        .inner {
          animation: spin 26s linear infinite reverse;
        }

        /* 🔥 100% 透明面 + 加粗边框 */
        .face {
          position: absolute;
          width: var(--size);
          height: var(--size);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border: 2px solid; /* 🔥 从 1px → 2px，加粗 */
          box-shadow:
            0 0 16px rgba(255, 255, 255, 0.2),   /* 稍增强辉光 */
            inset 0 0 10px rgba(255, 255, 255, 0.12);
          backface-visibility: hidden;
        }

        /* 🔥 多色边框 */
        .front  { border-color: #4fc3f7; }
        .back   { border-color: #b388ff; }
        .left   { border-color: #69f0ae; }
        .right  { border-color: #ff80ab; }
        .top    { border-color: #8c9eff; }
        .bottom { border-color: #f48fb1; }

        /* 外层定位 */
        .outer .front  { transform: translate(-50%, -50%) translateZ(130px); }
        .outer .back   { transform: translate(-50%, -50%) rotateY(180deg) translateZ(130px); }
        .outer .left   { transform: translate(-50%, -50%) rotateY(-90deg) translateZ(130px); }
        .outer .right  { transform: translate(-50%, -50%) rotateY(90deg) translateZ(130px); }
        .outer .top    { transform: translate(-50%, -50%) rotateX(90deg) translateZ(130px); }
        .outer .bottom { transform: translate(-50%, -50%) rotateX(-90deg) translateZ(130px); }

        /* 中层定位 */
        .middle .front  { transform: translate(-50%, -50%) translateZ(65px); }
        .middle .back   { transform: translate(-50%, -50%) rotateY(180deg) translateZ(65px); }
        .middle .left   { transform: translate(-50%, -50%) rotateY(-90deg) translateZ(65px); }
        .middle .right  { transform: translate(-50%, -50%) rotateY(90deg) translateZ(65px); }
        .middle .top    { transform: translate(-50%, -50%) rotateX(90deg) translateZ(65px); }
        .middle .bottom { transform: translate(-50%, -50%) rotateX(-90deg) translateZ(65px); }

        /* 内层定位 */
        .inner .front  { transform: translate(-50%, -50%) translateZ(39px); }
        .inner .back   { transform: translate(-50%, -50%) rotateY(180deg) translateZ(39px); }
        .inner .left   { transform: translate(-50%, -50%) rotateY(-90deg) translateZ(39px); }
        .inner .right  { transform: translate(-50%, -50%) rotateY(90deg) translateZ(39px); }
        .inner .top    { transform: translate(-50%, -50%) rotateX(90deg) translateZ(39px); }
        .inner .bottom { transform: translate(-50%, -50%) rotateX(-90deg) translateZ(39px); }

        /* 🔥 连续平滑旋转 */
        @keyframes spin {
          from { transform: rotateX(20deg) rotateY(0deg); }
          to   { transform: rotateX(20deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}