import { useState, useEffect } from 'react'
import type { Post } from '../models/Post';

import HeaderComponent from '../components/HeaderComponent';
import PostComponent from '../components/PostComponent';

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API || '/api';
      const res = await fetch(`${apiUrl}/post`, {
        method: "GET",
        mode: "cors",
        headers: { "Content-Type": "application/json", size: "20", page: "0" },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      setPosts(await res.json());
    } catch (err: any) {
      setError(err.message || "Error fetching posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-600 bg-slate-100 min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-600 text-center bg-slate-100 min-h-screen">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
      <HeaderComponent />

      <main className="p-4 md:px-24 pt-6">
        {posts?.map((post) => (
          <PostComponent key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
}



export default HomePage;