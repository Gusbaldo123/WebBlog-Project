import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../models/Post';
import type { Category } from '../models/Category';

export default function PostPage() {
  const { author } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { postId } = useParams<{ postId: string }>();

  const canEdit =
    author &&
    (
      author.role?.toLowerCase() === "administrator" ||
      author.id === post?.author?.id
    );

  async function handleDelete() {
    if (!post) return;
    const apiUrl = import.meta.env.VITE_API || '/api';
    await fetch(`${apiUrl}/post/${post.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${author?.session?.replaceAll('"', '')}`,
      },
    });
    navigate("/home");
  }

  async function handleSave() {
    if (!post) return;
    const apiUrl = import.meta.env.VITE_API || '/api';
    await fetch(`${apiUrl}/post/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${author?.session?.replaceAll('"', '')}`,
      },
      body: JSON.stringify({
        title,
        content,
        categoryIds: selectedCategories
      }),
    });
    navigate(0);
  }

  function toggleCategory(id: number) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  useEffect(() => {
    if (!postId) return;
    const id = parseInt(postId);

    async function load() {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API || '/api';

        const p = await fetch(`${apiUrl}/post/${id}`);
        const pdata = await p.json();

        const c = await fetch(`${apiUrl}/category`);
        const cdata = await c.json();

        setPost(pdata);
        setTitle(pdata.title);
        setContent(pdata.content);
        setAllCategories(cdata);
        setSelectedCategories(pdata?.categories?.map((c: Category) => c.id));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [postId]);

  if (!postId) return null;
  if (loading) return <div>Loading...</div>;
  if (!post) return <h3>Post not found</h3>;

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
      <HeaderComponent />

      <main className="max-w-3xl mx-auto p-6">
        {!editing && (
          <div className="bg-white p-6 rounded-xl shadow-md text-center break-words">
            <h3 className="text-2xl font-semibold mb-4 text-center">{post.title}</h3>

            <p className="text-gray-800 whitespace-pre-line mb-4 ">{post.content}</p>

            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {post?.categories?.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {canEdit && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
        {editing && (
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 mt-6">
            <input
              className="border border-gray-300 rounded-lg p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="border border-gray-300 rounded-lg p-2 h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <h4 className="text-lg font-semibold">Categories</h4>

            <div className="flex flex-col gap-2">
              {allCategories?.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Save
              </button>

              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );

}
