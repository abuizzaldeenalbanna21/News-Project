import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";
import "../styles/Login.css";

function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);

      // Redirect based on role
      if (res.data.role === "journalist") {
        navigate("/journalist");
      } else if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(err.response?.data?.error || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="login-container">
          <div className="login-card card">
            <h1>{t("login.title")}</h1>
            <p className="subtitle">{t("login.subtitle")}</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">{t("login.email")}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t("login.password")}</label>
                <input
                  id="password"
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? t("login.loading") : t("login.loginButton")}
              </button>
            </form>

            <p className="help-text">
              {t("login.backHome")}{" "}
              <a href="/" className="link">
                {t("header.home")}
              </a>
            </p>

            <p className="help-text">
              {t("login.signupLink")}{" "}
              <a href="/register" className="link">
                {t("login.signup")}
              </a>
            </p>
          </div>
        </div>
      </div>
      <footer className="footer">
        <p>{t("common.footer")}</p>
      </footer>
    </>
  );
}

export default Login;
