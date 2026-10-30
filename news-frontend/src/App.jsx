import { useCallback, useEffect, useState } from "react";
import api from "./api";
import Header from "./components/Header";
import { useLanguage } from "./i18n/useLanguage";
import "./App.css";

function App() {
  const { t, language } = useLanguage();
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
  }, [fetchNews, language]);

  const getTitle = (article) => {
    return language === "en" && article.title_en ? article.title_en : article.title;
  };

  const getContent = (article) => {
    return language === "en" && article.content_en ? article.content_en : article.content;
  };

  return (
    <div className="app">
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
                <div className="news-image-wrapper">
                  {article.image_url && (
                    <div className="news-image">
                      <img 
                        src={article.image_url} 
                        alt={getTitle(article)}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="%23ddd" width="600" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="24">صورة غير متوفرة</text></svg>';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="news-body">
                  <div className="news-header">
                    <h2>{getTitle(article)}</h2>
                    <span className="news-date">
                      {new Date(article.created_at).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                    </span>
                  </div>
                  <p className="news-content">{getContent(article)}</p>
                  <div className="news-footer">
                    <span className="news-author">{t("home.author")}: {article.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>{t("common.footer")}</p>
      </footer>
    </div>
  );
}

export default App;
