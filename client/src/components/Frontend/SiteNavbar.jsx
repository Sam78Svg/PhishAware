import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BsShieldLockFill } from "react-icons/bs";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
];

export default function SiteNavbar() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <header>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setNavOpen(false)}>
          <BsShieldLockFill className="me-2" size={22} aria-hidden />
          PhishAware
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse justify-content-end${navOpen ? " show" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav align-items-lg-center gap-lg-1">
            {navLinks.map(({ to, label }) => (
              <li className="nav-item" key={to}>
                <Link
                  className={`nav-link${pathname === to ? " active" : ""}`}
                  to={to}
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <Link
                className="btn btn-primary w-100 w-lg-auto"
                to="/login"
                onClick={() => setNavOpen(false)}
              >
                Login to Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </header>
  );
}
