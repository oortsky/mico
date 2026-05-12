export function truncate(text: string, limit = 1900) {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).split(" ").slice(0, -1).join(" ")}...`;
}
