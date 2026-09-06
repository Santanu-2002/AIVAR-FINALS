import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "../global/slices/loginSlice";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "History", to: "/history" },
];

export default function Navbar() {
  const token = useSelector((state) => state.login.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("aivar_token");
    dispatch(clearCredentials());
    navigate("/login");
  }

  return (
    <header className="navbar">
      <span className="navbar__brand">Bessemer · AIVAR</span>
      <span className="navbar__title">AI — Autonomous Agent</span>
      <nav className="navbar__links">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              isActive ? "navbar__link is-active" : "navbar__link"
            }
          >
            {item.label}
          </NavLink>
        ))}
        {token ? (
          <button type="button" className="navbar__link" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "navbar__link is-active" : "navbar__link"
            }
          >
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}