import { useCallback, useEffect, useState } from "react";
import api from "../api";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";

function Home() {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/news");
      setNews(res.data);
      setError(null);
    } catch (err) {
      setError(t("common.errorLoadingNews"));
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1>{t("home.title")}</h1>
          <p>{t("home.subtitle")}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner"></div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <p>{t("home.noNews")}</p>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((article) => (
              <article key={article.id} className="news-card card">
                <div className="news-header">
                  <h2>{article.title}</h2>
                  <span className="news-date">
                    {new Date(article.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <p className="news-content">{article.content}</p>
                <div className="news-footer">
                  <span className="news-author">
                    {t("home.author")}: {article.author}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
