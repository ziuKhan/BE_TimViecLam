export interface IUser {
  _id: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: {
    _id: string;
    name: string;
  };
  isSetup?: boolean;
  permissions?: {
    apiPath: string;
    method: string;
    _id: string;
  }[];
  companyId?: string;
}
