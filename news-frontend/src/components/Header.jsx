import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-emoji">📰</span>
            <div className="logo-text">
              <h1>{t("siteName")}</h1>
              <p className="tagline">{t("siteTagline")}</p>
            </div>
          </div>
        </div>

        <nav className="nav-menu">
          <a
            href="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t("header.home")}
          </a>

          {!token ? (
            <>
              <button
                className="nav-btn login-btn"
                onClick={() => navigate("/login")}
              >
                {t("header.login")}
              </button>
              <button className="nav-btn lang-btn" onClick={toggleLanguage}>
                {language === "ar" ? "🇬🇧 EN" : "🇸🇦 AR"}
              </button>
            </>
          ) : (
            <>
              <a
                href="/news"
                className={`nav-link ${isActive("/news") ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("header.news")}
              </a>

              {role === "user" && (
                <a
                  href="/user"
                  className={`nav-link ${isActive("/user") ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("header.myAccount")}
                </a>
              )}

              {role === "journalist" && (
                <a
                  href="/journalist"
                  className={`nav-link ${isActive("/journalist") ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("header.journalistDashboard")}
                </a>
              )}

              {role === "admin" && (
                <a
                  href="/admin"
                  className={`nav-link ${isActive("/admin") ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("header.adminPanel")}
                </a>
              )}

              <button className="nav-btn lang-btn" onClick={toggleLanguage}>
                {language === "ar" ? "🇬🇧 EN" : "🇸🇦 AR"}
              </button>

              <button className="nav-btn logout-btn" onClick={handleLogout}>
                {t("header.logout")}
              </button>
            </>
          )}
        </nav>

        <div className="menu-toggle">
          <button
            className="toggle-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="mobile-menu">
          <a href="/" onClick={() => setIsMenuOpen(false)}>
            {t("header.home")}
          </a>
          {!token ? (
            <>
              <button onClick={() => navigate("/login")}>
                {t("header.login")}
              </button>
              <button onClick={toggleLanguage}>
                {language === "ar" ? "🇬🇧 English" : "🇸🇦 العربية"}
              </button>
            </>
          ) : (
            <>
              <a href="/news" onClick={() => setIsMenuOpen(false)}>
                {t("header.news")}
              </a>
              {role === "user" && (
                <a href="/user" onClick={() => setIsMenuOpen(false)}>
                  {t("header.myAccount")}
                </a>
              )}
              {role === "journalist" && (
                <a href="/journalist" onClick={() => setIsMenuOpen(false)}>
                  {t("header.journalistDashboard")}
                </a>
              )}
              {role === "admin" && (
                <a href="/admin" onClick={() => setIsMenuOpen(false)}>
                  {t("header.adminPanel")}
                </a>
              )}
              <button onClick={toggleLanguage}>
                {language === "ar" ? "🇬🇧 English" : "🇸🇦 العربية"}
              </button>
              <button onClick={handleLogout}>{t("header.logout")}</button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
