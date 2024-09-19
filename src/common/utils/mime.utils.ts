export const mimeToExtension: { [key: string]: string } = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/x-hwp': 'hwp',
  'application/zip': 'zip',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function getExtensionFromMime(fileType: string): string {
  return mimeToExtension[fileType] || 'bin';
}
