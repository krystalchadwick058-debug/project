import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const inputs = document.querySelectorAll('input');
    const username = inputs[0]?.value.trim();
    const password = inputs[1]?.value;

    if (!username || !password) {
      alert("请输入用户名和密码");
      return;
    }

    try {
      const res = await fetch("/internal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("loggedIn", "1");
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        navigate("/trade");
      } else {
        alert(data.error || "登录失败");
      }
    } catch (err) {
      alert("无法连接登录服务，请确保已运行：node server.js");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#0b0e11",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#eaecef",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          background: "#181a20",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginBottom: 20 }}>员工登录</h2>
        <input placeholder="员工账户" style={inputStyle} />
        <input type="password" placeholder="密码" style={inputStyle} />
        <button style={loginBtn} onClick={handleLogin}>
          登录
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 12,
  background: "#0b0e11",
  border: "1px solid #2b3139",
  color: "#eaecef",
};

const loginBtn = {
  width: "100%",
  padding: 10,
  background: "#f0b90b",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};