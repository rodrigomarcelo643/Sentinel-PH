# Claude AI Integration

This folder contains configuration and context for Claude AI integration with SentinelPH.

## Files

- **`project-context.md`** - Comprehensive project overview for Claude
- **`prompts.md`** - Library of useful prompts for common tasks
- **`config.json`** - Project configuration and standards

## Usage

### With Claude Desktop/Web

1. Share `project-context.md` at the start of conversation
2. Reference specific prompts from `prompts.md`
3. Claude will understand project structure and standards

### With Claude API

```typescript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const projectContext = fs.readFileSync('.claude/project-context.md', 'utf-8');

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  system: projectContext,
  messages: [
    {
      role: 'user',
      content: 'Review the trust score algorithm for security issues',
    },
  ],
});
```

## Common Tasks

### Code Review
```
Use prompt: "Security Audit" from prompts.md
Focus on: backend/webhooks/
```

### Feature Development
```
Use prompt: "Implement Feature" from prompts.md
Specify requirements and constraints
```

### Documentation
```
Use prompt: "API Documentation" from prompts.md
Target: Specific endpoint or service
```

### Testing
```
Use prompt: "Unit Tests" from prompts.md
Coverage: Functions and services
```

## Best Practices

1. **Always provide context** - Share project-context.md first
2. **Be specific** - Reference exact files and functions
3. **Follow standards** - Refer to config.json for code style
4. **Iterative refinement** - Review and improve Claude's output
5. **Test thoroughly** - Always test generated code

## Integration Examples

### Code Review Workflow
1. Share project context
2. Specify files to review
3. Use security audit prompt
4. Review findings
5. Implement fixes

### Feature Development Workflow
1. Share project context
2. Describe feature requirements
3. Use implement feature prompt
4. Review generated code
5. Add tests
6. Deploy

### Documentation Workflow
1. Share project context
2. Specify component/API
3. Use documentation prompt
4. Review and refine
5. Commit to repo

## Environment Variables

For Claude API integration:

```env
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

## Future Enhancements

- [ ] Automated code review on PR
- [ ] Documentation generation pipeline
- [ ] Test generation automation
- [ ] Performance optimization suggestions
- [ ] Security scanning integration

## Resources

- [Claude API Documentation](https://docs.anthropic.com/)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [SentinelPH Documentation](.agent/README.md)
