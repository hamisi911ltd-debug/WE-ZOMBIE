import type { LessonContentType } from "@/backend/types/domain";

interface LessonViewerProps {
  lesson: {
    title: string;
    body: string | null;
    contentType: LessonContentType;
    contentUrl: string | null;
  };
}

/**
 * Renders lesson content based on its content_type.
 * Supports text, video, and PDF content types.
 *
 * Implements Requirements 9.1, 9.5
 */
export function LessonViewer({ lesson }: LessonViewerProps) {
  const { body, contentType, contentUrl } = lesson;

  if (contentType === "text") {
    return (
      <div className="admin-card rounded-xl p-6">
        {body ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {body}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No content available.</p>
        )}
      </div>
    );
  }

  if (contentType === "video") {
    return (
      <div className="admin-card rounded-xl p-4">
        {contentUrl ? (
          <video
            controls
            src={contentUrl}
            className="w-full rounded-xl"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500">
            No video available.
          </div>
        )}
      </div>
    );
  }

  if (contentType === "pdf") {
    return (
      <div className="admin-card rounded-xl p-4 space-y-3">
        {contentUrl ? (
          <>
            <iframe
              src={contentUrl}
              className="w-full h-96 rounded-xl border border-gray-200"
              title={lesson.title}
            />
            <a
              href={contentUrl}
              download
              className="inline-flex items-center gap-2 text-sm font-medium text-red-800 hover:underline"
            >
              Download PDF
            </a>
          </>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500">
            No PDF available.
          </div>
        )}
      </div>
    );
  }

  return null;
}
