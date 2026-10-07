package pe.edu.upn.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import pe.edu.upn.config.JwtConfig;
import java.time.Instant;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final long expiresIn;

    public JwtService(JwtEncoder encoder, @Value("${shopchain.jwt.expiration-minutes}") long minutes) {
        if (minutes <= 0) throw new IllegalArgumentException("La duración del JWT debe ser positiva.");
        this.encoder = encoder;
        this.expiresIn = Math.multiplyExact(minutes, 60);
    }

    public String createToken(Authentication authentication) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(JwtConfig.ISSUER)
                .subject(authentication.getName())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn))
                .claim("roles", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).toList())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long getExpiresIn() { return expiresIn; }
}
