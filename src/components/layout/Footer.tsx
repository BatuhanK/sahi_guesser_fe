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
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-[var(--text-secondary)]">
          © {new Date().getFullYear()} Sahikaca. Tüm hakları saklıdır.
        </div>
        <div className="flex gap-4 text-sm">
          <Link to="/iletisim" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            İletişim
          </Link>
          <Link to="/sozlesmeler" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Gizlilik ve Kullanım Koşulları
          </Link>

          <Link to="/indir" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Uygulamalar
          </Link>
        </div>
      </div>
    </FooterContainer>
  );
};
