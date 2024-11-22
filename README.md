# 💉중간이들 BackEnd Repository

> ### **"중앙대 간호학과 동문 커뮤니티"**
>
> **재학생부터 현직 간호사까지,**
> **중앙대 간호인의 지식과 경험이 모이는 공간입니다.**
>
> - 학업 및 실습 정보 공유
> - 취업/진로 멘토링
> - 동문 네트워킹
>
> 함께 성장하는 중앙대 간호인들의 커뮤니티에 오신 것을 환영합니다.
> 
> ### 👉 <b>https://www.caugannies.com</b>
> 
>  ![리드미최상위메인](https://github.com/user-attachments/assets/cbd8f449-1c93-40b9-9213-d6ddc3f0a3bb)

---

## 바로가기

### 1. [프로젝트 개요](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#1-프로젝트-개요-1)
### 2. [프로젝트 아키텍쳐](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#2-프로젝트-아키텍쳐-1)
### 3. [구현 내용](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#3-구현-내용-1)
### 4. [이슈 해결](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#4-이슈-해결-1)
### 5. [배포](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#5-배포-1)
### 6. [느낀점](https://github.com/Gannies/Gannies_BackEnd?tab=readme-ov-file#6-느낀점-1)

---

# 1. 프로젝트 개요

## 1) 기간

| **단계**                          | **기간**               | **소요 주수** |
|----------------------------------|-----------------------|---------------|
| <b>기획 / 디자인 / 팀 결성</b>                    | 24.07.04 - 24.08.11   | 4주           |
| <b> 개발</b>                             | 24.08.12 - 24.09.20   | 5주           |
| <b>마무리 (배포/문서화 등)</b> | 24.09.21 - 24.10.19   | 4주           |

## 2) 인원 및 역할

- 1인

    | **담당자** | **역할**                                                                                              |
    |----------|----------------------------------------------------------------------------------------------------------|
    | <b>이가린</b> <br> [<i>(devellybutton)</i>](https://github.com/devellybutton)     | • 프로젝트 테이블 Entity 1차 설계 <br> • Auth, Users, Email, Files, Admin, Reports 모듈 기능 구현 <br> • Posts, Comments, Replies, Scraps, Likes 모듈: 오류 수정 및 비즈니스 로직 고도화 <br> • 모든 모듈에 DAO 추가: DB와 서비스 계층 사이의 데이터 CRUD 전담 계층 구축 <br> • 서버 배포 및 클라우드 DB 연결 <br> • Mock data 테스트 코드 작성 및 테스트 자동화 [예정] <br>  |
    | <b>김재연</b> <br> [<i>(APD-Kim)</i>](https://github.com/APD-Kim)     | • 1차 설계된 테이블 엔티티에 관계 설정 <br> • Posts, Comments, Replies, Scraps, Likes 모듈: 초기 CRUD 구현 <br> • [프로젝트 진행중 연락 두절되어 협업 종료 <i>(24.09.13 이후)</i>](https://github.com/Gannies/Gannies_BackEnd/wiki/%EA%B9%80%EC%9E%AC%EC%97%B0%EB%8B%98%EA%B3%BC%EC%9D%98-%ED%98%91%EC%97%85-%EC%A4%91%EB%8B%A8-%EA%B2%BD%EC%9C%84%EC%84%9C)  |

## 3) 기술스택

<div align="center">
  <!-- Node.js -->
  <img src="https://img.shields.io/badge/nodedotjs-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <!-- NestJS -->
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
  <!-- TypeORM -->
  <img src="https://img.shields.io/badge/typeorm-FE0803?style=for-the-badge&logo=typeorm&logoColor=white">
  <!-- TypeScript -->
  <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <br>
  <!-- MySQL -->
  <img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
  <!-- Redis Cloud -->
  <img src="https://img.shields.io/badge/redis%20cloud-D93B4A?style=for-the-badge&logo=redis&logoColor=white">
  <!-- AWS RDB (Amazon RDS) -->
  <img src="https://img.shields.io/badge/aws%20rds-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white">
  <br>
  <!-- EC2 -->
  <img src="https://img.shields.io/badge/aws%20ec2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white">
  <!-- CloudWatch -->
  <img src="https://img.shields.io/badge/aws%20cloudwatch-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white">
  <!-- S3 -->
  <img src="https://img.shields.io/badge/aws%20s3-569A31?style=for-the-badge&logo=amazonaws&logoColor=white">
  <!-- PM2 -->
  <img src="https://img.shields.io/badge/pm2-2B547E?style=for-the-badge&logo=pm2&logoColor=white">
  <!-- Socket.io -->
  <img src="https://img.shields.io/badge/socket.io-010101?style=for-the-badge&logo=socket-dot-io&logoColor=white">
</div>

<br>

| 기술         | 선택 이유                                                                                           |
|--------------|----------------------------------------------------------------------------------------------------|
| **NestJS**   | - 서비스 확장성을 고려한 구조화된 아키텍처와 객체 지향 설계 필요 <br> - 구조화된 프로젝트로 유지보수 및 확장성 용이 <br> - 의존성 주입(DI)로 테스트 용이 |
| **TypeORM**  | - 타입 안정성 제공, Active Record/Data Mapper 패턴을 지원하여 유연한 DB 작업 가능 <br> - 마이그레이션 및 버전 관리 용이 <br> -  복잡한 쿼리도 타입 안정성 보장하며 구현 가능 |
| **MySQL**    | - 관계형 모델이므로 데이터 일관성 보장 <br> - NoSQL에 비해 ACID 특성으로 트랜잭션 안정성 확보 <br> - 데이터 정합성 관리가 용이하고 강력한 인덱싱 기능으로 복잡한 쿼리 최적화 가능 |
| **Redis**    | - 메모리 DB를 활용한 빠른 인증 기능<i>(가입 시 이메일 인증 링크, 세션 정보 저장)</i> <br> - 세션 클러스터링 지원 <br> - 임시 데이터 처리에 최적화되어 서버 부하 감소 |
| **PM2**      | - 무중단 배포, 자동 프로세스 관리, 실시간 모니터링 기능 제공 <br> - VM 배포의 단점으로 배포 방법을 변경할 예정 |
| **Socket.io**| - 세션 확장을 위한 양방향 실시간 통신 기능 필요 <br> - 네트워크 불안정 상황에서도 자동 재연결 <br> - 클라이언트와 서버 간 효율적인 이벤트 처리 및 룸/네임스페이스 관리 기능 도입 |


## 4) 개발환경

- <b>Node.js</b> : v20.9.0
- <b>NestJS</b> : @nestjs/core@10.4.1 
- <b>TypeORM</b> : typeorm@0.3.20
- <b>TypeScript</b> : typescript@5.6.2
- <b>MySQL</b> : 8.0.39
- <b>Redis</b> : (Cloud)
- <b>PM2</b> : 5.4.2
- <b>Docker</b> : [예정]
- <b>npm</b> : 10.1.0
- <b>socket.io</b> : 10.4.4

---

# 2. 프로젝트 아키텍쳐

## 1) 전체 프로젝트 구조

## 2) ERD

![page2_1](https://github.com/user-attachments/assets/68ec4ded-fee4-4c3e-81d5-44db7501b7f3)

- Tool : dbdiagram.io
- Link : https://dbdiagram.io/d/Caugannies_ver-2-67400c7de9daa85aca54d321

## 3) 인증 시퀀스 다이어그램

## 4) 게시물 파일 업로드 시퀀스 다이어그램

---

# 3. 구현 내용

| 항목 | 설명 | 기술 스택 | 세부 구현 |
|--------|------|------------|-----------|
| **인증 시스템** | 세션 기반 인증 및 관리 | Express-session<br>connect-redis<br>Socket.io | - 환경별 동적 세션 쿠키 생성<br>- Redis 기반 세션 클러스터링<br>- 소켓 기반 세션 자동 연장<br>- 관리자 세션 강제 종료 기능 |
| **아키텍처 설계** | 모듈화 및 계층 분리 | NestJS | - 중앙 집중식 DAO 모듈<br>- 단일 책임 원칙 기반 서비스 계층<br>- 모듈 순환 참조 방지 설계 |
| **에러 처리** | 계층별 에러 처리 전략 | NestJS Exception Filter<br>Custom Exceptions | - API 별 커스텀 에러 클래스<br>- Exception Filter로 DB 에러 처리<br>- 클라이언트/서버 로그 분리 |
| **로깅 시스템** | 중앙화된 로그 관리 | Winston Logger<br>AWS CloudWatch | - 요청/응답 로깅<br>- 에러 로깅<br>- 레벨별 로그 분류 |
| **배치 프로세스** | 주기적 데이터 동기화 | NestJS Scheduler | - 좋아요 수 집계 (1분)<br>- S3-DB URL 동기화 (1일) |
| **인프라** | AWS 클라우드 인프라 | AWS EC2<br>RDS<br>S3<br>CloudWatch | - EC2 애플리케이션 서버<br>- RDS MySQL 데이터베이스<br>- S3 파일 스토리지<br>- CloudWatch 모니터링 |
| **외부 서비스** | 외부 API 통합 | Google Vision API<br>Twilio API | - OCR 기능 구현<br>- SMS 인증 구현 |
| **성능 최적화** | 서버 부하 분산 | Redis<br>AWS S3 | - Redis 세션 스토어<br>- 클라우드 스토리지 활용 |

---

# 4. 이슈 해결

## 1) 세션 관리 이슈

## 2) 데이터 쿼리 최적화

## 3) 배포 프로세스 개선

## 4) 테스트 자동화 및 품질 보증

## 5) 기타

---

# 5. 배포

---

# 6. 느낀점

- ## 1) 기술 선택의 새로운 기준으로 안전성을 생각하게 됨

    - 혼자 서버를 만들면서 개발 과정에서 발생하는 <b>`인적 오류의 위험성`</b>을 느꼈음. 
    - 성능과 편의성도 중요하지만, 개발 초기 단계부터 <b>`실수를 방지할 수 있는 방법`</b>을 고려하는게 더 중요하다고 생각함. 
    - <b>`인적 실수를 방지`</b>할 수 있는 기술을 선택하며, <b>`체계적인 설계`</b>를 통해 오류를 예방하고, 지속적인 테스트를 수행하여 안정적인 시스템을 구축하는 것이 중요할 것 같음.

- ## 2) 네트워킹에 대한 폭넓은 이해의 필요성을 느낌.

    - 효과적인 의사소통을 위해서는 <b>`도식 활용`</b>이 도움이 됨
    - 이번 프로젝트에서 다른 개발자들과 협업을 할 때 의사소통 해야할 일이 굉장히 많았음. 
    - 데이터 구조와 단일 API의 기능까지 기술적 아이디어를 전달할 때 시퀀스 다이어그램과 같은 도식을 활용하면 복잡한 로직을 명확하게 시각화할 수 있음.
    - 이는 <b>`논리적 오류를 줄이고`</b> 팀원들과 <b>`원활한 소통`</b>을 가능하게 하였음.

- ## 3) 프로그래밍은 궁극적인 목표를 달성하기 위한 도구

    - 간호학과 커뮤니티 사이트를 개발하면서, 개발할 때 기술적인 내용도 신경을 써야하지만 실제 사용자에게 제공되는 서비스 콘텐츠가 더 중요하다는 것을 깨달았음.
    - 즉, 프로그래밍은 서비스를 구현하기 위한 도구라는 것을 이해하게 되었고, <b>`비즈니스 로직에 집중`</b>해야 한다는 것을 깨달았음.