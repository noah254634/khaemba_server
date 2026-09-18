import fetch from 'node-fetch';

// Simple in-memory cache (TTL = 1 hour)
const cache = new Map();
const TTL = 60 * 60 * 1000;

const cached = async (key, fn) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;
  const data = await fn();
  cache.set(key, { data, ts: Date.now() });
  return data;
};

// Fetch pinned repositories via GitHub GraphQL
export const getPinnedRepos = () =>
  cached('pinned', async () => {
    const query = `{
      user(login: "${process.env.GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage { name color }
              repositoryTopics(first: 5) {
                nodes { topic { name } }
              }
            }
          }
        }
      }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    return json?.data?.user?.pinnedItems?.nodes ?? [];
  });

// Fetch contribution calendar
export const getContributions = () =>
  cached('contributions', async () => {
    const query = `{
      user(login: "${process.env.GITHUB_USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    return json?.data?.user?.contributionsCollection?.contributionCalendar ?? {};
  });
