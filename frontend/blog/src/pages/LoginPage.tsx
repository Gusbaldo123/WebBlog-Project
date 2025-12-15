import { useState } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  }

  async function postUser() {
    setLoading(true);
    const ok = await login(credentials.email, credentials.password);
    setLoading(false);
    if (ok) window.location.href = "/home";
    else setError("Invalid email or password");
  }

  return (
    <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
      <HeaderComponent />

      <div className="flex justify-center mt-16">
        <div className="w-full max-w-md bg-white shadow rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Login</h2>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={credentials.email}
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
                value={credentials.password}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={postUser}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Sending..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
