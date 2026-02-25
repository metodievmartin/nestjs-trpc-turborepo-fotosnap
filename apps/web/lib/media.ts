export function getImageUrl(imagePath: string): string {
  return `${process.env.NEXT_PUBLIC_URL}/uploads/images/${imagePath}`;
}

export function getAvatarUrl(avatarPath: string): string {
  if (!avatarPath) {
    return '';
  }

  return `${process.env.NEXT_PUBLIC_URL}/uploads/images/${avatarPath}`;
}