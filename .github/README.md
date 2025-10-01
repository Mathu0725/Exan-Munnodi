# GitHub Actions CI/CD Pipeline

This repository includes comprehensive GitHub Actions workflows for continuous integration, deployment, and security scanning.

## 🚀 Workflows Overview

### 1. **CI/CD Pipeline** (`ci.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**:
  - Lint & Format Check
  - Unit Tests with Coverage
  - Security Audit
  - Build Check
  - Integration Tests (with PostgreSQL)
  - E2E Tests (with Playwright)
  - Deploy to Staging (develop branch)
  - Deploy to Production (main branch)

### 2. **Security Scanning** (`security.yml`)
- **Triggers**: Daily schedule, Push/PR to main/develop
- **Jobs**:
  - Dependency Security Scan (npm audit + Snyk)
  - Code Security Scan (CodeQL)
  - Container Security Scan (Trivy)
  - Secrets Detection (TruffleHog)

### 3. **Dependency Updates** (`dependencies.yml`)
- **Triggers**: Weekly schedule, Manual dispatch
- **Jobs**:
  - Update Dependencies (creates PR)
  - Security Updates (creates PR)

### 4. **Release Management** (`release.yml`)
- **Triggers**: Version tags, Manual dispatch
- **Jobs**:
  - Create Release with Changelog
  - Build and Upload Assets
  - Deploy to Production

### 5. **Docker Build** (`docker.yml`)
- **Triggers**: Push to main/develop, Version tags, PRs
- **Jobs**:
  - Build and Push Multi-arch Docker Images
  - Security Scan Docker Images
  - Deploy to Staging/Production

## 🔧 Setup Instructions

### 1. **Required GitHub Secrets**

Add these secrets to your repository settings (`Settings > Secrets and variables > Actions`):

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
JWT_ISSUER=exam-munnodi
JWT_AUDIENCE=exam-munnodi-users
REDIS_URL=redis://host:6379
SNYK_TOKEN=your-snyk-token (optional)
GITHUB_TOKEN=auto-generated
```

### 2. **Environment Variables**

Set these in your deployment environments:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.exam-munnodi.com
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
JWT_ISSUER=exam-munnodi
JWT_AUDIENCE=exam-munnodi-users
REDIS_URL=redis://host:6379
```

### 3. **Environment Protection Rules**

Set up environment protection rules for:
- **staging**: Require review, restrict to develop branch
- **production**: Require review, restrict to main branch

### 4. **Branch Protection Rules**

Configure branch protection for `main` and `develop`:
- Require status checks to pass
- Require branches to be up to date
- Require pull request reviews
- Restrict pushes to matching branches

## 📊 Workflow Status

| Workflow | Status | Description |
|----------|--------|-------------|
| CI/CD | ✅ Active | Full pipeline with testing, linting, and deployment |
| Security | ✅ Active | Daily security scanning and vulnerability detection |
| Dependencies | ✅ Active | Weekly dependency updates with PR creation |
| Release | ✅ Active | Automated release management with changelog |
| Docker | ✅ Active | Multi-architecture container builds |

## 🛠️ Customization

### Adding New Tests
1. Add test files to `tests/` directory
2. Update `package.json` scripts if needed
3. Tests will automatically run in CI pipeline

### Adding New Environments
1. Create new environment in GitHub repository settings
2. Add environment-specific variables
3. Update deployment workflows as needed

### Customizing Security Scans
1. Modify `security.yml` to add new security tools
2. Update secret scanning patterns
3. Configure severity thresholds

## 🔍 Monitoring

### Workflow Status
- Check workflow runs in the "Actions" tab
- Monitor failed runs and fix issues promptly
- Set up notifications for critical failures

### Security Alerts
- Review security scan results regularly
- Address high-severity vulnerabilities immediately
- Monitor dependency updates for breaking changes

### Performance
- Monitor build times and optimize as needed
- Use caching strategies for faster builds
- Consider parallel job execution

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Test Failures**
   - Ensure all tests pass locally
   - Check test environment setup
   - Verify database connection strings

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Review code for security issues
   - Configure security tool settings

4. **Deployment Failures**
   - Verify environment variables
   - Check deployment platform status
   - Review deployment logs

### Getting Help

- Check workflow logs for detailed error messages
- Review GitHub Actions documentation
- Consult project README for setup instructions
- Create an issue for persistent problems

## 📈 Metrics

Track these metrics for continuous improvement:
- Build success rate
- Test coverage percentage
- Security vulnerability count
- Deployment frequency
- Mean time to recovery (MTTR)

---

For more information, see the [GitHub Actions documentation](https://docs.github.com/en/actions).
