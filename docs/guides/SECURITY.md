# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **DO NOT** Create a Public Issue

Please do not report security vulnerabilities through public GitHub issues.

### 2. Report Privately

Email us at: **security@moneyflow.app**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- We will acknowledge your email within 48 hours
- We'll send a detailed response within 7 days
- We'll notify you when the issue is fixed

### 4. Disclosure Policy

- We request that you do not publicly disclose the vulnerability until we've addressed it
- We will credit you in our security advisory (if you wish)
- We follow a coordinated disclosure process

## Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Email Confirmation**: Required for new accounts
- **Password Requirements**: Minimum 8 characters, complexity rules
- **Session Management**: Automatic token refresh and expiry
- **CSRF Protection**: Token-based CSRF prevention
- **Rate Limiting**: Protection against brute force attacks

### Data Protection

- **Encryption at Rest**: All data encrypted in database
- **Encryption in Transit**: TLS 1.3 for all connections
- **Row-Level Security (RLS)**: Database-level access control
- **Input Sanitization**: XSS and SQL injection prevention
- **Secure Headers**: CSP, X-Frame-Options, etc.

### Access Control

- **Role-Based Access Control (RBAC)**: Granular permissions
- **Multi-Tenant Isolation**: Complete data separation
- **Audit Logging**: All security events tracked
- **Permission Guards**: UI and route-level protection

### Client-Side Security

- **Content Security Policy**: Prevents XSS attacks
- **SameSite Cookies**: CSRF protection
- **Secure Storage**: Encrypted session data
- **Input Validation**: Comprehensive validation rules
- **Rate Limiting**: Client-side request throttling

### Backend Security

- **Supabase RLS Policies**: Database-level security
- **Edge Function Auth**: Secure server-side logic
- **API Key Rotation**: Regular key updates
- **Database Backups**: Automated daily backups

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Validate all user input** on both client and server
4. **Implement proper error handling** without exposing sensitive information
5. **Keep dependencies updated** regularly
6. **Use prepared statements** for all database queries
7. **Implement logging** for security-relevant events
8. **Review code** before merging to production

### For Users

1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Enable two-factor authentication** if available
3. **Keep software updated** to latest version
4. **Review audit logs** regularly
5. **Limit user permissions** to minimum required
6. **Logout when finished** especially on shared devices
7. **Be cautious of phishing** emails
8. **Report suspicious activity** immediately

## Known Security Considerations

### Rate Limiting

Client-side rate limiting is implemented for:

- API requests: 60 per minute
- Authentication: 5 attempts per 15 minutes
- Search: 30 per minute
- File uploads: 10 per hour
- Email: 3 per hour

### Session Management

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Automatic token refresh before expiry
- Sessions invalidated on password change

### Input Validation

All user input is validated using:

- Zod schemas for type safety
- Pattern matching for formats
- Length limits to prevent DoS
- XSS pattern detection
- SQL injection pattern detection

## Security Audit History

| Date       | Type             | Findings | Status      |
| ---------- | ---------------- | -------- | ----------- |
| 2024-11-24 | Internal Audit   | 0 High   | ✅ Resolved |
| 2024-10-15 | Penetration Test | 2 Medium | ✅ Resolved |
| 2024-09-01 | Code Review      | 3 Low    | ✅ Resolved |

## Compliance

### GDPR

- User data export functionality
- Right to be forgotten (data deletion)
- Consent management
- Data processing agreements

### SOC 2 (In Progress)

- Security controls documentation
- Access control policies
- Incident response procedures
- Regular security assessments

## Security Headers

We implement the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: [see CSP configuration]
```

## Dependency Security

### Automated Scanning

- Dependabot enabled for dependency updates
- npm audit run on every build
- Snyk scanning for vulnerabilities
- Regular dependency updates

### Manual Review

- Critical dependencies reviewed quarterly
- Security advisories monitored
- Patch releases applied within 48 hours

## Incident Response

### In Case of Security Incident

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify security team

2. **Assessment**
   - Determine scope and impact
   - Identify affected users
   - Document findings

3. **Containment**
   - Implement fixes
   - Deploy patches
   - Update security measures

4. **Communication**
   - Notify affected users
   - Public disclosure (if required)
   - Update documentation

5. **Post-Incident**
   - Root cause analysis
   - Implement preventive measures
   - Update security procedures

## Security Tools

We use the following tools to maintain security:

- **Supabase RLS**: Database-level access control
- **Zod**: Runtime type validation
- **React Hook Form**: Form validation
- **ESLint Security Plugin**: Static code analysis
- **npm audit**: Dependency scanning
- **Sentry**: Error tracking and monitoring

## Contact

For security concerns:

- **Email**: security@moneyflow.app
- **PGP Key**: [Available on request]
- **Response Time**: 48 hours

For general support:

- **Email**: support@moneyflow.app
- **Documentation**: docs.moneyflow.app

---

Last Updated: November 24, 2024
Version: 2.0.0
