export interface ICommonResponse<T> {
  status: 0 | 1;
  message: string;
  data: T;
  count?: number;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
}

export interface IUserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IUserLoginResponse {
  status: 1 | 0;
  message: string;
}
