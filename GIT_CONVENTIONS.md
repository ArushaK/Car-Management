# Git Workflow Guidelines

## Branch Naming Convention

All branch names should follow this pattern:
```
<type>/<task-number>-<short-description>
```

### Branch Types
- `feature` - New functionality or enhancements
- `bugfix` - Bug fixes
- `hotfix` - Critical fixes that need immediate deployment
- `release` - Release preparation
- `refactor` - Code improvements without changing functionality
- `docs` - Documentation updates
- `test` - Test-related changes
- `config` - added or updated configs and packages

### Task Number
- Always include the task/issue number from your project management system
- Example formats: `PROJ-123`, `TASK-456`, `#789`

### Short Description
- Brief description using kebab-case (lowercase with hyphens)
- Keep it under 50 characters
- Use descriptive verbs/nouns

### Examples
```
feature/PROJ-123-implement-user-authentication
bugfix/TASK-456-fix-login-redirect-issue
hotfix/BUG-789-security-vulnerability-patch
docs/PROJ-234-update-api-documentation
config/3-updated-tsconfig
```

## Commit Message Convention

All commit messages should follow this pattern:
```
<type>(<scope>): #<task-number> <subject>

<body>

<footer>
```

### Commit Types
- `feat` - New feature or enhancement
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Formatting, missing semi-colons, etc (no code change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates, etc
- `config` - change in config or package

### Scope (Optional)
- Component or area of the codebase affected
- Examples: `auth`, `api`, `ui`, `db`

### Task Number
- Always include the `#` symbol followed by the task number
- Example: `#123`, `#PROJ-456`

### Subject
- Brief description in present tense
- Don't capitalize first letter
- No period at the end
- Maximum 50 characters

### Body (Optional)
- More detailed description if needed
- Explain what and why, not how
- Use blank line to separate from subject
- Wrap lines at 72 characters

### Footer (Optional)
- Reference issues being closed
- Example: `Closes #123, #456`
- Include breaking change warnings with `BREAKING CHANGE:`

### Examples
```
feat(auth): #PROJ-123 implement OAuth2 login flow

Add Google and Facebook OAuth providers with JWT token support.
Update user model to store OAuth identifiers.

Closes #PROJ-123
```

```
fix(api): #456 correct pagination in users endpoint

Pagination was incorrectly calculating total pages leading to missing results.

Closes #456
```

```
docs: #TASK-789 update README with setup instructions

Add detailed steps for local development environment setup.
Include troubleshooting section for common issues.
```

## Workflow Guidelines

### Starting New Work
1. Create a new branch from `main` (or `develop` if using GitFlow)
2. Use the branch naming convention above
3. Make atomic, focused commits using the commit message format

### Code Review
1. Create a pull request with a descriptive title
2. Reference the task number in the PR description
3. Squash commits if necessary before merging
4. Delete branch after merging

### Releases
1. Create a `release` branch for version preparation
2. Tag releases with semantic versioning: `v1.0.0`
3. Maintain a changelog documenting all changes

## Git Hooks (Optional)
Consider using Git hooks to enforce these conventions:
- Pre-commit hooks for linting commit messages
- Pre-push hooks for branch naming validation

## Examples

### Full Workflow Example

```bash
# Starting new work
git checkout main
git pull
git checkout -b feature/TASK-123-user-profile-page

# Making commits
git add components/UserProfile
git commit -m "feat(profile): #TASK-123 add user profile component"

git add api/user
git commit -m "feat(api): #TASK-123 implement user profile endpoints

Added GET /api/users/:id/profile endpoint with proper validation.
Updated tests to cover new functionality.

Closes #TASK-123"

# Pushing branch
git push -u origin feature/TASK-123-user-profile-page
```