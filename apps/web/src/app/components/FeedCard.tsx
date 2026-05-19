/**
 * FeedCard
 *
 * Community feed post card with author info, content preview, and actions.
 */

"use client";

import { POST_TYPE_LABELS, POST_TYPE_COLORS, type PostType } from "../lib/posts";

interface FeedCardProps {
  author: string;
  avatar?: string;
  timeAgo: string;
  content: string;
  realmName?: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  onLike?: () => void;
  type?: PostType;
}

export default function FeedCard({
  author,
  timeAgo,
  content,
  realmName,
  likes = 0,
  comments = 0,
  isLiked = false,
  onLike,
  type,
}: FeedCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/30 hover:shadow-glow/50">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
          {author.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text">{author}</p>
            {type && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${POST_TYPE_COLORS[type]}`}>
                {POST_TYPE_LABELS[type]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{timeAgo}</span>
            {realmName && (
              <>
                <span>·</span>
                <span className="text-primary">{realmName}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-text-muted">{content}</p>
      <div className="flex items-center gap-5 text-xs text-text-muted">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 transition ${isLiked ? "text-accent" : "hover:text-primary"}`}
        >
          <svg className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-1.5 transition hover:text-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments}</span>
        </button>
        <button className="flex items-center gap-1.5 transition hover:text-primary">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
