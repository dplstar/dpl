import { useEffect, useState } from "react";
import { useNavigation } from "../NavigationContext.jsx";
import { PIPES_RANGE } from "../data/pipes.js";
import "./Nav.css";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
];

const ArrowIcon = ({ size = 13 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const BurgerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);

export default function Nav() {
  const { page, goTo } = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // which dropdown is open: 'tanks', 'pipes' or null
  const [openMenu, setOpenMenu] = useState(null);
  const tanksOpen = openMenu === "tanks";
  const pipesOpen = openMenu === "pipes";
  const toggleMenu = (name) =>
    setOpenMenu((open) => (open === name ? null : name));

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 8);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  function handleGo(id, anchor) {
    setMobileOpen(false);
    setOpenMenu(null);
    goTo(id, anchor);
  }

  return (
    <nav className={`nav${isScrolled ? " is-scrolled" : ""}`}>
      <div className="shell nav-row">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("home");
          }}
        >
          <img
            src={
              isScrolled
                ? "/img/DPL%20Star%20Private%20Limited.png"
                : "/img/DPL-Star-Logo.png"
            }
            className="nav-logo"
            alt="DPL Star Private Limited"
          />
        </a>
        <div className="nav-links">
          <a
            href="#"
            className={`nav-a${page === "home" ? " on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleGo("home");
            }}
          >
            Home
          </a>
          <div className="nav-dropdown">
            <button
              className={`nav-a nav-dropdown__toggle${page === "about" ? " on" : ""}`}
              aria-expanded={openMenu === "about"}
              aria-controls="about-menu"
              onClick={() => toggleMenu("about")}
            >
              About <span aria-hidden="true">⌄</span>
            </button>

            {openMenu === "about" && (
              <div className="nav-dropdown__menu" id="about-menu">
                <button onClick={() => handleGo("about")}>
                  About DPL Star
                </button>

                <button onClick={() => handleGo("about", "lbr-group")}>
                  LBR Group
                </button>

                <button onClick={() => handleGo("about", "certifications")}>
                  Certifications
                </button>

                <button onClick={() => handleGo("about", "leadership")}>
                  Leadership
                </button>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button
              className={`nav-a nav-dropdown__toggle${["zincalume", "colour-bonded", "fusion-bond", "glass-fused"].includes(page) ? " on" : ""}`}
              aria-expanded={tanksOpen}
              aria-controls="storage-tanks-menu"
              onClick={() => toggleMenu("tanks")}
            >
              Storage Tanks <span aria-hidden="true">⌄</span>
            </button>
            {tanksOpen && (
              <div className="nav-dropdown__menu" id="storage-tanks-menu">
                <button onClick={() => handleGo("zincalume")}>
                  Zincalume Tanks
                </button>
                {/* <button onClick={() => handleGo('gi')}>Colour Bonded Tanks</button> */}
                <button onClick={() => handleGo("colour-bonded")}>
                  Colour Bonded Tanks
                </button>
                <button onClick={() => handleGo("fusion-bond")}>
                  Fusion Bond Epoxy Tanks
                </button>
                <button onClick={() => handleGo("glass-fused")}>
                  Glass Fused Steel Tanks
                </button>
              </div>
            )}
          </div>
          <div className="nav-dropdown">
            <button
              className={`nav-a nav-dropdown__toggle${page === "pipes" ? " on" : ""}`}
              aria-expanded={pipesOpen}
              aria-controls="pipes-menu"
              onClick={() => toggleMenu("pipes")}
            >
              Pipes <span aria-hidden="true">⌄</span>
            </button>
            {pipesOpen && (
              <div className="nav-dropdown__menu" id="pipes-menu">
                <button onClick={() => handleGo("pipes")}>All pipes</button>
                {PIPES_RANGE.map((p) => (
                  <button key={p.id} onClick={() => handleGo("pipes", p.id)}>
                    {p.code} · {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="#"
            className={`nav-a${page === "products" ? " on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleGo("products");
            }}
          >
           All Products
          </a>
          <a
            href="#"
            className={`nav-a${page === "catalogue" ? " on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleGo("catalogue");
            }}
          >
            Catalogue
          </a>
          <a
            href="#"
            className={`nav-a${page === "channel-partner" ? " on" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleGo("channel-partner");
            }}
          >
            Channel Partner
          </a>
          <button
            className="btn btn-p nav-cta"
            onClick={() => handleGo("contact")}
          >
            Get Quote <ArrowIcon />
          </button>
        </div>
        <button
          className="nav-burger"
          id="burger"
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>
      <div id="mob-nav" className={mobileOpen ? "open" : ""}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("home");
          }}
        >
          Home
        </a>
        {/* <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("about");
          }}
        >
          About
        </a> */}

        <div className="mob-tanks">
          <button
            onClick={() => toggleMenu("about")}
            aria-expanded={openMenu === "about"}
            aria-controls="mob-about-menu"
          >
            About <span aria-hidden="true">⌄</span>
          </button>

          {openMenu === "about" && (
            <div className="mob-tanks__menu" id="mob-about-menu">
              <button onClick={() => handleGo("about")}>About DPL Star</button>

              <button onClick={() => handleGo("about", "lbr-group")}>
                LBR Group
              </button>

              <button onClick={() => handleGo("about", "certifications")}>
                Certifications
              </button>

              <button onClick={() => handleGo("about", "leadership")}>
                Leadership
              </button>
            </div>
          )}
        </div>

        <div className="mob-tanks">
          <button onClick={() => toggleMenu("tanks")} aria-expanded={tanksOpen}>
            Storage Tanks <span aria-hidden="true">⌄</span>
          </button>
          {tanksOpen && (
            <div className="mob-tanks__menu">
              <button onClick={() => handleGo("zincalume")}>
                Zincalume Tanks
              </button>
              {/* <button onClick={() => handleGo('gi')}>Colour Bonded Tanks</button> */}
              <button onClick={() => handleGo("colour-bonded")}>
                Colour Bonded Tanks
              </button>
              <button onClick={() => handleGo("fusion-bond")}>
                Fusion Bond Epoxy Tanks
              </button>
              <button onClick={() => handleGo("glass-fused")}>
                Glass Fused Steel Tanks
              </button>
            </div>
          )}
        </div>
        <div className="mob-tanks">
          <button onClick={() => toggleMenu("pipes")} aria-expanded={pipesOpen}>
            Pipes <span aria-hidden="true">⌄</span>
          </button>
          {pipesOpen && (
            <div className="mob-tanks__menu">
              <button onClick={() => handleGo("pipes")}>All pipes</button>
              {PIPES_RANGE.map((p) => (
                <button key={p.id} onClick={() => handleGo("pipes", p.id)}>
                  {p.code} · {p.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("products");
          }}
        >
         All Products
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("catalogue");
          }}
        >
          Catalogue
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleGo("channel-partner");
          }}
        >
          Channel Partner
        </a>
        <button onClick={() => handleGo("contact")}>Get a quote</button>
      </div>
    </nav>
  );
}
