import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

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
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY.current || currentScrollY <= 10);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <FooterContainer isVisible={isVisible} className="py-4 px-6 border-t border-[var(--border-color)]">
      <div className="mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
            sahi <span className="text-[var(--accent-color)]">kaça?</span>
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} — Tüm hakları saklıdır.
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Link to="/iletisim" className="rounded-full px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-color)] hover:text-[var(--text-primary)]">
            İletişim
          </Link>
          <Link to="/sozlesmeler" className="rounded-full px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-color)] hover:text-[var(--text-primary)]">
            Gizlilik ve Kullanım Koşulları
          </Link>
          <Link to="/indir" className="rounded-full px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-color)] hover:text-[var(--text-primary)]">
            Uygulamalar
          </Link>
        </div>
      </div>
    </FooterContainer>
  );
};
