/**
 * FriendshipButton
 *
 * Context-aware friend request / accept / block button for profile headers.
 * Shows "Add Friend", "Accept", "Friends", or "Blocked" based on status.
 */

"use client";

interface FriendshipButtonProps {
  status?: "none" | "pending_sent" | "pending_received" | "friends" | "blocked";
  onRequest?: () => void;
  onAccept?: () => void;
  onRemove?: () => void;
  onBlock?: () => void;
}

export default function FriendshipButton({
  status = "none",
  onRequest,
  onAccept,
  onRemove,
  onBlock,
}: FriendshipButtonProps) {
  if (status === "friends") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
          Friends
        </span>
        <button
          onClick={onRemove}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted transition hover:bg-surface-light hover:text-text"
        >
          Unfriend
        </button>
      </div>
    );
  }

  if (status === "pending_sent") {
    return (
      <button
        onClick={onRemove}
        className="rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
      >
        Cancel Request
      </button>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onAccept}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:bg-primary-dark"
        >
          Accept Friend
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted transition hover:bg-surface-light hover:text-text"
        >
          Decline
        </button>
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <button
        onClick={onBlock}
        className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
      >
        Unblock
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRequest}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition hover:bg-primary-dark"
      >
        Add Friend
      </button>
      <button
        onClick={onBlock}
        className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted transition hover:bg-surface-light hover:text-text"
      >
        Block
      </button>
    </div>
  );
}
