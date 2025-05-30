interface RedditPostInfo {
  title: string;
  content: string;
  author: string;
  score: number;
  comments: {
    author: string;
    body: string;
    score: number;
  }[];
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditComment {
  author: string;
  body: string;
  score: number;
}

interface RedditPost {
  title: string;
  selftext: string;
  author: string;
  score: number;
}

async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Missing Reddit API credentials");
  }

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get Reddit access token: ${response.statusText}`
    );
  }

  const data = (await response.json()) as RedditTokenResponse;
  return data.access_token;
}

export async function getRedditPostInfo(
  postUrl: string
): Promise<RedditPostInfo> {
  // Extract the post ID from the URL
  const postId = postUrl.split("/comments/")[1].split("/")[0];

  // Get access token
  const accessToken = await getRedditAccessToken();

  // Fetch post details
  const postResponse = await fetch(
    `https://oauth.reddit.com/comments/${postId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "pulse-app/1.0.0",
      },
    }
  );

  if (!postResponse.ok) {
    throw new Error(`Failed to fetch Reddit post: ${postResponse.statusText}`);
  }

  const [postData, commentsData] = await postResponse.json();
  const post = postData.data.children[0].data as RedditPost;
  const comments = commentsData.data.children.map((comment: any) => ({
    author: comment.data.author,
    body: comment.data.body,
    score: comment.data.score,
  }));

  // Format the response
  const postInfo: RedditPostInfo = {
    title: post.title,
    content: post.selftext,
    author: post.author,
    score: post.score,
    comments,
  };

  return postInfo;
}
