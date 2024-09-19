# Social Login

## Introduction

This is a simple project to oauth2.0 with google, kakao, naver

The three login methods are based on oauth2.0, so the usage is almost the same

이 프로젝트는 소셜 로그인들이 oauth2.0에 기반하기 때문에 결국 비슷한 방식으로 동작하고 사용한다는 것을 쉽게 이해할 수 있도록 만들어진 프로젝트입니다.

## Approach

1. Create a project in the developer console of the service you want to use

2. Get the **client id** and **client secret**

3. Set the **redirect uri**

4. Create a login button or link based on **client id** and **redirect uri**

5. Get **Code** from redirect uri and request **access token** to the authorization server

6. Get the user's information using the access token

7. Compare the user's information with the database and add the user to the database if it does not exist

8. Create a session for the user

9. Redirect to the main page or the page you want to go to

## Getting Started

```
pnpm install
pnpm dev
```
