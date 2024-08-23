import { ValidationMessages } from "./validation-messages-interface";

export const validationMessages: ValidationMessages = {
    nickname: '닉네임은 한글 또는 영문 2~8자를 입력해주세요.',
    email : '유효한 이메일을 입력해주세요.',
    password : "최소 8자에서 16자의 영문 대문자/숫자/특수문자를 각각 하나씩 입력해주세요. 특수문자는 '!@#$%^&*?_'만 가능합니다.",
    studentStatus : "재학생(current_student) 또는 졸업생(alumni)입니다."
}