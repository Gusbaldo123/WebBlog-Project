import { useAuth } from "../context/AuthContext";

function HeaderComponent() {
    const { author } = useAuth();

    function signOut() {
        localStorage.removeItem("session_token");
        window.location.href = "/login";
    }

    const isAdmin =
        author &&
        author.role !== undefined &&
        author.role.toLowerCase() === "administrator";

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="w-full px-4 py-3 flex items-center justify-center">
                <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
                    <li>
                        <a
                            href="/home"
                            className="hover:text-gray-900 transition"
                        >
                            Home
                        </a>
                    </li>

                    {author ? (
                        <>
                            <li>
                                <a
                                    href="/profile"
                                    className="hover:text-gray-900 transition"
                                >
                                    Profile
                                </a>
                            </li>

                            {isAdmin && (
                                <li>
                                    <a
                                        href="/categories"
                                        className="hover:text-gray-900 transition"
                                    >
                                        Categories
                                    </a>
                                </li>
                            )}

                            <li>
                                <a
                                    href="/post"
                                    className="hover:text-gray-900 transition"
                                >
                                    Post
                                </a>
                            </li>

                            <li>
                                <button
                                    onClick={signOut}
                                    className="text-red-600 hover:text-red-700 transition"
                                >
                                    Signout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <a
                                    href="/login"
                                    className="hover:text-gray-900 transition"
                                >
                                    Sign in
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/register"
                                    className="hover:text-gray-900 transition"
                                >
                                    Sign up
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default HeaderComponent;
