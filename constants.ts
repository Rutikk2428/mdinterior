import { User } from './types';

export const COMPANY_INFO = {
  name: "MD Interior Choice",
  website: "https://mdinteriorchoice.com",
  phone: "+91 90505 55501",
  email: "mdinteriorchoice@gmail.com",
  address: "New Bus Stand, Karnal Road, Kaithal, Haryana 136027"
};

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'Admin User' },
  { id: '2', username: 'emp', role: 'employee', name: 'John Employee' }
];