import type { Post } from "../models/Post";

function postComponent({ post }: { post: Post }) {
  const sliceSize = 60;
  const slicedContent =
    post.content.length > sliceSize
      ? `${post.content.slice(0, sliceSize).trim()}...`
      : post.content;

  return (
    <div className="post-card bg-white p-4 md:p-6 rounded-xl shadow-sm hover:-translate-y-1 transition mb-4">
      <h3 className="text-xl font-bold mb-1">
        <a href={`/post/${post.id}`} className="text-gray-900 hover:underline">
          {post.title}
        </a>
      </h3>

      <p className="text-sm text-gray-500 mb-2 wrap">
        by{" "}
        <a href={`/profile/${post.author.id}`} className="hover:underline">
          {post.author.name}
        </a>
      </p>

      <p className="text-gray-700 mb-3 leading-relaxed break-words">
        {slicedContent}
      </p>

      <div className="flex gap-2 flex-wrap">
        {post.categories?.map(cat => (
          <span
            key={cat.id}
            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md"
          >
            {cat.name}
          </span>
        ))}
      </div>
    </div>
  );
}


export default postComponent;