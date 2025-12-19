import { Sun, Moon } from "lucide-react";

export const Header = ({
  darkMode,
  setDarkMode,
  statusMessage,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  statusMessage: string;
}) => (
  <header className={darkMode ? "app-header-dark" : "app-header-light"}>
    <div className="container-layout">
      <div className="header-content">
        <div>
          <h1
            className={darkMode ? "heading-title-dark" : "heading-title-light"}
          >
            Google Takeout Viewer
          </h1>
          <p
            className={
              darkMode ? "heading-subtitle-dark" : "heading-subtitle-light"
            }
          ></p>
        </div>
        <div className="flex items-center gap-3">
          <div className={darkMode ? "status-text-dark" : "status-text-light"}>
            <span>{statusMessage}</span>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "theme-toggle-dark" : "theme-toggle-light"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  </header>
);
