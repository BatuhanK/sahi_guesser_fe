import { AnimatePresence, motion } from "framer-motion";
import html2canvas from 'html2canvas';
import { Car, Download, HelpCircle, Home, ShoppingBag } from "lucide-react";
import React, { useRef, useState } from "react";

const icons = [
  { component: Home, key: "home", label: "Home" },
  { component: Car, key: "car", label: "Car" },
  { component: ShoppingBag, key: "letgo", label: "Shopping Bag" },
  { component: HelpCircle, key: "help", label: "Help" },
];

type IconPosition = "left" | "top";

const StaticIcon: React.FC<{ 
  icon: typeof icons[0]; 
  size: number;
}> = ({ icon, size }) => {
  return React.createElement(icon.component, {
    className: "text-[var(--bg-secondary)]",
    size: size,
  });
};

const AnimatedIcon: React.FC<{ 
  icon: typeof icons[0]; 
  size: number;
}> = ({ icon, size }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={icon.key}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.2 }}
        transition={{ duration: 0.3 }}
      >
        <StaticIcon icon={icon} size={size} />
      </motion.div>
    </AnimatePresence>
  );
};

const LogoText: React.FC<{
  isSplitText: boolean;
  fontSize: number;
  iconPosition: IconPosition;
}> = ({ isSplitText, fontSize, iconPosition }) => {
  const textStyles = {
    fontSize: `${fontSize}px`,
    textShadow: "0 0 3px rgba(255, 255, 255, 0.3)",
  };

  if (isSplitText) {
    return (
      <div className={`flex flex-col ${iconPosition === "top" ? "items-center" : "items-start"}`}>
        <h1
          className="font-bold text-[var(--bg-secondary)] leading-none"
          style={textStyles}
        >
          sahi
        </h1>
        <h1
          className="font-bold text-[var(--bg-secondary)] leading-none"
          style={textStyles}
        >
          kaca?
        </h1>
      </div>
    );
  }

  return (
    <h1
      className="font-bold text-[var(--bg-secondary)]"
      style={textStyles}
    >
      sahi kaca?
    </h1>
  );
};

export const LogosPage: React.FC = () => {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(100);
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);
  const [iconSize, setIconSize] = useState(32);
  const [isSplitText, setIsSplitText] = useState(false);
  const [iconPosition, setIconPosition] = useState<IconPosition>("left");
  const logoRef = useRef<HTMLDivElement>(null);

  const calculateFontSize = () => {
    if (isSplitText) {
      // For split text, adjust based on icon position
      if (iconPosition === "top") {
        return Math.min(height * 0.25, width * 0.25);
      }
      return Math.min(height * 0.3, width * 0.2);
    }
    // For single line text
    if (iconPosition === "top") {
      return Math.min(height * 0.3, width * 0.25);
    }
    return Math.min(height * 0.4, width * 0.15);
  };

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!logoRef.current) return;

    try {
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
      });

      const link = document.createElement('a');
      link.download = `sahikaca-logo.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : undefined);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Logo Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[var(--text-primary)] mb-2">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full p-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              min="50"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              min="50"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Icon</label>
            <select
              value={selectedIcon.key}
              onChange={(e) => setSelectedIcon(icons.find(icon => icon.key === e.target.value) || icons[0])}
              className="w-full p-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              {icons.map((icon) => (
                <option key={icon.key} value={icon.key}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Icon Size (px)</label>
            <input
              type="number"
              value={iconSize}
              onChange={(e) => setIconSize(Number(e.target.value))}
              className="w-full p-2 rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]"
              min="16"
              max="128"
            />
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Icon Position</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={iconPosition === "left"}
                  onChange={() => setIconPosition("left")}
                  className="accent-[var(--accent-color)]"
                />
                <span className="text-[var(--text-primary)]">Left Side</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={iconPosition === "top"}
                  onChange={() => setIconPosition("top")}
                  className="accent-[var(--accent-color)]"
                />
                <span className="text-[var(--text-primary)]">Top Side</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Text Layout</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isSplitText}
                  onChange={() => setIsSplitText(false)}
                  className="accent-[var(--accent-color)]"
                />
                <span className="text-[var(--text-primary)]">Single Line</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isSplitText}
                  onChange={() => setIsSplitText(true)}
                  className="accent-[var(--accent-color)]"
                />
                <span className="text-[var(--text-primary)]">Two Lines</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[var(--text-primary)] mb-2">Download Logo</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('png')}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-[var(--bg-secondary)] rounded hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Download size={20} />
                PNG
              </button>
              <button
                onClick={() => handleDownload('jpg')}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-[var(--bg-secondary)] rounded hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Download size={20} />
                JPG
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div
            className={`bg-[var(--accent-color)] p-4 rounded-lg shadow-lg ${
              iconPosition === "left" 
                ? "flex items-center justify-center" 
                : "flex flex-col items-center justify-center"
            }`}
            style={{ 
              width: `${width}px`, 
              height: `${height}px`,
              gap: iconPosition === "left" ? `${width * 0.05}px` : `${height * 0.05}px`
            }}
          >
            <AnimatedIcon icon={selectedIcon} size={iconSize} />
            <LogoText 
              isSplitText={isSplitText} 
              fontSize={calculateFontSize()} 
              iconPosition={iconPosition}
            />
          </div>

          <div
            ref={logoRef}
            className={`hidden bg-[var(--accent-color)] p-4 rounded-lg shadow-lg ${
              iconPosition === "left" 
                ? "flex items-center justify-center" 
                : "flex flex-col items-center justify-center"
            }`}
            style={{ 
              width: `${width}px`, 
              height: `${height}px`,
              gap: iconPosition === "left" ? `${width * 0.05}px` : `${height * 0.05}px`
            }}
          >
            <StaticIcon icon={selectedIcon} size={iconSize} />
            <LogoText 
              isSplitText={isSplitText} 
              fontSize={calculateFontSize()} 
              iconPosition={iconPosition}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 