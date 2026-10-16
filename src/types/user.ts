export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  district: string;
};

export type AdminSession = {
  token: string;
  user: AdminUser;
};

export type AdminLoginInput = {
  email: string;
  password: string;
};
