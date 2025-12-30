import SymbolList from "./SymbolList";

export default function SymbolDrawer({ open, onClose }) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: "fixed",
        left: 0,
        top: 40, // ⬅️ 顶部栏下面
        width: 360, // ⬅️ 加宽，避免抖动
        height: "calc(100vh - 40px)",
        background: "#0b0e11",
        borderRight: "1px solid #1e2329",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      <SymbolList />
    </div>
  );
}
