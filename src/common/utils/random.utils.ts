export const generateRandomNumber = (count: number, length: number): string[] => {
  // count : 생성할 숫자의 총 개수
  // number : 숫자의 길이
  // count=2, number=6, 반환값 예시 : ['123456','654321']

  const numbers: string[] = [];
  for (let i = 0; i < count; i++) {
    let number = '';
    for (let j = 0; j < length; j++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    numbers.push(number);
  }
  return numbers;
};
