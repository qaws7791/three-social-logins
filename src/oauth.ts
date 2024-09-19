import {
  GoogleProfileResponse,
  GoogleTokenResponse,
  KakaoProfileResponse,
  KakaoTokenResponse,
  NaverProfileResponse,
  NaverTokenResponse,
} from "./types";

abstract class OAuthProvider<TokenType, ProfileType> {
  constructor(
    protected providerName: string,
    protected clientId: string,
    protected clientSecret: string,
    protected redirectUri: string
  ) {
    if (!providerName || !clientId || !clientSecret || !redirectUri) {
      console.log(providerName, clientId, clientSecret, redirectUri);
      throw new Error(
        "providerName, clientId, clientSecret, redirectUri are required"
      );
    }

    this.providerName = providerName;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  public abstract getSignInUrl(): string;

  public abstract fetchToken(code: string): Promise<TokenType>;

  public abstract fetchProfile(token: string): Promise<ProfileType>;
}

export class KakaoProvider extends OAuthProvider<
  KakaoTokenResponse,
  KakaoProfileResponse
> {
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    super("kakao", clientId, clientSecret, redirectUri);
  }

  getSignInUrl() {
    return `https://kauth.kakao.com/oauth/authorize?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
    })}`;
  }

  /**
   * https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
   * @param code
   * @returns TokenResponse
   */
  fetchToken(code: string): Promise<KakaoTokenResponse> {
    return fetch(
      `https://kauth.kakao.com/oauth/token?${new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        client_secret: this.clientSecret,
      })}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    ).then((res) => res.json());
  }

  fetchProfile(token: string): Promise<KakaoProfileResponse> {
    return fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  }
}

export class NaverProvider extends OAuthProvider<
  NaverTokenResponse,
  NaverProfileResponse
> {
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    super("naver", clientId, clientSecret, redirectUri);
  }
  getSignInUrl() {
    return `https://nid.naver.com/oauth2.0/authorize?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
    })}`;
  }

  /**
   * https://developers.naver.com/docs/login/profile/profile.md
   */
  fetchToken(code: string): Promise<NaverTokenResponse> {
    return fetch(
      `https://nid.naver.com/oauth2.0/token?${new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      })}`
    ).then((res) => res.json());
  }

  fetchProfile(token: string): Promise<NaverProfileResponse> {
    return fetch("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  }
}

export class GoogleProvider extends OAuthProvider<
  GoogleTokenResponse,
  GoogleProfileResponse
> {
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    super("google", clientId, clientSecret, redirectUri);
  }
  getSignInUrl() {
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    })}`;
  }

  /**
   * https://developers.google.com/identity/protocols/oauth2/web-server?hl=ko
   * @param code
   */
  fetchToken(code: string): Promise<GoogleTokenResponse> {
    return fetch(
      `https://oauth2.googleapis.com/token?${new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      })}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    ).then((res) => res.json());
  }

  fetchProfile(token: string): Promise<GoogleProfileResponse> {
    return fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());
  }
}
