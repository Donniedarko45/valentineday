import { motion } from 'framer-motion';

interface SocialShareProps {
  flirtMessage: string;
  matchPercentage: number;
  senderUsername: string;
  partnerUsername: string;
}

export default function SocialShare({
  flirtMessage,
  matchPercentage,
  senderUsername,
  partnerUsername
}: SocialShareProps) {
  const shareText = `💝 ${flirtMessage}\n\n${senderUsername} & ${partnerUsername}'s love match: ${matchPercentage}%\nGenerated with Valentine's Match 💘`;
  
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4"
    >
      <div className="flex gap-3 justify-center">
        {Object.entries(shareUrls).map(([platform, url]) => (
          <button
            key={platform}
            onClick={() => window.open(url, '_blank')}
            className="p-3 rounded-full bg-pink-950/50 hover:bg-pink-900/50 
                     border border-pink-500/30 hover:border-pink-500/50 
                     transition-all duration-200"
          >
            <span className="sr-only">Share on {platform}</span>
            {/* Add platform icons here */}
          </button>
        ))}
        
        <button
          onClick={copyToClipboard}
          className="p-3 rounded-full bg-pink-950/50 hover:bg-pink-900/50 
                   border border-pink-500/30 hover:border-pink-500/50 
                   transition-all duration-200"
        >
          <span className="sr-only">Copy to clipboard</span>
          {/* Add copy icon */}
        </button>
      </div>
    </motion.div>
  );
} 