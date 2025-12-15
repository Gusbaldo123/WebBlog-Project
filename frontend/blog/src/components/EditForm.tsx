import { useState } from "react";
import type { Author } from "../models/Author";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

function EditForm({ targetAuthor }: { targetAuthor: Author }) {
  const { author } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: targetAuthor.name,
    email: targetAuthor.email,
    role: targetAuthor.role,
    password: ""
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API || '/api';

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function updateAuthor() {
    try {
      setSaving(true);
      setMessage(null);

      if (!author) return;

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password
      };

      const res = await fetch(`${apiUrl}/author/${targetAuthor.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${author.session?.replaceAll('"', "")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        setMessage("Error updating author.");
        return;
      }

      setMessage("Updated successfully.");
    } catch {
      setMessage("Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAuthor() {
    if (!author) return;

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${apiUrl}/author/${targetAuthor.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${author.session?.replaceAll('"', "")}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        setMessage("Error deleting author.");
        return;
      }

      window.alert("Deleted successfully.");
      navigate("/home");
    } catch {
      setMessage("Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 p-6 border border-gray-300 rounded-xl shadow-sm bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

      <div className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          onClick={updateAuthor}
          disabled={saving}
          className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded-lg">
            {message}
          </p>
        )}
      </div>

      <div className="flex justify-center mt-6">
  <button
    onClick={deleteAuthor}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
  >
    Delete Author
  </button>
</div>
    </div>
  );
}


export default EditForm;