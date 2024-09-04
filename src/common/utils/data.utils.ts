// 데이터 전송할 때 string → date로 변환
// 일관된 결과 반환을 위해 toISOString을 사용하기로 함.
export function dateToISOString(date: Date | null): string | null {
    return date ? date.toISOString() : null;
}