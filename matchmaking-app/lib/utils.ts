import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Display name types
export type DisplayNameType = 'FIRST_NAME' | 'NICKNAME' | 'FULL_NAME';

export interface UserWithProfile {
  firstName?: string | null;
  lastName?: string | null;
  Profile?: {
    nickname?: string | null;
    displayNameType?: DisplayNameType;
  } | null;
}

/**
 * Get the display name for a user based on their preference
 * @param user - User object with firstName, lastName, and Profile
 * @returns Display name string or fallback
 */
export function getDisplayName(user: UserWithProfile | null | undefined): string {
  if (!user) return 'Unknown User';

  const displayNameType = user.Profile?.displayNameType || 'FIRST_NAME';
  
  switch (displayNameType) {
    case 'NICKNAME':
      // Use nickname if available, otherwise fallback to firstName
      return user.Profile?.nickname || user.firstName || 'User';
    
    case 'FULL_NAME': {
      // Use full name (firstName + lastName)
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      return fullName || user.firstName || 'User';
    }
    
    case 'FIRST_NAME':
    default:
      // Use only firstName
      return user.firstName || 'User';
  }
}

/**
 * Get initials from user's name for avatar placeholder
 * @param user - User object with firstName and lastName
 * @returns Initials (1-2 characters)
 */
export function getUserInitials(user: UserWithProfile | null | undefined): string {
  if (!user) return 'U';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (user.Profile?.nickname) {
    return user.Profile.nickname[0].toUpperCase();
  }
  
  return 'U';
}
