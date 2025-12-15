import { useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function registerUser() {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API || '/api';

      const res = await fetch(`${apiUrl}/author/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
      <HeaderComponent />

      <div className="flex justify-center mt-16">
        <div className="w-full max-w-md bg-white shadow rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Register</h2>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Strong Password"
                value={form.password}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={registerUser}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Sending..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
