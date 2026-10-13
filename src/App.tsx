import { useEffect, useMemo, useState } from "react";
import paperData from "./papers.json";

type IconName =
  | "archive"
  | "bookmark"
  | "book"
  | "chevron"
  | "clock"
  | "download"
  | "external"
  | "filter"
  | "grid"
  | "list"
  | "menu"
  | "search"
  | "upload"
  | "x";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    archive: <><path d="M3 6h18" /><path d="M5 6v14h14V6" /><path d="M9 10h6" /><path d="m4 3 1 3h14l1-3Z" /></>,
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    external: <><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const subjects = [
  { name: "中文语言与文学", code: "CHINESE A", color: "rose", count: 74 },
  { name: "数学：分析与方法", code: "MATHEMATICS AA", color: "blue", count: 248 },
  { name: "英语 B", code: "ENGLISH B", color: "green", count: 231 },
  { name: "物理", code: "PHYSICS", color: "violet", count: 464 },
  { name: "化学", code: "CHEMISTRY", color: "teal", count: 533 },
  { name: "经济学", code: "ECONOMICS", color: "orange", count: 350 },
  { name: "环境系统与社会", code: "ESS", color: "green", count: 227 },
];

const archiveYears = Array.from({ length: 10 }, (_, index) => 2024 - index);

type Paper = {
  id: number;
  subject: string;
  title: string;
  level: string;
  paper: string;
  year: string;
  session: string;
  zone: string;
  kind: string;
  color: string;
  url: string;
};

const papers = paperData as Paper[];

export default function App() {
  const [activePage, setActivePage] = useState<"papers" | "questionbank" | "syllabus" | "favorites">("papers");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("全部科目");
  const [sortOrder, setSortOrder] = useState("最新优先");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(48);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("ibvault-current-user") || "");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filtered = useMemo(() => papers.filter((item) => {
    const matchesSearch = `${item.title} ${item.paper} ${item.year}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch
      && (subject === "全部科目" || item.subject === subject);
  }).sort((a, b) => sortOrder === "最新优先" ? Number(b.year) - Number(a.year) : Number(a.year) - Number(b.year)), [search, subject, sortOrder]);

  const displayedPapers = activePage === "favorites"
    ? filtered.filter((item) => bookmarks.includes(item.id))
    : filtered;

  useEffect(() => setVisibleCount(48), [search, subject, sortOrder, activePage]);

  useEffect(() => {
    if (!userEmail) {
      setBookmarks([]);
      return;
    }
    const saved = localStorage.getItem(`ibvault-bookmarks:${userEmail}`);
    try {
      setBookmarks(saved ? JSON.parse(saved) : []);
    } catch {
      setBookmarks([]);
    }
  }, [userEmail]);

  const clearFilters = () => {
    setSubject("全部科目");
    setSearch("");
  };

  const toggleBookmark = (id: number) => {
    if (!userEmail) {
      setLoginOpen(true);
      return;
    }
    setBookmarks((items) => {
      const next = items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
      localStorage.setItem(`ibvault-bookmarks:${userEmail}`, JSON.stringify(next));
      return next;
    });
  };

  const login = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();
    if (!normalizedEmail || !loginPassword) return;
    localStorage.setItem("ibvault-current-user", normalizedEmail);
    setUserEmail(normalizedEmail);
    setLoginOpen(false);
    setLoginPassword("");
  };

  const logout = () => {
    localStorage.removeItem("ibvault-current-user");
    setUserEmail("");
    setActivePage("papers");
  };

  const openSubject = (subjectName: string) => {
    setSubject(subjectName);
    setActivePage("papers");
    window.setTimeout(() => {
      document.getElementById("paper-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Icon name="archive" size={20} /></span>
          <span>IB<span>Vault</span></span>
        </div>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button className={`nav-item ${activePage === "papers" ? "active" : ""}`} onClick={() => setActivePage("papers")}>历年真题</button>
          <button className={`nav-item ${activePage === "questionbank" ? "active" : ""}`} onClick={() => setActivePage("questionbank")}>题库</button>
          <button className={`nav-item ${activePage === "syllabus" ? "active" : ""}`} onClick={() => setActivePage("syllabus")}>课程大纲</button>
          <button className={`nav-item ${activePage === "favorites" ? "active" : ""}`} onClick={() => userEmail ? setActivePage("favorites") : setLoginOpen(true)}>我的收藏</button>
        </nav>
        <div className="top-actions">
          <a className="ibdocs-button" href="https://ibdocs.re/" target="_blank" rel="noreferrer">前往 IB Documents <Icon name="chevron" size={15} /></a>
          {userEmail ? (
            <div className="user-actions">
              <button className="account-button" onClick={() => setActivePage("favorites")}>{userEmail.slice(0, 1).toUpperCase()}<span>{userEmail}</span></button>
              <button className="logout-button" onClick={logout}>退出</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => setLoginOpen(true)}>登录</button>
          )}
          <button className="mobile-menu" onClick={() => setMobileNavOpen((open) => !open)} aria-label="打开菜单"><Icon name={mobileNavOpen ? "x" : "menu"} /></button>
        </div>
        {mobileNavOpen && (
          <nav className="mobile-nav" aria-label="移动端导航">
            <button onClick={() => { setActivePage("papers"); setMobileNavOpen(false); }}>历年真题</button>
            <button onClick={() => { setActivePage("questionbank"); setMobileNavOpen(false); }}>题库</button>
            <button onClick={() => { setActivePage("syllabus"); setMobileNavOpen(false); }}>课程大纲</button>
            <button onClick={() => { userEmail ? setActivePage("favorites") : setLoginOpen(true); setMobileNavOpen(false); }}>我的收藏</button>
            {!userEmail && <button className="mobile-login" onClick={() => { setLoginOpen(true); setMobileNavOpen(false); }}>登录账户</button>}
          </nav>
        )}
      </header>

      <main>
        {activePage === "papers" && <>
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">IB 学习资料库</p>
            <h1>找到真题。<br /><em>掌握考试。</em></h1>
            <p className="hero-copy">专为 IB 学生整理的真题资料库，按科目、考试场次和等级快速查找你拥有使用权的资料。</p>
            <div className="hero-search">
              <Icon name="search" size={21} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索科目、试卷或考试场次…" />
              <kbd>⌘ K</kbd>
            </div>
            <div className="hero-stats">
              <div><strong>7</strong><span>核心科目</span></div>
              <div><strong>2,127</strong><span>真实文档链接</span></div>
              <div><strong>2015–24</strong><span>考试年份</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="paper-stack stack-back">IB</div>
            <div className="paper-stack stack-front">
              <span>PHYSICS</span>
              <b>Higher level<br />Paper 2</b>
              <small>SPECIMEN PAPER · 2025</small>
              <i>02</i>
            </div>
          </div>
        </section>
        </>}

        {(activePage === "questionbank" || activePage === "syllabus") && (
          <section className="resource-hub">
            <p className="eyebrow dark">{activePage === "questionbank" ? "按主题练习" : "掌握课程要求"}</p>
            <h1>{activePage === "questionbank" ? "IB 题库" : "IB 课程大纲"}</h1>
            <p className="hub-intro">{activePage === "questionbank" ? "按科目进入专题题库，针对薄弱知识点进行练习。" : "查看各科课程结构、评估目标与最新教学大纲。"}</p>
            <div className="resource-grid">
              {subjects.map((item) => (
                <article className={`resource-card ${item.color}`} key={item.name}>
                  <span className="resource-icon"><Icon name={activePage === "questionbank" ? "archive" : "book"} size={22} /></span>
                  <small>{item.code}</small>
                  <h2>{item.name}</h2>
                  <p>{activePage === "questionbank" ? "专题练习 · 章节分类 · 答案解析" : "课程结构 · 评估说明 · 学习目标"}</p>
                  <a href={activePage === "questionbank" ? "https://ibdocs.re/questionbanks" : "https://ibdocs.re/subject-guides"} target="_blank" rel="noreferrer">
                    {activePage === "questionbank" ? "进入题库" : "查看课程大纲"} <Icon name="external" size={14} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        {activePage === "papers" && <section className="subject-strip">
          <div className="section-heading">
            <div><p className="eyebrow dark">浏览资料库</p><h2>选择科目</h2></div>
            <button className="text-button" onClick={clearFilters}>查看全部试卷 <Icon name="chevron" size={16} /></button>
          </div>
          <div className="subject-grid">
            {subjects.map((item) => (
              <button
                className={`subject-card ${item.color} ${subject === item.name ? "active" : ""}`}
                key={item.name}
                onClick={() => openSubject(item.name)}
                aria-pressed={subject === item.name}
              >
                <span className="subject-icon"><Icon name="book" size={20} /></span>
                <span className="subject-name">{item.name}</span>
                <span className="subject-meta">{item.code} · {item.count} papers</span>
                <span className="subject-arrow"><Icon name="chevron" size={16} /></span>
              </button>
            ))}
          </div>
          <div className="year-archive">
            <div>
              <strong>历年归档</strong>
              <span>在 IB Docs 查看较早年份的完整目录</span>
            </div>
            <div className="year-links">
              {archiveYears.map((archiveYear) => (
                <a key={archiveYear} href={`https://ibdocs.re/past-papers/${archiveYear}`} target="_blank" rel="noreferrer">{archiveYear}</a>
              ))}
            </div>
          </div>
        </section>}

        {(activePage === "papers" || activePage === "favorites") && <section className={`library ${activePage === "favorites" ? "favorites-library" : ""}`} id="paper-library">
          <div className="results">
            <div className="results-bar">
              <div>
                <p className="eyebrow dark">{activePage === "favorites" ? "个人资料库" : "试卷目录"}</p>
                <h2>{activePage === "favorites" ? "我的收藏" : "历年真题"} <span>{displayedPapers.length}</span></h2>
              </div>
              <div className="result-actions">
                <select className="sort-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="排序方式">
                  <option>最新优先</option>
                  <option>最早优先</option>
                </select>
                <div className="view-toggle">
                  <button className={view === "grid" ? "selected" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Icon name="grid" size={17} /></button>
                  <button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} aria-label="List view"><Icon name="list" size={18} /></button>
                </div>
              </div>
            </div>

            {displayedPapers.length ? (
              <div className={`paper-grid ${view}`}>
                {displayedPapers.slice(0, visibleCount).map((item) => (
                  <article className="paper-card" key={item.id}>
                    <div className={`paper-cover ${item.color}`}>
                      <span className="cover-brand">IB DIPLOMA PROGRAMME</span>
                      <strong>{item.subject}</strong>
                      <small>{item.level === "HL" ? "Higher" : "Standard"} level</small>
                      <div className="cover-number">{item.year.slice(-2)}</div>
                      <button className={`bookmark ${bookmarks.includes(item.id) ? "saved" : ""}`} onClick={() => toggleBookmark(item.id)} aria-label="Save paper"><Icon name="bookmark" size={17} /></button>
                    </div>
                    <div className="paper-info">
                      <div className="paper-card-top">
                        <div className="paper-tags"><span>{item.level}</span><span>{item.paper}</span><span className={item.kind === "评分标准" ? "markscheme" : ""}>{item.kind}</span></div>
                        <span className="source-badge">IB DOCUMENTS</span>
                      </div>
                      <h3>{item.title}</h3>
                      <div className="document-meta">
                        <div><small>考试年份</small><strong>{item.year}</strong></div>
                        <div><small>考试场次</small><strong>{item.session.replace(item.year, "").trim()}</strong></div>
                        <div><small>试卷类型</small><strong>{item.paper}</strong></div>
                      </div>
                      <div className="document-source">
                        <div><span>来源网站</span><strong>ibdocs.re/documents/…</strong></div>
                        <a className="source-link" href={item.url} target="_blank" rel="noreferrer">
                          打开 PDF 详情 <Icon name="external" size={13} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name={activePage === "favorites" ? "bookmark" : "search"} size={28} />
                <h3>{activePage === "favorites" ? "还没有收藏试卷" : "没有找到试卷"}</h3>
                <p>{activePage === "favorites" ? "浏览历年真题并点击书签，即可保存到这里。" : "请尝试更改搜索关键词。"}</p>
                <button onClick={() => activePage === "favorites" ? setActivePage("papers") : clearFilters()}>{activePage === "favorites" ? "浏览真题" : "清除搜索"}</button>
              </div>
            )}
            {visibleCount < displayedPapers.length && (
              <button className="load-more" onClick={() => setVisibleCount((count) => count + 48)}>
                加载更多链接（剩余 {displayedPapers.length - visibleCount}）
              </button>
            )}
          </div>
        </section>}
      </main>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark"><Icon name="archive" size={19} /></span><span>IB<span>Vault</span></span></div>
        <p>专注于高效学习。IB Vault 为独立资料整理工具，与国际文凭组织无隶属关系。</p>
        <span>© 2025 IB Vault</span>
      </footer>

      {loginOpen && (
        <div className="modal-backdrop" onMouseDown={() => setLoginOpen(false)}>
          <section className="login-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="login-close" onClick={() => setLoginOpen(false)} aria-label="关闭"><Icon name="x" /></button>
            <span className="login-mark"><Icon name="archive" size={23} /></span>
            <p className="eyebrow dark">个人学习空间</p>
            <h2>登录 IB Vault</h2>
            <p>登录后，你的收藏会按账户独立保存。</p>
            <form onSubmit={login}>
              <label>邮箱地址<input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="name@example.com" required /></label>
              <label>密码<input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="输入密码" required /></label>
              <button type="submit">登录并继续</button>
            </form>
            <small>演示版账户信息仅保存在当前浏览器，不会上传到服务器。</small>
          </section>
        </div>
      )}
    </div>
  );
}
