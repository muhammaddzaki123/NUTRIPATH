export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: 'user' | 'nutritionist';
  disease?: string | null;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  gender?: 'male' | 'female' | null;
  lastSeen?: string;
  specialization?: string; // for nutritionist only
}
