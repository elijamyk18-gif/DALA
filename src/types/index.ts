export type Gender = "Male" | "Female" | "Non-binary" | "Prefer not to say";
export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed" | "Separated" | "Prefer not to say";
export type HasChildren = "Yes" | "No" | "Prefer not to say";
export type LookingFor = "Father figure" | "Mother figure" | "Sibling" | "Mentor" | "Friend" | "All";
export type UserRole = "admin" | "user";
export type SubscriptionStatus = "none" | "pending" | "active";

export interface Profile {
  id: string;
  user_email: string;
  display_name: string;
  full_name?: string;
  gender?: Gender;
  age?: number;
  location?: string;
  ethnicity?: string;
  marital_status?: MaritalStatus;
  has_children?: HasChildren;
  education?: string;
  occupation?: string;
  religion?: string;
  about_me?: string;
  bio?: string;
  interests?: string;
  hobbies?: string;
  looking_for?: LookingFor[];
  seeking_types?: string[];
  seeking_age_min?: number;
  seeking_age_max?: number;
  seeking_preferred_location?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_location?: string;
  preferred_religion?: string;
  preferred_lifestyle?: string;
  profile_photo?: string;
  photos?: string[];
  videos?: string[];
  views_count?: number;
  likes_count?: number;
  created_at?: string;
  is_premium?: boolean;
  subscription_status?: SubscriptionStatus;
  role?: UserRole;
}

export interface UserMedia {
  id: string;
  profile_id: string;
  url: string;
  media_type: 'photo' | 'video';
  is_private: boolean;
  likes_count: number;
  created_at: string;
}

export interface MediaLike {
  id: string;
  media_id: string;
  user_id: string;
  created_at: string;
}

/**
 * UserProfile is kept for backward compatibility with the existing codebase.
 */
export interface UserProfile extends Omit<Profile, 'interests' | 'hobbies'> {
  interests?: any; 
  hobbies?: any;
  name?: string;
  lifestyle?: {
    maritalStatus: string;
    hasChildren: boolean;
    religion: string;
  };
  seeking?: {
    types: string[];
    ageRange: { min: number; max: number };
    preferredLocation: string;
    preferredReligion: string;
    preferredLifestyle: string;
  };
  stats?: {
    views: number;
    likes: number;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'file' | 'location' | 'contact' | 'audio';
  file_name?: string;
  latitude?: number;
  longitude?: number;
  contact_name?: string;
  contact_phone?: string;
  is_read?: boolean;
}

export interface DalaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  attendees_count: number;
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  admin_id: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: string[];
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id: string;
  responses: string[];
  created_at: string;
}