import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";
import "../styles/Journalist.css";

function Journalist() {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(
        "/news",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(t("journalist.publishSuccess"));
      setMessageType("success");
      setTitle("");
      setContent("");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage(t("journalist.publishError"));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1>{t("journalist.title")}</h1>
          <p>{t("journalist.subtitle")}</p>
        </div>

        <div className="journalist-container">
          <div className="publish-card card">
            {message && (
              <div
                className={`alert ${
                  messageType === "success" ? "alert-success" : "alert-error"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handlePublish}>
              <div className="form-group">
                <label htmlFor="title">{t("journalist.newsTitle")}</label>
                <input
                  id="title"
                  type="text"
                  placeholder={t("journalist.newsTitlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">{t("journalist.newsContent")}</label>
                <textarea
                  id="content"
                  placeholder={t("journalist.newsContentPlaceholder")}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows="10"
                  disabled={loading}
                ></textarea>
                <div className="char-count">
                  {content.length} / 5000 {t("journalist.characters")}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success publish-btn"
                disabled={loading || !title || !content}
              >
                {loading ? t("journalist.publishing") : t("journalist.publishButton")}
              </button>
            </form>
          </div>

          <div className="tips-card card">
            <h3>{t("journalist.tips")}</h3>
            <ul>
              <li>{t("journalist.tip1")}</li>
              <li>{t("journalist.tip2")}</li>
              <li>{t("journalist.tip3")}</li>
              <li>{t("journalist.tip4")}</li>
              <li>{t("journalist.tip5")}</li>
            </ul>
          </div>
        </div>
      </div>
      <footer className="footer">
        <p>{t("common.footer")}</p>
      </footer>
    </>
  );
}

export default Journalist;
