export function isValidEmail(email: string): boolean {
  if (/\s/.test(email)) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;

  const domain = email.slice(atIndex + 1);
  const labels = domain.split(".");

  if (labels.length < 2 || labels.some((label) => !label)) {
    return false;
  }

  return true;
}