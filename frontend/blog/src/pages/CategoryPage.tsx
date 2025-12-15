import { useState, useEffect } from "react";
import HeaderComponent from "../components/HeaderComponent";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Category = {
  id: number;
  name: string;
};

export default function CategoryPage() {
  const { author } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const api = import.meta.env.VITE_API || '/api';
  const token = author?.session?.replaceAll('"', "");

  useEffect(() => {
    if (!author) return;
    if (author.role.toLowerCase() !== "administrator") {
      navigate("/home");
      return;
    }
    fetchCategories();
  }, [author]);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch(`${api}/category`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCategories(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    if (!newName.trim()) return;
    await fetch(`${api}/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName })
    });
    setNewName("");
    fetchCategories();
  }

  async function updateCategory(id: number) {
    if (!editName.trim()) return;
    await fetch(`${api}/category/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: editName })
    });
    setEditId(null);
    setEditName("");
    fetchCategories();
  }

  async function deleteCategory(id: number) {
    await fetch(`${api}/category/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  }

  if (!author) return <div className="text-center p-6">Loading user...</div>;
  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
      <HeaderComponent />

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Category Manager</h2>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category"
              className="flex-1 border border-gray-300 rounded-lg p-2 min-w-0"
            />
            <button
              onClick={createCategory}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-slate-100 p-3 rounded-lg"
              >
                {editId === cat.id ? (
                  <div className="flex w-full gap-2">
                    <input
                      className="flex-1 min-w-0 h-10 border border-gray-300 rounded-lg p-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <button
                      onClick={() => updateCategory(cat.id)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditId(null); setEditName(""); }}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
