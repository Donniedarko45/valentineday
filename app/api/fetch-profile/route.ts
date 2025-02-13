import { NextResponse } from 'next/server';
import axios from 'axios';
const cheerio = require("cheerio");

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Adjust based on your Twitter API tier
const requestLog: { [key: string]: number[] } = {};

function isRateLimited() {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  Object.keys(requestLog).forEach(key => {
    requestLog[key] = requestLog[key].filter(time => time > windowStart);
  });

  const currentRequests = requestLog['twitter'] || [];
  requestLog['twitter'] = [...currentRequests, now];

  return currentRequests.length >= MAX_REQUESTS;
}

// Function to get Instagram profile picture
async function getInstagramDP(username: string) {
  const url = `https://www.instagram.com/${username}/`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.instagram.com/",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
  };

  try {
    const { data } = await axios.get(url, { 
      headers,
      timeout: 5000,
      maxRedirects: 5
    });
    const $ = cheerio.load(data);
    
    // Try multiple meta tag patterns
    const possibleMetaTags = [
      "meta[property='og:image']",
      "meta[property='og:image:secure_url']",
      "meta[name='twitter:image']"
    ];

    for (const selector of possibleMetaTags) {
      const metaTag = $(selector).attr("content");
      if (metaTag) return metaTag;
    }

    return null;
  } catch (error) {
    console.error("Instagram fetch error:", error.message);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { username, platform } = await request.json();

    if (!username || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cleanUsername = username.replace('@', '').trim();

    // Add environment variable check
    if (platform === 'x' && !process.env.TWITTER_BEARER_TOKEN) {
      console.error('Twitter Bearer Token is missing');
      return NextResponse.json({ 
        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&background=ff69b4&color=fff&size=400`,
        username: cleanUsername 
      });
    }

    // Remove the image fetching logic
    if (platform === 'x') {
      // Check rate limiting
      if (isRateLimited()) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      try {
        const response = await fetch(
          `https://api.twitter.com/2/users/by/username/${cleanUsername}?user.fields=profile_image_url`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          }
        );

        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Twitter API rate limit exceeded' },
            { status: 429 }
          );
        }

        if (!response.ok) {
          console.error(`Twitter API error: ${response.status}`);
          return NextResponse.json(
            { error: `Twitter API error: ${response.status}` },
            { status: response.status }
          );
        }

        const data = await response.json();
        
        if (!data.data?.profile_image_url) {
          return NextResponse.json({ 
            imageUrl: '/default-avatar.png',
            username: cleanUsername 
          });
        }

        const originalImage = data.data.profile_image_url.replace('_normal', '_original');
        return NextResponse.json({ 
          imageUrl: originalImage,
          username: cleanUsername 
        });
      } catch (error) {
        console.error('Twitter API error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch Twitter profile' },
          { status: 500 }
        );
      }
    } else if (platform === 'instagram') {
      const imageUrl = await getInstagramDP(cleanUsername);
      if (imageUrl) {
        return NextResponse.json({ 
          imageUrl: imageUrl,
          username: cleanUsername 
        });
      } else {
        return NextResponse.json({ 
          imageUrl: '/default-avatar.png', // Fallback if not found
          username: cleanUsername 
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid platform specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in fetch-profile route:', error);
    const fallbackUsername = (error as any)?.username || 'User';
    return NextResponse.json({ 
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackUsername)}&background=ff69b4&color=fff&size=400`,
      username: fallbackUsername
    });
  }
}