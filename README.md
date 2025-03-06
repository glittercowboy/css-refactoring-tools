# CSS Refactoring Tools

A collection of tools to help refactor large CSS files into more manageable, maintainable stylesheets.

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the analysis on your CSS file: `npm run analyze -- path/to/your/styles.css`

## Available Tools

### CSS Analyzer

```
npm run analyze -- path/to/your/styles.css
```

This tool analyzes your CSS file and provides statistics and insights to help with refactoring decisions, including:

- Overall file size and selector count
- Specificity analysis
- Property usage patterns
- Potential areas for optimization

### CSS Optimizer

```
npm run optimize -- path/to/your/styles.css path/to/output.css
```

Optimizes your CSS by:

- Removing duplicates
- Consolidating media queries
- Minifying the output

### SCSS Converter

```
npm run convert -- path/to/your/styles.css scss-output-dir
```

Converts your CSS to SCSS format and creates a modern architecture:

- Extracts color and spacing variables
- Creates mixins for common patterns
- Sets up a component-based structure

## Recommended Refactoring Workflow

1. **Analysis**: Run the analyzer to understand your CSS complexity
2. **Quick Win**: Run the optimizer to get a cleaner CSS file
3. **Modernize**: Convert to SCSS and adopt a component-based approach
4. **Manual Review**: Fine-tune the generated files and architecture
5. **Implementation**: Gradually replace old CSS with the new approach

## Best Practices for CSS Maintenance

- Use a consistent naming convention (BEM, SMACSS, etc.)
- Organize CSS by component rather than page
- Use variables for repeated values
- Minimize nesting and specificity
- Document your approach for team members