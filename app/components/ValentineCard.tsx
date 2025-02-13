'use client';

import Image from 'next/image';
import { CardSpotlight } from './CardSpotlight';
import { useState } from 'react';

// Add SVG icons as components
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const WhatsappIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

interface ValentineCardProps {
  senderUsername: string;
  partnerUsername: string;
  platform: 'instagram' | 'x';
  matchPercentage: number;
  flirtMessage: string;
  senderImage?: string;
  partnerImage?: string;
  theme: {
    id: string;
    name: string;
    background: string;
    foreground: string;
    accent: string;
  };
  stickers?: string[]; // Optional if you want to include stickers
}

async function fetchProfileImage(username: string, platform: string) {
  try {
    console.log(`Fetching profile image for ${username} on platform ${platform}`); // Log the request

    const response = await fetch('/api/fetch-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, platform }),
    });

    // Check if the response is okay
    if (!response.ok) {
      const errorText = await response.text(); // Get the error message
      console.error('Error fetching profile image:', errorText);
      throw new Error(`Error fetching profile image: ${response.status} ${errorText}`);
    }

    const data = await response.json(); // Parse the JSON response
    return data.imageUrl; // Return the image URL
  } catch (error) {
    console.error('Failed to fetch profile image:', error);
    return null; // Return null or a default image URL
  }
}

export default function ValentineCard({
  senderUsername,
  partnerUsername,
  platform,
  matchPercentage,
  flirtMessage,
  senderImage,
  partnerImage,
  theme,
  stickers,
}: ValentineCardProps) {
  const [senderImgError, setSenderImgError] = useState(false);
  const [partnerImgError, setPartnerImgError] = useState(false);

  const handleShare = async () => {
    const text = `💝 ${flirtMessage}\n\nOur love match: ${matchPercentage}%\nGenerated with Valentine's Match 💘`;
    
    if (platform === 'instagram') {
      // For Instagram, we'll copy to clipboard since direct sharing isn't available
      await navigator.clipboard.writeText(text);
      alert('Message copied! You can now paste it in Instagram DM');
    } else {
      // For Twitter/X
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}&via=valentinesmatch`;
      window.open(tweetUrl, '_blank');
    }
  };

  const handleDirectMessage = () => {
    const baseUrl = platform === 'instagram' 
      ? `https://instagram.com/direct/t/${partnerUsername}`
      : `https://twitter.com/messages/compose?recipient_id=${partnerUsername}`;
    window.open(baseUrl, '_blank');
  };

  const getInitialsAvatar = (username: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ff69b4&color=fff&size=400`;
  };

  return (
    <CardSpotlight className="w-full max-w-2xl mx-auto">
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-pink-800/50 relative border-2 border-pink-500">
              {senderImage && (
                <Image
                  src={senderImage}
                  alt={senderUsername}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              )}
            </div>
            <span className="text-sm text-pink-300">@{senderUsername}</span>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-500 mb-2">
              {matchPercentage}%
            </div>
            <div className="text-pink-300 text-sm">Match</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-pink-800/50 relative border-2 border-pink-500">
              <Image
                src={!partnerImgError ? partnerImage || getInitialsAvatar(partnerUsername) : getInitialsAvatar(partnerUsername)}
                alt={partnerUsername}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => {
                  setPartnerImgError(true);
                }}
                priority
              />
            </div>
            <span className="text-sm text-pink-300">@{partnerUsername}</span>
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-pink-950/30 border border-pink-500/20">
          <p className="text-pink-100 italic">&ldquo;{flirtMessage}&rdquo;</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDirectMessage}
            className="px-4 py-2 bg-pink-600/80 rounded-lg hover:bg-pink-500/80 transition-colors text-white text-sm flex items-center gap-2"
          >
            {platform === 'instagram' ? <InstagramIcon /> : <TwitterIcon />}
            Direct Message
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-pink-600/80 rounded-lg hover:bg-pink-500/80 transition-colors text-white text-sm flex items-center gap-2"
          >
            {platform === 'instagram' ? <CopyIcon /> : <TwitterIcon />}
            Share {platform === 'instagram' ? '(Copy)' : 'on X'}
          </button>
          <button
            onClick={async () => {
              const text = `💝 ${flirtMessage}\n\nOur love match: ${matchPercentage}%\nGenerated with Valentine's Match 💘`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="px-4 py-2 bg-green-600/80 rounded-lg hover:bg-green-500/80 transition-colors text-white text-sm flex items-center gap-2"
          >
            <WhatsappIcon />
            Share on WhatsApp
          </button>
        </div>
      </div>
    </CardSpotlight>
  );
} 