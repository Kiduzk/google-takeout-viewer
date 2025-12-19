import type { YoutubeComment } from "../../types";
import { formatDate } from "../../App";
import { MessageCircle } from "lucide-react";

export const CommentCard = ({
  comment,
  darkMode,
}: {
  comment: YoutubeComment;
  darkMode: boolean;
}) => (
  <div
    className={`border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 ${
      darkMode
        ? "bg-gray-800 border-gray-700 hover:border-gray-600"
        : "bg-white border-gray-200"
    }`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`p-3 rounded-lg ${
          darkMode ? "bg-green-900/30" : "bg-green-100"
        }`}
      >
        <MessageCircle className="text-green-600" size={24} />
      </div>
      <div className="flex-1">
        <h3
          className={`font-semibold text-lg mb-2 line-clamp-2 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {comment.text}
        </h3>

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {formatDate(comment.time)}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${comment.videoId}&lc=${comment.commentId}`}
            target="_blank"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View on YouTube
          </a>
        </div>
      </div>
    </div>
  </div>
);
