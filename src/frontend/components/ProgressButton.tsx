import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { useMarkLessonComplete } from "@/frontend/hooks/use-lesson-progress";

interface ProgressButtonProps {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
}

/**
 * Button to mark a lesson as complete.
 * Uses optimistic update to immediately reflect the completed state.
 *
 * Implements Requirements 9.2, 9.3
 */
export function ProgressButton({ lessonId, userId, isCompleted }: ProgressButtonProps) {
  // Optimistic local state — starts from the server-provided value
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { mutate, isPending } = useMarkLessonComplete();

  const handleClick = () => {
    if (localCompleted) return;

    // Optimistic update
    setLocalCompleted(true);

    mutate(
      { userId, lessonId },
      {
        onError: () => {
          // Revert on error
          setLocalCompleted(false);
        },
      },
    );
  };

  if (localCompleted) {
    return (
      <Button
        disabled
        variant="secondary"
        className="gap-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 disabled:opacity-100"
      >
        <Check className="size-4" />
        Completed ✓
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-xl bg-red-800 text-white"
    >
      {isPending ? "Saving…" : "Mark Complete"}
    </Button>
  );
}
