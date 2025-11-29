import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * ===========================
 *  MOCK BACKEND TRONG FRONTEND
 *  (giả lập API: auth, suggestions, likes, profile)
 * ===========================
 */

const mockBackend = (() => {
  // "Database" giả
  let users = [
    {
      id: 1,
      fullName: "Tú",
      email: "tu@example.com",
      password: "123456",
      age: 21,
      gender: "male",
      city: "Hà Nội",
      bio: "Thích uống trà sữa, code đêm.",
    },
    {
      id: 2,
      fullName: "Lan",
      email: "lan@example.com",
      password: "123456",
      age: 20,
      gender: "female",
      city: "TP. HCM",
      bio: "Mê phim, mèo và cà phê.",
    },
    {
      id: 3,
      fullName: "Huy",
      email: "huy@example.com",
      password: "123456",
      age: 23,
      gender: "male",
      city: "Đà Nẵng",
      bio: "Game thủ part-time, dev full-time.",
    },
  ];

  let nextUserId = 4;
  // likesByUserId: userId -> Set<targetUserId>
  const likesByUserId = new Map();

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  function makeToken(userId) {
    return `mock-token-${userId}`;
  }
  function parseToken(token) {
    if (!token || !token.startsWith("mock-token-")) return null;
    const idStr = token.replace("mock-token-", "");
    const id = Number(idStr);
    return Number.isNaN(id) ? null : id;
  }

  function findUserByEmail(email) {
    return users.find((u) => u.email === email);
  }
  function cloneUser(u) {
    if (!u) return null;
    const { password, ...rest } = u;
    return { ...rest };
  }

  return {
    // POST /api/auth/register
    async register({ fullName, email, password }) {
      await delay(400);
      if (findUserByEmail(email)) {
        return {
          ok: false,
          status: 409,
          message: "Email đã tồn tại",
        };
      }
      const newUser = {
        id: nextUserId++,
        fullName,
        email,
        password,
        age: "",
        gender: "",
        city: "",
        bio: "",
      };
      users.push(newUser);
      return {
        ok: true,
        status: 201,
        data: cloneUser(newUser),
      };
    },

    // POST /api/auth/login
    async login({ email, password }) {
      await delay(400);
      const u = findUserByEmail(email);
      if (!u || u.password !== password) {
        return {
          ok: false,
          status: 401,
          message: "Sai email hoặc mật khẩu",
        };
      }
      const token = makeToken(u.id);
      return {
        ok: true,
        status: 200,
        data: {
          token,
          user: cloneUser(u),
        },
      };
    },

    // GET /api/users/suggestions
    async getSuggestions(token) {
      await delay(300);
      const userId = parseToken(token);
      if (!userId) {
        return { ok: false, status: 401, message: "Token không hợp lệ" };
      }
      const me = users.find((u) => u.id === userId);
      if (!me) {
        return { ok: false, status: 404, message: "Không tìm thấy user" };
      }
      // Gợi ý: tất cả user khác mình
      const suggestions = users
        .filter((u) => u.id !== userId)
        .map((u) => ({
          id: u.id,
          name: u.fullName,
          age: u.age || "??",
          city: u.city || "Chưa rõ",
          bio: u.bio || "",
          gender: u.gender || "",
          image: `https://picsum.photos/400/300?random=${u.id}`,
        }));
      return { ok: true, status: 200, data: suggestions };
    },

    // POST /api/like/{targetId}
    async likeUser(token, targetId) {
      await delay(200);
      const userId = parseToken(token);
      if (!userId) {
        return { ok: false, status: 401, message: "Token không hợp lệ" };
      }
      if (!likesByUserId.has(userId)) {
        likesByUserId.set(userId, new Set());
      }
      likesByUserId.get(userId).add(targetId);
      return { ok: true, status: 200, data: { success: true } };
    },

    // GET /api/like/my-likes
    async getMyLikes(token) {
      await delay(250);
      const userId = parseToken(token);
      if (!userId) {
        return { ok: false, status: 401, message: "Token không hợp lệ" };
      }
      const likedSet = likesByUserId.get(userId) || new Set();
      const likedUsers = users.filter((u) => likedSet.has(u.id)).map(cloneUser);
      return { ok: true, status: 200, data: likedUsers };
    },

    // GET /api/users/me
    async getMyProfile(token) {
      await delay(250);
      const userId = parseToken(token);
      if (!userId) {
        return { ok: false, status: 401, message: "Token không hợp lệ" };
      }
      const u = users.find((u) => u.id === userId);
      if (!u) {
        return { ok: false, status: 404, message: "Không tìm thấy user" };
      }
      return { ok: true, status: 200, data: cloneUser(u) };
    },

    // PUT /api/users/me
    async updateMyProfile(token, payload) {
      await delay(250);
      const userId = parseToken(token);
      if (!userId) {
        return { ok: false, status: 401, message: "Token không hợp lệ" };
      }
      const u = users.find((u) => u.id === userId);
      if (!u) {
        return { ok: false, status: 404, message: "Không tìm thấy user" };
      }
      Object.assign(u, payload);
      return { ok: true, status: 200, data: cloneUser(u) };
    },
  };
})();

/**
 * ===========================
 *  CONSTANTS / HELPERS
 * ===========================
 */

// UI text đa ngôn ngữ đơn giản
const uiText = {
  vi: {
    appTitle: "DATING APP",
    homeTab: "Trang chủ",
    likesTab: "Đã thích",
    profileTab: "Hồ sơ",
    activityTab: "Hoạt động",
    statsTab: "Thống kê",
    prefsTab: "Gu của bạn",
    loginTitle: "Đăng nhập",
    registerTitle: "Đăng ký",
    loginButton: "Đăng nhập",
    registerButton: "Đăng ký",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Mật khẩu",
    fullNamePlaceholder: "Họ và tên",
  },
  en: {
    appTitle: "DATING APP",
    homeTab: "Home",
    likesTab: "Liked",
    profileTab: "Profile",
    activityTab: "Activity",
    statsTab: "Stats",
    prefsTab: "Preferences",
    loginTitle: "Sign in",
    registerTitle: "Sign up",
    loginButton: "Sign in",
    registerButton: "Sign up",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    fullNamePlaceholder: "Full name",
  },
};

// Gợi ý bio
const bioTemplates = [
  (p) =>
    `Mình là ${p.fullName || "một người khá hướng nội"}, thích cà phê và những cuộc trò chuyện nhẹ nhàng.`,
  (p) =>
    `${p.fullName || "Mình"} hiện đang ở ${
      p.city || "một thành phố xinh đẹp"
    }, rảnh thì đi dạo phố, xem phim hoặc nghe nhạc.`,
  (p) =>
    `Tuổi ${
      p.age || "20+"
    }, không quá nghiêm túc, chỉ cần một người để nói chuyện mỗi tối 🌙.`,
  (p) =>
    `Yêu mèo, ghét sự giả dối. Nếu bạn cũng thích ${
      p.city || "thành phố này"
    }, mình nghĩ chúng ta hợp đấy 😄.`,
];

// Lọc suggestion theo preference + block list
const applyPreferences = (list, prefs, blockedIds) => {
  const blockedSet = new Set(blockedIds || []);
  let result = list.filter((u) => !blockedSet.has(u.id));

  if (!prefs) return result;

  const { preferredGender, minAge, maxAge, preferredCity } = prefs;

  if (preferredGender) {
    result = result.filter(
      (u) => (u.gender || "").toLowerCase() === preferredGender
    );
  }

  const min = parseInt(minAge, 10);
  const max = parseInt(maxAge, 10);
  if (!isNaN(min) || !isNaN(max)) {
    result = result.filter((u) => {
      const ageNum = parseInt(u.age, 10);
      if (isNaN(ageNum)) return true;
      if (!isNaN(min) && ageNum < min) return false;
      if (!isNaN(max) && ageNum > max) return false;
      return true;
    });
  }

  if (preferredCity) {
    const keyword = preferredCity.toLowerCase();
    result = result.filter((u) =>
      (u.city || "").toLowerCase().includes(keyword)
    );
  }

  return result;
};

/**
 * ===========================
 *  APP CHÍNH
 * ===========================
 */

function App() {
  // Title
  useEffect(() => {
    document.title = "DATING APP";
  }, []);

  // ---------- LANGUAGE / THEME ----------
  const [language, setLanguage] = useState("vi");
  const [theme, setTheme] = useState("light");

  // ---------- AUTH ----------
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  // ---------- TABS / DATA ----------
  const [activeTab, setActiveTab] = useState("home"); // home | likes | profile | activity | stats | prefs
  const [baseSuggestions, setBaseSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likes, setLikes] = useState([]);
  const [profile, setProfile] = useState({
    fullName: "",
    age: "",
    gender: "",
    city: "",
    bio: "",
  });
  const [loadingData, setLoadingData] = useState(false);

  // ---------- MATCH / CHAT FLOATING ----------
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // ---------- MATCH STATUS ----------
  const [matchStatus, setMatchStatus] = useState({}); // userId -> status

  // ---------- HOẠT ĐỘNG ----------
  const [activities, setActivities] = useState([]);

  // ---------- THỐNG KÊ ----------
  const [stats, setStats] = useState({
    suggestionsViewed: 0,
    likedCount: 0,
    skippedCount: 0,
    profileUpdatedCount: 0,
  });

  // ---------- NOTIFICATIONS ----------
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ---------- PREFERENCES (GU) ----------
  const [preferences, setPreferences] = useState({
    preferredGender: "",
    minAge: "",
    maxAge: "",
    preferredCity: "",
  });

  // ---------- BLOCK LIST ----------
  const [blockedIds, setBlockedIds] = useState([]);

  // Text theo language
  const text = uiText[language];

  // Helper time
  const getTimeString = () =>
    new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Helper: activity
  const addActivity = (type, message) => {
    const time = getTimeString();
    setActivities((prev) => [
      { id: prev.length + 1, type, message, time },
      ...prev,
    ]);
  };

  // Helper: notification
  const addNotification = (message) => {
    const time = getTimeString();
    setNotifications((prev) => [
      { id: prev.length + 1, message, time, isRead: false },
      ...prev,
    ]);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      localStorage.setItem("appLanguage", next);
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("appTheme", next);
      return next;
    });
  };

  // ---------- INIT language/theme/prefs/token ----------
  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage");
    if (savedLang === "vi" || savedLang === "en") setLanguage(savedLang);

    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

    const savedPrefs = localStorage.getItem("matchPreferences");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch {
        // ignore
      }
    }

    const savedToken = localStorage.getItem("mockToken");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Khi có token -> load profile + suggestions + likes
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoadingData(true);

      const pRes = await mockBackend.getMyProfile(token);
      if (pRes.ok) {
        setCurrentUser(pRes.data);
        setProfile({
          fullName: pRes.data.fullName || "",
          age: pRes.data.age || "",
          gender: pRes.data.gender || "",
          city: pRes.data.city || "",
          bio: pRes.data.bio || "",
        });
      }

      const sRes = await mockBackend.getSuggestions(token);
      if (sRes.ok) {
        setBaseSuggestions(sRes.data);
        setCurrentIndex(0);
      }

      const lRes = await mockBackend.getMyLikes(token);
      if (lRes.ok) {
        setLikes(lRes.data);
        if (!activeMatchId && lRes.data.length > 0) {
          setActiveMatchId(lRes.data[0].id);
        }
      }

      setLoadingData(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Áp dụng preferences + block lên suggestions
  useEffect(() => {
    const filtered = applyPreferences(baseSuggestions, preferences, blockedIds);
    setSuggestions(filtered);
    setCurrentIndex(0);
  }, [baseSuggestions, preferences, blockedIds]);

  // Khi đã có activeMatchId nhưng chưa có chatMessages -> tạo tin đầu tiên
  useEffect(() => {
    if (!activeMatchId || chatMessages.length > 0) return;
    const m = likes.find((u) => u.id === activeMatchId);
    if (!m) return;
    setChatMessages([
      {
        from: "them",
        text: `Bạn và ${m.fullName} đã match! Hãy bắt đầu trò chuyện nhé 💕`,
      },
    ]);
  }, [activeMatchId, likes, chatMessages.length]);

  // ---------- AUTH HANDLERS ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setLoadingAuth(true);

    const res = await mockBackend.login({ email, password });
    setLoadingAuth(false);

    if (!res.ok) {
      setAuthMessage(res.message || "Đăng nhập thất bại");
      return;
    }

    setToken(res.data.token);
    localStorage.setItem("mockToken", res.data.token);
    setCurrentUser(res.data.user);
    setAuthMessage("Đăng nhập thành công!");
    addActivity("LOGIN", "Bạn đã đăng nhập vào hệ thống");
    addNotification("Đăng nhập thành công.");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setLoadingAuth(true);

    const res = await mockBackend.register({ fullName, email, password });
    setLoadingAuth(false);

    if (!res.ok) {
      setAuthMessage(res.message || "Đăng ký thất bại");
      return;
    }

    setAuthMessage("Đăng ký thành công! Hãy đăng nhập.");
    setIsRegister(false);
    setPassword("");
    addActivity("REGISTER", "Bạn đã đăng ký tài khoản mới");
    addNotification("Đăng ký thành công, hãy đăng nhập.");
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("mockToken");
    setBaseSuggestions([]);
    setSuggestions([]);
    setLikes([]);
    setProfile({
      fullName: "",
      age: "",
      gender: "",
      city: "",
      bio: "",
    });
    setChatMessages([]);
    setChatInput("");
    setMatchStatus({});
    setActivities([]);
    setStats({
      suggestionsViewed: 0,
      likedCount: 0,
      skippedCount: 0,
      profileUpdatedCount: 0,
    });
    setNotifications([]);
    setActiveMatchId(null);
    setBlockedIds([]);
    setAuthMessage("Đã đăng xuất.");
  };

  // ---------- DATING HANDLERS ----------
  const currentSuggestion =
    suggestions.length > 0 && currentIndex < suggestions.length
      ? suggestions[currentIndex]
      : null;

  const handleSkip = () => {
    if (currentSuggestion) {
      setStats((prev) => ({
        ...prev,
        suggestionsViewed: prev.suggestionsViewed + 1,
        skippedCount: prev.skippedCount + 1,
      }));
      addActivity(
        "SKIP",
        `Bạn đã bỏ qua ${currentSuggestion.name || "người được gợi ý"}`
      );
    }

    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(suggestions.length);
    }
  };

  const handleLike = async () => {
    if (!currentSuggestion || !token) return;

    setStats((prev) => ({
      ...prev,
      suggestionsViewed: prev.suggestionsViewed + 1,
      likedCount: prev.likedCount + 1,
    }));
    addActivity(
      "LIKE",
      `Bạn đã thích ${currentSuggestion.name || "người được gợi ý"}`
    );
    addNotification(
      `Bạn vừa thích ${currentSuggestion.name || "một người dùng mới"}`
    );

    await mockBackend.likeUser(token, currentSuggestion.id);

    const lRes = await mockBackend.getMyLikes(token);
    if (lRes.ok) {
      setLikes(lRes.data);

      setMatchStatus((prev) => {
        const updated = { ...prev };
        lRes.data.forEach((u) => {
          if (!updated[u.id]) updated[u.id] = "MATCHED";
        });
        return updated;
      });

      if (!activeMatchId && lRes.data.length > 0) {
        setActiveMatchId(lRes.data[0].id);
      }
    }

    handleSkip();
  };

  // Report / Block
  const handleReportUser = (userId, name) => {
    addActivity("REPORT", `Bạn đã báo cáo ${name}`);
    addNotification(`Báo cáo của bạn về ${name} đã được ghi nhận.`);
  };

  const handleBlockUser = (userId, name) => {
    setBlockedIds((prev) =>
      prev.includes(userId) ? prev : [...prev, userId]
    );
    setBaseSuggestions((prev) => prev.filter((u) => u.id !== userId));
    setLikes((prev) => prev.filter((u) => u.id !== userId));

    addActivity("BLOCK", `Bạn đã chặn ${name}`);
    addNotification(`Bạn đã chặn ${name}. Họ sẽ không còn được gợi ý nữa.`);

    if (activeMatchId === userId) {
      setActiveMatchId(null);
      setChatMessages([]);
    }
  };

  // ---------- PROFILE HANDLERS ----------
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return;
    setAuthMessage("");

    const payload = {
      fullName: profile.fullName,
      age: profile.age,
      gender: profile.gender,
      city: profile.city,
      bio: profile.bio,
    };

    const res = await mockBackend.updateMyProfile(token, payload);
    if (!res.ok) {
      setAuthMessage(res.message || "Lưu hồ sơ thất bại");
      return;
    }
    setCurrentUser(res.data);
    setAuthMessage("Đã lưu hồ sơ!");

    setStats((prev) => ({
      ...prev,
      profileUpdatedCount: prev.profileUpdatedCount + 1,
    }));

    addActivity("UPDATE_PROFILE", "Bạn đã cập nhật hồ sơ cá nhân");
    addNotification("Hồ sơ của bạn đã được cập nhật.");
  };

  const handleSuggestBio = () => {
    const idx = Math.floor(Math.random() * bioTemplates.length);
    const newBio = bioTemplates[idx](profile);
    setProfile((prev) => ({ ...prev, bio: newBio }));
    addActivity("SUGGEST_BIO", "Bạn đã sử dụng tính năng gợi ý bio");
    addNotification("Đã gợi ý một đoạn giới thiệu mới cho bạn.");
  };

  const displayName =
    (currentUser && currentUser.fullName) ||
    profile.fullName ||
    fullName ||
    (email ? email.split("@")[0] : "Người dùng");

  // ---------- CHAT FLOATING HANDLER ----------
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const textMsg = chatInput.trim();

    const match = likes.find((u) => u.id === activeMatchId);
    setChatMessages((prev) => [...prev, { from: "me", text: textMsg }]);
    setChatInput("");

    if (match) {
      addActivity("CHAT", `Bạn đã nhắn tin cho ${match.fullName}`);
      addNotification(`Bạn vừa gửi 1 tin nhắn cho ${match.fullName}`);

      setMatchStatus((prev) => ({
        ...prev,
        [match.id]: "CHATTED",
      }));
    }
  };

  const firstMatch = likes.find((u) => u.id === activeMatchId) || null;

  const getMatchStatusText = (uId) => {
    const s = matchStatus[uId] || "MATCHED";
    if (s === "CHATTED") return "Đã nhắn tin";
    if (s === "MATCHED") return "Đã match";
    return "Đang chờ";
  };

  // ---------- PREFERENCES HANDLERS ----------
  const handlePrefChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem("matchPreferences", JSON.stringify(preferences));
    addActivity("PREFERENCE", "Bạn đã cập nhật gu tìm kiếm của mình");
    addNotification("Gu tìm kiếm của bạn đã được lưu.");
  };

  /**
   * ===================== RENDER AUTH (chưa login) =====================
   */
  if (!token) {
    return (
      <div className={`App theme-${theme}`}>
        {/* Hearts overlay */}
        <div className="hearts-overlay">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className="heart">
              ❤
            </span>
          ))}
        </div>

        <div className="auth-wrapper">
          <h1 className="app-title">{text.appTitle}</h1>

          <div className="auth-card">
            <h2>{isRegister ? text.registerTitle : text.loginTitle}</h2>

            <form
              className="auth-form"
              onSubmit={isRegister ? handleRegister : handleLogin}
            >
              {isRegister && (
                <input
                  type="text"
                  placeholder={text.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              )}

              <input
                type="email"
                placeholder={text.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder={text.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" disabled={loadingAuth}>
                {loadingAuth
                  ? isRegister
                    ? "Đang xử lý..."
                    : "Đang xử lý..."
                  : isRegister
                  ? text.registerButton
                  : text.loginButton}
              </button>
            </form>

            <p className="switch-auth">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthMessage("");
                }}
              >
                {isRegister ? "Đăng nhập" : "Đăng ký"}
              </button>
            </p>

            {authMessage && <p className="msg-text">{authMessage}</p>}
          </div>
        </div>
      </div>
    );
  }

  /**
   * ===================== RENDER APP (sau login) =====================
   */

  return (
    <div className={`App theme-${theme}`}>
      {/* Hearts overlay */}
      <div className="hearts-overlay">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className="heart">
            ❤
          </span>
        ))}
      </div>

      <div className="app-shell">
        {/* HEADER */}
        <header className="app-header">
          <div className="logo">{text.appTitle}</div>

          <nav className="nav-tabs">
            <button
              className={activeTab === "home" ? "tab active" : "tab"}
              onClick={() => setActiveTab("home")}
            >
              {text.homeTab}
            </button>
            <button
              className={activeTab === "likes" ? "tab active" : "tab"}
              onClick={() => setActiveTab("likes")}
            >
              {text.likesTab}
            </button>
            <button
              className={activeTab === "profile" ? "tab active" : "tab"}
              onClick={() => setActiveTab("profile")}
            >
              {text.profileTab}
            </button>
            <button
              className={activeTab === "prefs" ? "tab active" : "tab"}
              onClick={() => setActiveTab("prefs")}
            >
              {text.prefsTab}
            </button>
            <button
              className={activeTab === "activity" ? "tab active" : "tab"}
              onClick={() => setActiveTab("activity")}
            >
              {text.activityTab}
            </button>
            <button
              className={activeTab === "stats" ? "tab active" : "tab"}
              onClick={() => setActiveTab("stats")}
            >
              {text.statsTab}
            </button>
          </nav>

          <div className="header-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
            >
              {theme === "light" ? "☀️" : "🌙"}
            </button>
            <button
              type="button"
              className="lang-button"
              onClick={toggleLanguage}
            >
              {language === "vi" ? "VI" : "EN"}
            </button>

            <div className="notif-wrapper">
              <button
                type="button"
                className="notif-button"
                onClick={toggleNotifications}
              >
                🔔
              </button>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
              {showNotifications && (
                <div className="notif-dropdown">
                  <h4>Thông báo</h4>
                  {notifications.length === 0 ? (
                    <p className="notif-empty">Chưa có thông báo nào.</p>
                  ) : (
                    <ul>
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <div className="notif-message">{n.message}</div>
                          <div className="notif-time">{n.time}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <span className="hello-text">Xin chào, {displayName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="app-main">
          {loadingData && <p>Đang tải dữ liệu...</p>}

          {/* HOME TAB */}
          {activeTab === "home" && !loadingData && (
            <div className="home-tab">
              {currentSuggestion ? (
                <div className="user-card">
                  <img
                    src={currentSuggestion.image}
                    alt={currentSuggestion.name}
                    className="user-image"
                  />
                  <h2>
                    {currentSuggestion.name}, {currentSuggestion.age}
                  </h2>
                  <p className="user-city">{currentSuggestion.city}</p>
                  <p className="user-bio">{currentSuggestion.bio}</p>

                  <div className="card-actions">
                    <button className="btn-skip" onClick={handleSkip}>
                      Bỏ qua
                    </button>
                    <button className="btn-like" onClick={handleLike}>
                      Thích
                    </button>
                  </div>

                  <div className="secondary-actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleReportUser(
                          currentSuggestion.id,
                          currentSuggestion.name
                        )
                      }
                    >
                      Báo cáo
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleBlockUser(
                          currentSuggestion.id,
                          currentSuggestion.name
                        )
                      }
                    >
                      Chặn
                    </button>
                  </div>
                </div>
              ) : (
                <p>Hết người để gợi ý rồi 😆</p>
              )}
            </div>
          )}

          {/* LIKES TAB (MATCH BOARD) */}
          {activeTab === "likes" && !loadingData && (
            <div className="likes-tab">
              <h2>Bảng match của bạn</h2>
              {likes.length === 0 ? (
                <p>Chưa thích ai cả. Vào Trang chủ để bắt đầu nhé!</p>
              ) : (
                <div className="match-list">
                  {likes.map((u) => (
                    <div key={u.id} className="match-card">
                      <div className="match-avatar">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="match-info">
                        <div className="match-name">{u.fullName}</div>
                        <div className="match-meta">
                          {u.age || "??"} tuổi · {u.city || "Chưa rõ"}
                        </div>
                        <div
                          className={`match-status status-${(
                            matchStatus[u.id] || "MATCHED"
                          ).toLowerCase()}`}
                        >
                          {getMatchStatusText(u.id)}
                        </div>
                        <div className="match-extra-actions">
                          <button
                            type="button"
                            onClick={() => handleReportUser(u.id, u.fullName)}
                          >
                            Báo cáo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlockUser(u.id, u.fullName)}
                          >
                            Chặn
                          </button>
                        </div>
                      </div>
                      <button
                        className="match-chat-btn"
                        type="button"
                        onClick={() => {
                          setActiveMatchId(u.id);
                          addActivity(
                            "OPEN_CHAT",
                            `Bạn mở khung chat với ${u.fullName}`
                          );
                        }}
                      >
                        Mở chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && !loadingData && (
            <div className="profile-tab">
              <h2>Hồ sơ của bạn</h2>

              <form className="profile-form" onSubmit={handleSaveProfile}>
                <label>
                  Họ tên
                  <input
                    value={profile.fullName}
                    onChange={(e) =>
                      handleProfileChange("fullName", e.target.value)
                    }
                  />
                </label>

                <label>
                  Tuổi
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      handleProfileChange("age", e.target.value)
                    }
                  />
                </label>

                <label>
                  Giới tính
                  <select
                    value={profile.gender}
                    onChange={(e) =>
                      handleProfileChange("gender", e.target.value)
                    }
                  >
                    <option value="">-- Chọn --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </label>

                <label>
                  Thành phố
                  <input
                    value={profile.city}
                    onChange={(e) =>
                      handleProfileChange("city", e.target.value)
                    }
                  />
                </label>

                <label>
                  Giới thiệu
                  <textarea
                    rows="3"
                    value={profile.bio}
                    onChange={(e) =>
                      handleProfileChange("bio", e.target.value)
                    }
                  />
                </label>

                <div className="profile-buttons">
                  <button
                    className="suggest-bio-btn"
                    type="button"
                    onClick={handleSuggestBio}
                  >
                    Gợi ý bio
                  </button>
                  <button className="save-btn" type="submit">
                    Lưu hồ sơ
                  </button>
                </div>
              </form>

              {authMessage && <p className="msg-success">{authMessage}</p>}
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "prefs" && !loadingData && (
            <div className="prefs-tab">
              <h2>Gu của bạn</h2>
              <p className="prefs-desc">
                Thiết lập tiêu chí để lọc lại danh sách gợi ý cho phù hợp với
                gu của bạn.
              </p>

              <form className="prefs-form" onSubmit={handleSavePreferences}>
                <label>
                  Giới tính muốn tìm
                  <select
                    value={preferences.preferredGender}
                    onChange={(e) =>
                      handlePrefChange("preferredGender", e.target.value)
                    }
                  >
                    <option value="">Không chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </label>

                <div className="prefs-age-row">
                  <label>
                    Tuổi từ
                    <input
                      type="number"
                      value={preferences.minAge}
                      onChange={(e) =>
                        handlePrefChange("minAge", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    đến
                    <input
                      type="number"
                      value={preferences.maxAge}
                      onChange={(e) =>
                        handlePrefChange("maxAge", e.target.value)
                      }
                    />
                  </label>
                </div>

                <label>
                  Thành phố ưu tiên
                  <input
                    value={preferences.preferredCity}
                    onChange={(e) =>
                      handlePrefChange("preferredCity", e.target.value)
                    }
                  />
                </label>

                <button className="save-prefs-btn" type="submit">
                  Lưu gu
                </button>
              </form>

              <div className="prefs-preview">
                <p>
                  Đang áp dụng filter cho{" "}
                  <strong>{suggestions.length}</strong> người được gợi ý.
                </p>
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && !loadingData && (
            <div className="activity-tab">
              <h2>Hoạt động gần đây</h2>
              {activities.length === 0 ? (
                <p>
                  Chưa có hoạt động nào. Hãy bắt đầu like, skip hoặc cập nhật
                  hồ sơ!
                </p>
              ) : (
                <ul className="activity-list">
                  {activities.map((a) => (
                    <li key={a.id} className="activity-item">
                      <span className="activity-time">{a.time}</span>
                      <span className="activity-type">{a.type}</span>
                      <span className="activity-message">{a.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && !loadingData && (
            <div className="stats-tab">
              <h2>Thống kê của bạn</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Số người đã xem</div>
                  <div className="stat-value">{stats.suggestionsViewed}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Đã thích</div>
                  <div className="stat-value">{stats.likedCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Đã bỏ qua</div>
                  <div className="stat-value">{stats.skippedCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    Số lần cập nhật hồ sơ
                  </div>
                  <div className="stat-value">
                    {stats.profileUpdatedCount}
                  </div>
                </div>
              </div>

              <div className="stat-extra">
                <p>
                  Tỉ lệ like / tổng:{" "}
                  {stats.suggestionsViewed === 0
                    ? "0%"
                    : (
                        (stats.likedCount / stats.suggestionsViewed) *
                        100
                      ).toFixed(1) + "%"}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* BONG BÓNG CHAT GÓC DƯỚI PHẢI – chỉ hiện khi có match */}
        {firstMatch && (
          <div className="floating-chat">
            <div className="floating-chat-header">
              💬 Match với {firstMatch.fullName}
            </div>
            <div className="floating-chat-body">
              {chatMessages.length === 0 && (
                <p className="floating-chat-empty">
                  Hãy gửi tin nhắn đầu tiên cho {firstMatch.fullName} nhé!
                </p>
              )}
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={
                    m.from === "me"
                      ? "floating-bubble me"
                      : "floating-bubble them"
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form className="floating-chat-input" onSubmit={handleSendChat}>
              <input
                type="text"
                placeholder={`Nhắn gì đó cho ${firstMatch.fullName}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">Gửi</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
