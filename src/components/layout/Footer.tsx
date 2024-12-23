import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <nav>
            <Link
              to="/iletisim"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-muted)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-black font-medium transition-all duration-200 border border-[var(--accent-color)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                  clipRule="evenodd"
                />
              </svg>
              İletişim
            </Link>
          </nav>

          <div className="text-[var(--text-secondary)] text-sm text-center">
            <div>© {new Date().getFullYear()} Tüm hakları saklıdır.</div>
            <div>
              Bir{" "}
              <a
                href="https://x.com/batuhan_katirci"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium transition-colors duration-200"
              >
                Batuhan KATIRCI
              </a>{" "}
              projesidir.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
