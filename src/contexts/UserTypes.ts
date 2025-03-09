
export type UserRole = 'admin' | 'staff';

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface UserColor {
  id: string;
  primary: string;
  secondary?: string;
}

// Predefined colors for users
export const USER_COLORS: UserColor[] = [
  { id: 'blue', primary: 'bg-blue-500' },
  { id: 'green', primary: 'bg-green-500' },
  { id: 'amber', primary: 'bg-amber-500' },
  { id: 'red', primary: 'bg-red-500' },
  { id: 'purple', primary: 'bg-purple-500' },
  { id: 'pink', primary: 'bg-pink-500' },
  { id: 'indigo', primary: 'bg-indigo-500' },
  { id: 'teal', primary: 'bg-teal-500' },
  { id: 'orange', primary: 'bg-orange-500' },
  { id: 'lime', primary: 'bg-lime-500' },
  { id: 'emerald', primary: 'bg-emerald-500' },
  { id: 'cyan', primary: 'bg-cyan-500' },
  { id: 'sky', primary: 'bg-sky-500' },
  { id: 'violet', primary: 'bg-violet-500' },
  { id: 'fuchsia', primary: 'bg-fuchsia-500' },
  { id: 'rose', primary: 'bg-rose-500' },
];
