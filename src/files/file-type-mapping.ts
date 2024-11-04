const fileTypeMappings: { [key: string]: string } = {
    // 이미지 파일
    'image/jpeg': 'images',
    'image/jpg': 'images',
    'image/png': 'images',
    'image/gif': 'images',
  
    // 문서 파일
    'application/pdf': 'documents',
    'application/x-hwp': 'documents',
    'application/msword': 'documents',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
  
    // 오디오 파일
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
  
    // 비디오 파일
    'video/mp4': 'video',
    'video/x-ms-wmv': 'video',
    'video/x-matroska': 'video',
  
    // 프레젠테이션 파일
    'application/vnd.ms-powerpoint': 'presentations',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentations',
  
    // 스프레드시트 파일
    'application/vnd.ms-excel': 'spreadsheets',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheets',
  
    // 텍스트 파일
    'text/plain': 'text',
  
    // 압축 파일
    'application/zip': 'archives',
    'application/x-rar-compressed': 'archives',
    'application/x-tar': 'archives',
  
    // 기타 파일
    'application/json': 'others',
    'application/xml': 'others',
  };
  
  // 지원되지 않는 기타 타입은 'others'로 처리
  export function getFolderForFileType(fileType: string): string {
    return fileTypeMappings[fileType] || 'others';
  }