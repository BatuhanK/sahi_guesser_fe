import { Link } from "react-router-dom";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const FooterContainer = styled.footer<{ isVisible: boolean }>`
  background-color: var(--bg-secondary);
  position: relative;
  z-index: 10;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.2s, visibility 0.2s;
  margin-top: auto;
  position: sticky;
  bottom: 0;
`;

export const Footer = () => {
  const location = useLocation();
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkOverlap = () => {
      if (!footerRef.current) return;

      // Sadece belirli elementleri kontrol et
      const gameBoard = document.querySelector('.game-board');
      const leaderboard = document.querySelector('.leaderboard');
      const footerRect = footerRef.current.getBoundingClientRect();
      
      let isOverlapping = false;

      // GameBoard ile çakışma kontrolü
      if (gameBoard) {
        const gameBoardRect = gameBoard.getBoundingClientRect();
        if (footerRect.top < gameBoardRect.bottom) {
          isOverlapping = true;
        }
      }

      // Leaderboard ile çakışma kontrolü
      if (leaderboard) {
        const leaderboardRect = leaderboard.getBoundingClientRect();
        if (footerRect.top < leaderboardRect.bottom) {
          isOverlapping = true;
        }
      }

      setIsVisible(!isOverlapping);
    };

    const throttledCheckOverlap = () => {
      requestAnimationFrame(checkOverlap);
    };

    window.addEventListener('scroll', throttledCheckOverlap);
    window.addEventListener('resize', throttledCheckOverlap);
    checkOverlap();

    return () => {
      window.removeEventListener('scroll', throttledCheckOverlap);
      window.removeEventListener('resize', throttledCheckOverlap);
    };
  }, []);

  return (
    <FooterContainer 
      ref={footerRef}
      isVisible={isVisible}
      className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-3 sm:py-6"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="w-[140px] sm:w-[180px]">
            <Link
              to="/iletisim"
              state={{ from: location.pathname }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-[var(--accent-muted)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-black font-medium transition-all duration-200 border border-[var(--accent-color)] text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                  clipRule="evenodd"
                />
              </svg>
              İletişim
            </Link>
          </div>

          <div className="text-[var(--text-secondary)] text-xs sm:text-sm text-center">
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

          <div className="w-[140px] sm:w-[180px]"></div>
        </div>
      </div>
    </FooterContainer>
  );
};
