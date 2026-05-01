# TiDB Cloud SSL Certificates

This directory contains SSL certificates for secure TiDB Cloud connections.

## Required Certificate

Download the CA certificate from TiDB Cloud:

1. Log in to [TiDB Cloud Console](https://tidbcloud.com)
2. Navigate to your cluster
3. Click **Connect**
4. Download the CA certificate (usually `isrgrootx1.pem`)
5. Place it in this directory

## File Structure

```
certs/
├── README.md           # This file
└── isrgrootx1.pem      # TiDB CA certificate (download from TiDB Cloud)
```

## Alternative: Let's Encrypt Root

TiDB Cloud uses Let's Encrypt certificates. You can also download directly:

```bash
# Download ISRG Root X1
curl -o isrgrootx1.pem https://letsencrypt.org/certs/isrgrootx1.pem
```

## Verification

Verify the certificate:

```bash
openssl x509 -in isrgrootx1.pem -text -noout
```

## Security Notes

- ⚠️ This directory is gitignored - certificates should NOT be committed
- Each developer needs to download their own certificate
- Production deployments should use environment variables for the cert path
- Never share certificates or commit them to version control

## Connection String

With SSL enabled, your connection string should include:

```
mysql://user:pass@host:4000/db?sslaccept=strict
```

Or in Prisma:

```
DATABASE_URL="mysql://user:pass@host:4000/db?sslaccept=strict"
```
