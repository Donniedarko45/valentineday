import { motion } from 'framer-motion';
import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  accent: string;
}

const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Classic Romance',
    background: '#1a0010',
    foreground: '#ff9ecd',
    accent: '#ff1493'
  },
  {
    id: 'midnight',
    name: 'Midnight Love',
    background: '#000033',
    foreground: '#9999ff',
    accent: '#4444ff'
  },
  {
    id: 'sunset',
    name: 'Sunset Romance',
    background: '#330011',
    foreground: '#ffcc99',
    accent: '#ff6666'
  }
];

const STICKERS = [
  '💝', '💘', '💖', '💗', '💓', '💞', '💕', '💌', '🌹', '✨'
];

interface CardCustomizerProps {
  onThemeChange: (theme: Theme) => void;
  onStickersChange: (stickers: string[]) => void;
}

export default function CardCustomizer({ onThemeChange, onStickersChange }: CardCustomizerProps) {
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  const handleStickerToggle = (sticker: string) => {
    setSelectedStickers(prev => {
      const newStickers = prev.includes(sticker)
        ? prev.filter(s => s !== sticker)
        : [...prev, sticker];
      onStickersChange(newStickers);
      return newStickers;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium text-pink-200 mb-3">Choose Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              className="p-4 rounded-lg border border-pink-500/30 hover:border-pink-500/50
                       transition-all duration-200"
              style={{ background: theme.background }}
            >
              <span className="text-sm" style={{ color: theme.foreground }}>
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-pink-200 mb-3">Add Stickers</h3>
        <div className="grid grid-cols-5 gap-3">
          {STICKERS.map(sticker => (
            <button
              key={sticker}
              onClick={() => handleStickerToggle(sticker)}
              className={`p-4 text-2xl rounded-lg border ${
                selectedStickers.includes(sticker)
                  ? 'border-pink-500 bg-pink-950/50'
                  : 'border-pink-500/30 hover:border-pink-500/50'
              } transition-all duration-200`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 