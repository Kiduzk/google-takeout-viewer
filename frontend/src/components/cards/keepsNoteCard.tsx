import type { KeepEntry } from "../../types";
import { formatDate } from "../../App";

export const KeepNoteCard = ({
  note,
  darkMode,
}: {
  note: KeepEntry;
  darkMode: boolean;
}) => (
  <div
    className={`border max-h-100  m-5 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
      note.isPinned ? "ring-2 ring-yellow-200" : ""
    } ${
      darkMode
        ? "bg-gray-800 border-gray-700 hover:border-gray-600"
        : "bg-white border-gray-200"
    }`}
  >
    <div className="flex items-start gap-4">
      <div className="flex-1 justify-between">
        <div className="flex items-center gap-2 mb-2">
          <h3
            className={`break-words break-all font-semibold text-lg ${
              darkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {note.title}
          </h3>
          {note.isPinned && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                darkMode
                  ? "bg-yellow-900/50 text-yellow-300"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              Pinned
            </span>
          )}
        </div>
        <p
          className={`h-50 break-words break-all overflow-hidden truncate mb-4 whitespace-pre-line leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {note.textContent}
        </p>
        <div className="flex items-center">
          <span
            className={`text-sm ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {formatDate(note.createdTimestampUsec)}
          </span>
        </div>
      </div>
    </div>
  </div>
);
