import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";
import "../styles/Login.css";

function Register() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      
      await api.post("/register", {
        email,
        password,
      });
      
      setSuccess(t("register.success"));
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || t("register.error"));
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
            <h1>{t("register.title")}</h1>
            <p className="subtitle">{t("register.subtitle")}</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="email">{t("register.email")}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t("register.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t("register.password")}</label>
                <input
                  id="password"
                  type="password"
                  placeholder={t("register.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">{t("register.confirmPassword")}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? t("register.registering") : t("register.registerButton")}
              </button>
            </form>

            <p className="help-text">
              {t("register.loginLink")}{" "}
              <a href="/login" className="link">
                {t("register.login")}
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

export default Register;
