export interface PrivateBookingItem {
  id: string;
  instructorName: string;
  focusTopic: string;
  packageType: string;
  preferredSlot: string;
  totalPricePounds: number;
  status: string;
  createdAt: Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MerchItem {
  id: string;
  itemId: string;
  itemName: string;
  size: string | null;
  pricePounds: number;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface WaitlistItem {
  id: string;
  role: string;
  status: string;
  partnerEmail: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface SentimentItem {
  id: string;
  sentiment: string;
  notes: string | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
  classSession: {
    title: string;
  };
}

export interface QuestionItem {
  id: string;
  category: string;
  question: string;
  email: string | null;
  status: string;
  response: string | null;
  createdAt: Date;
}
