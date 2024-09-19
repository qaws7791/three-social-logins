import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { GoogleProvider, KakaoProvider, NaverProvider } from "./oauth";
import { type CookieOptions } from "hono/utils/cookie";
import { env } from "hono/adapter";
import { EnvType, GoogleEnvType, KaKaoEnvType, NaverEnvType } from "./types";

const SESSION_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  secure: true,
  domain: "127.0.0.1",
  httpOnly: true,
  maxAge: 3600,
  sameSite: "Lax",
};

const app = new Hono();

app.get("/", async (c) => {
  const variables = env<EnvType>(c, "workerd");
  const kakaoProvider = new KakaoProvider(
    variables.KAKAO_CLIENT_ID,
    variables.KAKAO_CLIENT_SECRET,
    variables.KAKAO_REDIRECT_URI
  );
  const naverProvider = new NaverProvider(
    variables.NAVER_CLIENT_ID,
    variables.NAVER_CLIENT_SECRET,
    variables.NAVER_REDIRECT_URI
  );
  const googleProvider = new GoogleProvider(
    variables.GOOGLE_CLIENT_ID,
    variables.GOOGLE_CLIENT_SECRET,
    variables.GOOGLE_REDIRECT_URI
  );
  const user = getCookie(c, "user");

  if (user === undefined) {
    return c.html(`
    <h1>Hello Hono!</h1>
    <a href="/login">로그인</a>
    `);
  }
  const [provider, token] = user.split(":");

  let profileUrl: string = "";

  if (provider === "kakao") {
    profileUrl = await kakaoProvider
      .fetchProfile(token)
      .then((res) => res.kakao_account.profile.profile_image_url);
  } else if (provider === "naver") {
    profileUrl = await naverProvider
      .fetchProfile(token)
      .then((res) => res.response.profile_image);
  } else if (provider === "google") {
    profileUrl = await googleProvider
      .fetchProfile(token)
      .then((res) => res.picture);
  }

  return c.html(`
    <h1>Hello Hono!</h1>
    <div>
    <p>provider: ${provider}</p>
    <p>token: ${token}</p>
    ${profileUrl ? `<img src="${profileUrl}" width="128" height="128" />` : ""}
    <a href="/logout">로그아웃</a>
    </div>
    `);
});

app.get("/login", (c) => {
  const variables = env<EnvType>(c);
  const kakaoProvider = new KakaoProvider(
    variables.KAKAO_CLIENT_ID,
    variables.KAKAO_CLIENT_SECRET,
    variables.KAKAO_REDIRECT_URI
  );
  const naverProvider = new NaverProvider(
    variables.NAVER_CLIENT_ID,
    variables.NAVER_CLIENT_SECRET,
    variables.NAVER_REDIRECT_URI
  );
  const googleProvider = new GoogleProvider(
    variables.GOOGLE_CLIENT_ID,
    variables.GOOGLE_CLIENT_SECRET,
    variables.GOOGLE_REDIRECT_URI
  );
  return c.html(`
    <h1>Login</h1>
    <div>
    <a href="${kakaoProvider.getSignInUrl()}">
    카카오 로그인
    </a>
    <a href="${naverProvider.getSignInUrl()}">
    네이버 로그인
    </a>
    <a href="${googleProvider.getSignInUrl()}">
    구글 로그인
    </a>
    </div>
    `);
});

app.get("/logout", (c) => {
  if (getCookie(c, "user")) deleteCookie(c, "user");
  return c.redirect("/");
});

app.get("/oauth/kakao/callback", async (c) => {
  const variables = env<KaKaoEnvType>(c);
  const kakaoProvider = new KakaoProvider(
    variables.KAKAO_CLIENT_ID,
    variables.KAKAO_CLIENT_SECRET,
    variables.KAKAO_REDIRECT_URI
  );
  const code = c.req.query("code");
  if (code === undefined) {
    return c.json({
      message: "카카오 로그인 - code가 없습니다.",
    });
  }
  const { access_token } = await kakaoProvider.fetchToken(code);

  if (access_token === undefined) {
    return c.json({
      message: "카카오 로그인 - 로그인 실패",
    });
  }

  // 1.실제로는 여기서 access_token을 이용해 사용자 정보를 가져와서 식별해야 합니다
  // 2.데이터베이스에서 기존 사용자인지 확인하고 새로운 사용자라면 데이터베이스에 저장하는 작업을 해야합니다.
  // 3.서비스 자체 로그인 세션을 만들어야 합니다.

  await setCookie(c, "user", `kakao:${access_token}`, SESSION_COOKIE_OPTIONS);

  return c.redirect("/");
});

app.get("/oauth/naver/callback", async (c) => {
  const variables = env<NaverEnvType>(c);
  const naverProvider = new NaverProvider(
    variables.NAVER_CLIENT_ID,
    variables.NAVER_CLIENT_SECRET,
    variables.NAVER_REDIRECT_URI
  );
  const code = c.req.query("code");
  if (code === undefined) {
    return c.json({
      message: "네이버 로그인 - code가 없습니다.",
    });
  }
  const { access_token } = await naverProvider.fetchToken(code);

  if (access_token === undefined) {
    return c.json({
      message: "네이버 로그인 - 로그인 실패",
    });
  }

  // 1.실제로는 여기서 access_token을 이용해 사용자 정보를 가져와서 식별해야 합니다
  // 2.데이터베이스에서 기존 사용자인지 확인하고 새로운 사용자라면 데이터베이스에 저장하는 작업을 해야합니다.
  // 3.서비스 자체 로그인 세션을 만들어야 합니다.

  await setCookie(c, "user", `naver:${access_token}`, SESSION_COOKIE_OPTIONS);

  return c.redirect("/");
});

app.get("/oauth/google/callback", async (c) => {
  const variables = env<GoogleEnvType>(c);
  const googleProvider = new GoogleProvider(
    variables.GOOGLE_CLIENT_ID,
    variables.GOOGLE_CLIENT_SECRET,
    variables.GOOGLE_REDIRECT_URI
  );
  const code = c.req.query("code");
  if (code === undefined) {
    return c.json({
      message: "구글 로그인 - code가 없습니다.",
    });
  }
  const { access_token } = await googleProvider.fetchToken(code);

  if (access_token === undefined) {
    return c.json({
      message: "구글 로그인 - 로그인 실패",
    });
  }

  // 1.실제로는 여기서 access_token을 이용해 사용자 정보를 가져와서 식별해야 합니다
  // 2.데이터베이스에서 기존 사용자인지 확인하고 새로운 사용자라면 데이터베이스에 저장하는 작업을 해야합니다.
  // 3.서비스 자체 로그인 세션을 만들어야 합니다.

  await setCookie(c, "user", `google:${access_token}`, SESSION_COOKIE_OPTIONS);

  return c.redirect("/");
});

export default app;
