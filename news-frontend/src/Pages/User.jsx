import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";
import "../styles/User.css";

function User() {
  const { t, language } = useLanguage();
  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [newsRes, favRes] = await Promise.all([
        api.get("/news"),
        api.get("/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setNews(newsRes.data);
      setFavorites(favRes.data.map((fav) => fav.news_id));
      setError(null);
    } catch (err) {
      setError(t("common.errorLoadingData"));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [fetchData, token, navigate, language]);

  const getTitle = (article) => {
    return language === "en" && article.title_en ? article.title_en : article.title;
  };

  const getContent = (article) => {
    return language === "en" && article.content_en ? article.content_en : article.content;
  };

  const toggleFavorite = async (newsId) => {
    try {
      if (favorites.includes(newsId)) {
        await api.delete(`/favorites/${newsId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites((current) => current.filter((id) => id !== newsId));
      } else {
        await api.post(
          "/favorites",
          { news_id: newsId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites((current) => [...current, newsId]);
      }
    } catch (err) {
      console.error("Error updating favorites:", err);
    }
  };

  const displayedNews = showFavOnly
    ? news.filter((article) => favorites.includes(article.id))
    : news;

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1>{t("user.title")}</h1>
          <p>{t("user.subtitle")}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="user-toolbar">
          <button
            className={`btn ${showFavOnly ? "btn-warning" : "btn-secondary"}`}
            onClick={() => setShowFavOnly(!showFavOnly)}
          >
            {showFavOnly ? t("user.viewAll") : t("user.viewFavorites")}
          </button>
          <span className="news-count">
            {t("user.totalNews")}: {displayedNews.length}
          </span>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : displayedNews.length === 0 ? (
          <div className="empty-state">
            <p>
              {showFavOnly
                ? t("user.noFavorites")
                : t("home.noNews")}
            </p>
          </div>
        ) : (
          <div className="news-list">
            {displayedNews.map((article) => (
              <article
                key={article.id}
                className={`user-news-item card ${
                  favorites.includes(article.id) ? "is-favorite" : ""
                }`}
              >
                <div className="news-item-header">
                  <div>
                    <h2>{getTitle(article)}</h2>
                    <p className="news-meta">
                      {t("home.author")}: <strong>{article.author}</strong> •{" "}
                      {new Date(article.created_at).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                    </p>
                  </div>
                  <div className="favorite-badge">
                    {favorites.includes(article.id) && "❤️"}
                  </div>
                </div>
                <p className="news-content">{getContent(article)}</p>
                <div className="news-item-footer">
                  <button
                    className={`btn ${
                      favorites.includes(article.id)
                        ? "btn-danger"
                        : "btn-primary"
                    }`}
                    onClick={() => toggleFavorite(article.id)}
                  >
                    {favorites.includes(article.id)
                      ? t("user.removeFromFavorites")
                      : t("user.addToFavorites")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>{t("common.footer")}</p>
      </footer>
    </>
  );
}

export default User;
