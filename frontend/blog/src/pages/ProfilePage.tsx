import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderComponent from "../components/HeaderComponent";
import PostComponent from "../components/PostComponent";
import { useAuth } from "../context/AuthContext";
import type { Author } from "../models/Author";
import type { Post } from "../models/Post";
import EditForm from "../components/EditForm";

export default function ProfilePage() {
    const { author } = useAuth();
    const [targetAuthor, setTargetAuthor] = useState<Author | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canLoad, setCanLoad] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const { authorId } = useParams<{ authorId: string }>();

    useEffect(() => {
        if (!author) return;
        const apiUrl = import.meta.env.VITE_API || '/api';
        const id = authorId ? parseInt(authorId) : author.id;
        if (!id) return;

        async function fetchAuthor() {
            try {
                setLoading(true);
                const res = await fetch(`${apiUrl}/author/${id}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setTargetAuthor(await res.json());
            } catch (err: any) {
                setError(err.message || "Failed to fetch author");
            } finally {
                setLoading(false);
            }
        }

        fetchAuthor();
    }, [author, authorId]);

    async function fetchUserPosts(a: Author) {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API || '/api';
            const res = await fetch(`${apiUrl}/author/${a.id}/posts/`, {
                method: "GET",
                mode: "cors",
                headers: { "Content-Type": "application/json", page: "0", size: "20" }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setPosts(await res.json());
            setCanLoad(true);
        } catch (err: any) {
            setPosts([]);
            setError(err.message || "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    }

    if (!author) return <div className="text-center p-6">Loading user...</div>;
    if (loading) return <div className="text-center p-6">Loading...</div>;
    if (error || !targetAuthor) return <h3 className="p-6 text-center">Author not found</h3>;

    const canEdit =
        author.id === targetAuthor.id ||
        author.role.toLowerCase() === "administrator";

    return (
        <div className="bg-gradient-to-b from-slate-100 to-slate-200 min-h-screen">
            <HeaderComponent />

            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto text-center">
                    <h1 className="text-2xl font-semibold mb-4">Profile of {author.name}</h1>

                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Name:</span> {author.name}
                    </p>

                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Email:</span> {author.email}
                    </p>

                    <p className="text-gray-700 mb-4">
                        <span className="font-semibold">Role:</span> {author.role}
                    </p>

                    {canEdit && <EditForm targetAuthor={targetAuthor} />}
                </div>

                {canLoad ? (
                    posts?.length > 0 ? (
                        <div className="flex flex-col gap-4 mt-6">
                            {posts?.map((post) => (
                                <PostComponent key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-600">No posts yet</div>
                    )
                ) : (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => fetchUserPosts(targetAuthor)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Load user posts
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
