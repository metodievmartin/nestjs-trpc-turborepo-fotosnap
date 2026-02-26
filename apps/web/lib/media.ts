export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return '';
  }

  return `${process.env.NEXT_PUBLIC_URL}/uploads/images/${imagePath}`;
}

export function getAvatarUrl(avatarPath: string): string {
  if (!avatarPath) {
    return '';
  }

  return `${process.env.NEXT_PUBLIC_URL}/uploads/images/${avatarPath}`;
}
