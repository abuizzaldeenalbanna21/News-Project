import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../i18n/useLanguage";
import "../styles/Pages.css";
import "../styles/Admin.css";

function Admin() {
  const { t, language } = useLanguage();
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("news");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "news") {
        const res = await api.get("/admin/news", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(res.data);
      } else if (activeTab === "users") {
        const res = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      }
      setError(null);
    } catch (err) {
      setError(t("common.errorLoadingData"));
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, t, token]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [loadData, token, language]);

  const getTitle = (article) => {
    return language === "en" && article.title_en ? article.title_en : article.title;
  };

  const getContent = (article) => {
    return language === "en" && article.content_en ? article.content_en : article.content;
  };

  const deleteNews = async (newsId) => {
    try {
      await api.delete(`/news/${newsId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(news.filter((n) => n.id !== newsId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(t("common.errorLoadingData"));
      console.error("Error deleting news:", err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== userId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(t("common.errorLoadingData"));
      console.error("Error deleting user:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="page-header">
          <h1>{t("admin.title")}</h1>
          <p>{t("admin.subtitle")}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "news" ? "active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            {t("admin.newsTab")} ({news.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            {t("admin.usersTab")} ({users.length})
          </button>
        </div>

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="admin-content">
            {activeTab === "news" && (
              <div>
                {news.length === 0 ? (
                  <div className="empty-state">
                    <p>{t("admin.noNews")}</p>
                  </div>
                ) : (
                  <div className="news-management">
                    {news.map((article) => (
                      <div key={article.id} className="news-admin-card card">
                        <div className="card-header">
                          <h3>{getTitle(article)}</h3>
                          <span className="badge">
                            {new Date(article.created_at).toLocaleDateString(
                              language === "en" ? "en-US" : "ar-SA"
                            )}
                          </span>
                        </div>
                        <p className="card-content">{getContent(article)}</p>
                        <div className="card-meta">
                          <span>{t("home.author")}: <strong>{article.author}</strong></span>
                        </div>
                        <div className="card-actions">
                          {deleteConfirm === article.id ? (
                            <div className="confirm-delete">
                              <p>{t("admin.deleteConfirm")}</p>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteNews(article.id)}
                              >
                                {t("admin.yes")}
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                {t("admin.cancel")}
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-danger"
                              onClick={() => setDeleteConfirm(article.id)}
                            >
                              {t("admin.deleteButton")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div>
                {users.length === 0 ? (
                  <div className="empty-state">
                    <p>{t("admin.noUsers")}</p>
                  </div>
                ) : (
                  <div className="users-table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t("admin.email")}</th>
                          <th>{t("admin.role")}</th>
                          <th>{t("admin.action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge role-${user.role}`}>
                                {user.role === "user"
                                  ? t("admin.user")
                                  : user.role === "journalist"
                                  ? t("admin.journalist")
                                  : t("admin.admin")}
                              </span>
                            </td>
                            <td>
                              {deleteConfirm === user.id ? (
                                <div className="confirm-delete">
                                  <p>{t("admin.deleteUserConfirm")}</p>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteUser(user.id)}
                                  >
                                    {t("admin.yes")}
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    {t("admin.cancel")}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setDeleteConfirm(user.id)}
                                >
                                  {t("admin.delete")}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>{t("common.footer")}</p>
      </footer>
    </>
  );
}

export default Admin;
