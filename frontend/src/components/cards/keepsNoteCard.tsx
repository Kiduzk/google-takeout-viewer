import { useState, useEffect } from "react";
import { formatDate } from "../../App";
import { X } from "lucide-react";
import type { KeepEntry } from "../../types";

export const KeepNoteCard = ({
  note,
  darkMode,
}: {
  note: KeepEntry;
  darkMode: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openModal = () => {
    setIsAnimating(true);
    setIsModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsAnimating(true);
    setIsModalOpen(false);
    // Re-enable scrolling when modal is closed
    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 300); // Match the duration of the closing animation
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Prevent click events on the modal from closing it when clicking the content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        onClick={openModal}
        className={`p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="space-y-2">
          {note.title && (
            <h3
              className={`font-medium text-lg ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {note.title}
            </h3>
          )}
          {note.textContent && (
            <p
              className={`text-sm line-clamp-5 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {note.textContent}
            </p>
          )}
          <div
            className={`text-xs ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formatDate(new Date(note.createdTimestampUsec).toISOString())}
          </div>
        </div>
      </div>

      {/* Modal Overlay with Blur Effect */}
      <div
        className={`fixed inset-0 z-50 backdrop-blur-sm transition-all duration-300 ${
          isModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } ${darkMode ? "bg-gray-900/50" : "bg-gray-200/50"}`}
        onClick={closeModal}
      >
        {/* Modal Container */}
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Modal Card */}
          <div
            className={`relative max-w-2xl w-full max-h-[90vh] rounded-xl shadow-xl transform transition-all duration-300 ${
              isModalOpen && !isAnimating
                ? "scale-100 opacity-100 translate-y-0"
                : isAnimating && isModalOpen
                  ? "scale-110 opacity-0 translate-y-4"
                  : "scale-95 opacity-0 translate-y-4"
            } ${darkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={handleModalContentClick}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X size={20} />
            </button>

            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[90vh]">
              {note.title && (
                <h2
                  className={`text-2xl font-bold mb-4 ${
                    darkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {note.title}
                </h2>
              )}

              {note.textContent && (
                <div
                  className={`whitespace-pre-wrap mb-4 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {note.textContent}
                </div>
              )}

              {note.listContent && (
                <div className="mt-4">
                  <h3
                    className={`text-lg font-medium mb-2 ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    List Items
                  </h3>
                  <ul
                    className={`space-y-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {(typeof note.listContent === "string"
                      ? JSON.parse(note.listContent)
                      : note.listContent
                    ).map(
                      (
                        item: { checked: boolean; text: string },
                        index: number
                      ) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>{item.checked ? "☑" : "☐"}</span>
                          <span>{item.text}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
              <div
                className={`mt-6 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Created:{" "}
                {formatDate(new Date(note.createdTimestampUsec).toISOString())}
                {note.createdTimestampUsec !== note.userEditedTimestampUsec && (
                  <div>
                    Edited:{" "}
                    {formatDate(
                      new Date(note.userEditedTimestampUsec).toISOString()
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
