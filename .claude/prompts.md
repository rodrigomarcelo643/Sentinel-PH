# Claude Prompts Library

## Code Review Prompts

### Trust Score Algorithm Review
```
Review the trust score calculation algorithm in the codebase. Check for:
- Mathematical correctness
- Edge cases handling
- Performance optimization opportunities
- Security vulnerabilities
- Potential gaming/manipulation risks
```

### Security Audit
```
Perform a security audit of the backend webhooks focusing on:
- Authentication and authorization
- Input validation and sanitization
- Rate limiting effectiveness
- SQL/NoSQL injection risks
- XSS prevention
- CSRF protection
```

## Development Prompts

### Implement Feature
```
Implement [feature name] with the following requirements:
- [Requirement 1]
- [Requirement 2]
- Follow existing code patterns
- Include error handling
- Add TypeScript types
- Write unit tests
```

### Bug Fix
```
Fix the bug in [file/component] where [description of bug].
Expected behavior: [expected]
Current behavior: [actual]
Maintain existing functionality and add tests to prevent regression.
```

### Refactor Code
```
Refactor [file/function] to improve:
- Code readability
- Performance
- Maintainability
- Type safety
Keep the same functionality and API.
```

## Documentation Prompts

### API Documentation
```
Generate comprehensive API documentation for [endpoint/service] including:
- Request/response formats
- Authentication requirements
- Error codes and messages
- Usage examples
- Rate limits
```

### Component Documentation
```
Document the [component name] React component:
- Props interface
- Usage examples
- State management
- Side effects
- Accessibility features
```

## Testing Prompts

### Unit Tests
```
Generate unit tests for [function/service] covering:
- Happy path scenarios
- Edge cases
- Error conditions
- Mock external dependencies
Use Jest and follow existing test patterns.
```

### Integration Tests
```
Create integration tests for [feature/workflow]:
- Test complete user flow
- Mock external APIs
- Verify database operations
- Check error handling
```

## RAG Enhancement Prompts

### Improve Categorization
```
Analyze observation categorization accuracy and suggest improvements:
- Review current categories
- Suggest new categories if needed
- Improve prompt engineering
- Optimize RAG context retrieval
```

### Optimize Vector Search
```
Optimize the RAG vector search for better performance:
- Review embedding strategy
- Suggest indexing improvements
- Optimize query parameters
- Reduce latency
```

## Database Prompts

### Schema Review
```
Review the Firestore schema for:
- Data modeling best practices
- Query optimization
- Index requirements
- Security rules
- Scalability concerns
```

### Query Optimization
```
Optimize the database query in [file] for:
- Reduced read operations
- Better indexing
- Efficient filtering
- Pagination support
```

## UI/UX Prompts

### Component Creation
```
Create a React component for [feature] with:
- TypeScript types
- Tailwind CSS styling
- Responsive design
- Accessibility (ARIA)
- Loading and error states
```

### Form Validation
```
Implement form validation for [form name]:
- Client-side validation
- Error messages
- Real-time feedback
- Accessibility
- TypeScript types
```

## Performance Prompts

### Optimize Performance
```
Analyze and optimize performance of [component/service]:
- Identify bottlenecks
- Reduce bundle size
- Optimize re-renders
- Implement caching
- Lazy loading
```

### Code Splitting
```
Implement code splitting for:
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Optimize bundle size
```

## Deployment Prompts

### CI/CD Pipeline
```
Create CI/CD pipeline configuration for:
- Automated testing
- Build optimization
- Deployment to Firebase
- Environment management
- Rollback strategy
```

### Production Checklist
```
Generate production deployment checklist:
- Environment variables
- Security configurations
- Performance optimizations
- Monitoring setup
- Backup strategy
```
