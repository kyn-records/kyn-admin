export type User = {
  _id: string;
  displayName: string; //dummy
  username: string;
  name?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  preferredLanguage?: string;
  role?: string;
  designation?: string;
  bio?: string;
  profilePictureUrl?: string;
  profilePicturePath?: string;
  followingCount?: string;
  pronouns?: string;
  verified?: boolean;
  verifiedDate?: Date;
  customLink?: string;
  followerCount?: string;
  isPrivate?: boolean;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  phoneCountryCode?: string;
  phoneVerified?: boolean;
  secondaryEmail?: string;
  secondaryEmailVerified?: boolean;
  secondaryPhone?: string;
  secondaryPhoneCountryCode?: string;
  secondaryPhoneVerified?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  pincode?: number;
  organization?: string;
  isSubscribed?: boolean;
  subscriptionExpiry?: Date;
  subscriptionTier?: string;
  credits?: number;
  scope?: string[];
  invitedBy?: string;
  isActive?: boolean;
  deactivateDate?: Date;
  isBanned?: boolean;
  bannedDate?: Date;
  bannedReason?: string;
  isRestricted?: boolean;
  restrictedDate?: Date;
  restrictedReason?: string;
  deleted?: boolean;
  deletedDate?: Date;
  creationIp?: string;
  customData:  customSocialMedia;
  createdAt?: string;
  updatedAt?: string;
  requested?: boolean;
};

export type customSocialMedia =  {
  website : string,
  socialMedia?: { platform: string; url: string }[]; 

  }
