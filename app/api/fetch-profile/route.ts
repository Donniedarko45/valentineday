import axios from 'axios';
import { load } from 'cheerio'; // Replace require with import
import { NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 50; // Reduced from 100 to be more conservative
const requestLog: { [key: string]: number[] } = {};

function isRateLimited(platform: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  requestLog[platform] = (requestLog[platform] || []).filter(time => time > windowStart);
  
  // Add current request
  requestLog[platform] = [...(requestLog[platform] || []), now];
  
  // Check if rate limited
  return (requestLog[platform] || []).length > MAX_REQUESTS;
}

async function getInstagramDP(username: string) {
  try {
    const url = `https://www.instagram.com/${username}/`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 5 second timeout
    });

    const $ = load(data);
    const metaTag = $('meta[property="og:image"]').attr('content');
    return metaTag ? metaTag.replace('s150x150', 's1080x1080') : null;
  } catch (error) {
    console.error('Instagram fetch error:', error.message);
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

    // Check platform-specific rate limiting
    if (isRateLimited(platform)) {
      return NextResponse.json(
        { error: `Rate limit exceeded for ${platform}. Please try again later.` },
        { status: 429 }
      );
    }

    if (platform === 'x') {
      try {
        const response = await fetch(
          `https://api.twitter.com/2/users/by/username/${cleanUsername}?user.fields=profile_image_url`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
              'Content-Type': 'application/json',
            },
            cache: 'force-cache' // Enable caching
          }
        );

        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Twitter API rate limit exceeded' },
            { status: 429 }
          );
        }

        const data = await response.json();
        const imageUrl = data.data?.profile_image_url?.replace('_normal', '') || '/default-avatar.png';
        
        return NextResponse.json({ 
          imageUrl,
          username: cleanUsername 
        });
      } catch (error) {
        console.error('Twitter API error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch Twitter profile' },
          { status: 500 }
        );
      }
    }

    if (platform === 'instagram') {
      const imageUrl = await getInstagramDP(cleanUsername);
      return NextResponse.json({ 
        imageUrl: imageUrl || '/default-avatar.png',
        username: cleanUsername 
      });
    }

    return NextResponse.json(
      { error: 'Invalid platform specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in fetch-profile route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}