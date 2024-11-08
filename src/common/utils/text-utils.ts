/**
 * HTML 태그를 제거하고 텍스트만 추출하여 글자 수를 제한하는 함수
 * @param content HTML 콘텐츠 (TinyMCE 에디터 본문)
 * @param maxLength 최대 글자 수 (5000자로 제한)
 * @returns 글자 수가 제한된 텍스트
 */
export function processContent(content: string, maxLength: number = 5000): string {
  // 1) HTML 태그 제거
  const textOnly = content.replace(/<[^>]*>/g, '');

  // console.log('HTML 포함 길이:', content.length);
  // console.log('HTML 미포함 길이:', textOnly.length);

  // 2) 텍스트의 길이가 maxLength를 넘으면 자르기
  if (textOnly.length > maxLength) {
    let result = '';
    let textCount = 0; // 자른 텍스트의 길이를 추적
    let insideTag = false; // HTML 태그 내부인지 외부인지 확인

    // 3) HTML 태그를 포함한 원본 content에서 하나씩 검사
    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      // 태그의 시작 부분
      if (char === '<') {
        insideTag = true;
        result += char; // 태그 시작을 그대로 추가
      }
      // 태그의 끝 부분
      else if (char === '>') {
        insideTag = false;
        result += char; // 태그 끝을 그대로 추가
      }
      // 텍스트 부분
      else if (!insideTag) {
        if (textCount < maxLength) {
          result += char; // 텍스트를 그대로 추가
          // 텍스트 길이를 계산하면서 증가
          if (textOnly[textCount] !== ' ' && textOnly[textCount] !== '\n') {
            textCount++;
          }
        } else {
          break;
        }
      }
      // 태그 내부일 경우
      else {
        result += char;
      }
    }

    return result; // 잘린 HTML 콘텐츠 반환
  }

  // 4) 글자 수가 maxLength 이하일 경우 원본 그대로 반환
  return content;
}
