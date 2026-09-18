export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
