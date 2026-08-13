export interface ApiResponse<T> {
  isSuccess:any;
  responseCode: number;
  data: T;
  message?: string;
}