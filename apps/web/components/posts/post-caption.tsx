import Link from 'next/link';

interface PostCaptionProps {
  username: string;
  caption: string;
}

export function PostCaption({ username, caption }: PostCaptionProps) {
  return (
    <p className="text-sm">
      <Link
        href={`/users/${username}`}
        className={`font-semibold hover:opacity-80${caption ? ' mr-1' : ''}`}
      >
        {username}
      </Link>
      {caption}
    </p>
  );
}
