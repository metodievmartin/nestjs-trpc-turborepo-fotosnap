import Link from 'next/link';

interface PostCaptionProps {
  userId: string;
  username: string;
  caption: string;
}

export function PostCaption({ userId, username, caption }: PostCaptionProps) {
  return (
    <p className="text-sm">
      <Link
        href={`/users/${userId}`}
        className={`font-semibold hover:opacity-80${caption ? ' mr-1' : ''}`}
      >
        {username}
      </Link>
      {caption}
    </p>
  );
}
