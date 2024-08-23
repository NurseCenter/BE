import { EStudentStatus } from "src/users/enums";
import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { validationMessages } from "../interfaces/validation-messages";

// Regex
const NICKNAME_REGEX = /^[A-Za-z가-힣]{2,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?_]).{8,16}$/;

export class CreateUserDto {
    // 닉네임
    // 한글 또는 영문 2~8자 (숫자 및 특수문자 불가)
    @IsString()
    @Length(2, 8)
    @Matches(NICKNAME_REGEX, { message: validationMessages.nickname } )
    readonly nickname: string;
    
    // 이메일
    // 이메일 정규식
    @IsString()
    @Matches(EMAIL_REGEX, { message : validationMessages.email })
    readonly email: string;
    
    // 비밀번호
    // 8 ~ 16자, 영문 대문자, 소문자, 숫자, 특수문자 각각 1개씩 포함
    // 특수문자는 '!@#$%^&*?_'만 가능
    @IsString()
    @Matches(PASSWORD_REGEX, { message: validationMessages.password })
    readonly password: string;
    
    // 졸업생/재학생 여부
    @IsEnum(EStudentStatus, { message: validationMessages.studentStatus})
    readonly status: EStudentStatus;
    
    // 인증서류 링크
    @IsString()
    readonly certificationDocumentUrl: string;
}
