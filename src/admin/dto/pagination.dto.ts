export class PaginationDto<T> {
  totalItems: number; // 전체 개수
  totalPages: number; // 전체 페이지
  currentPage: number; // 현재 페이지 번호
  pageSize: number; // 페이지당 항목 수
  items: T[]; // 페이지에 표시될 내용
}
