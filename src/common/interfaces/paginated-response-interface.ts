export interface IPaginatedResponse<T> {
  items: T[]; // 내용
  totalItems: number; // 전체 내용 개수
  totalPages: number; // 전체 페이지수
  currentPage: number; // 현재 페이지
}
