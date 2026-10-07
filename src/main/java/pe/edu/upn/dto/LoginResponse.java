package pe.edu.upn.dto;

public class LoginResponse {
    private final String accessToken;
    private final long expiresIn;
    private final UserDto user;

    public LoginResponse(String accessToken, long expiresIn, UserDto user) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public String getTokenType() { return "Bearer"; }
    public long getExpiresIn() { return expiresIn; }
    public UserDto getUser() { return user; }
}
