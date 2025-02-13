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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  };

  try {
    const { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    const metaTag = $("meta[property='og:image']").attr("content");

    if (metaTag) {
      return metaTag.replace("s150x150", "s1080x1080"); // High resolution
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching Instagram profile picture:", error.response ? error.response.data : error.message);
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
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}