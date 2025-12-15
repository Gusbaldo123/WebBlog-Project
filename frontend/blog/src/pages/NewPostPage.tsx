import { useState, useEffect } from 'react'
import type { Category } from '../models/Category'
import HeaderComponent from '../components/HeaderComponent'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function NewPostPage() {
  const { author } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const api = import.meta.env.VITE_API || '/api'
  const token = author?.session?.replaceAll('"', '')
  const navigate = useNavigate()

  useEffect(() => {
    if (!author) return
    fetchCategories()
  }, [author])

  if (!author) {
    window.confirm("Please, log in")
    navigate("/home")
  }

  async function fetchCategories() {
    try {
      setLoading(true)
      const res = await fetch(`${api}/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number(e.target.value)
    if (!value) return
    const category = categories.find(c => c.id === value)
    if (!category) return
    setSelectedCategories(prev => [...prev, category])
    setCategories(prev => prev.filter(c => c.id !== value))
    e.target.value = ""
  }

  function removeSelected(cat: Category) {
    setCategories(prev => [...prev, cat])
    setSelectedCategories(prev => prev.filter(c => c.id !== cat.id))
  }

  async function sendPost() {
    if (!author) {
      window.confirm("Please, log in")
      navigate("/home")
      return
    }

    const post = {
      title: title.trim(),
      content: content.trim(),
      categoryIds: selectedCategories?.map(c => c.id),
    }

    const res = await fetch(`${api}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(post)
    })

    if (res.ok) navigate("/home")
  }

  if (!author) return <div>Loading user...</div>
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
  <HeaderComponent />

  <div className="min-h-screen bg-gray-100 py-10">
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-center">Create New Post</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3"
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 h-40 resize-none"
      />

      <div>
        <h3 className="text-lg font-semibold mb-2">Select categories</h3>
        <select
          onChange={handleSelect}
          defaultValue=""
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">-</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Selected Categories</h3>

        {selectedCategories?.length === 0 && (
          <span className="text-gray-500">No category selected</span>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => removeSelected(cat)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {cat.name} ×
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={sendPost}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
      >
        Publish Post
      </button>
    </div>
  </div>
</>

  )
}
