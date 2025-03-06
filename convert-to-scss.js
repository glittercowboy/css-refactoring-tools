/**
 * CSS to SCSS Conversion Tool
 * --------------------------
 * This script converts a CSS file to SCSS format,
 * extracting variables and creating mixins for common patterns.
 */

const fs = require('fs');
const path = require('path');
const css = require('css');

// Configuration
const CSS_FILE = process.argv[2] || 'css/optimized.css';
const OUTPUT_DIR = process.argv[3] || 'scss';

async function convertToSCSS() {
  try {
    console.log(`Converting CSS file to SCSS: ${CSS_FILE}`);
    
    // Read the CSS file
    const cssContent = fs.readFileSync(CSS_FILE, 'utf8');
    
    // Parse the CSS
    const parsedCSS = css.parse(cssContent);
    
    // Create the output directory structure
    const dirs = ['base', 'components', 'layout', 'utilities'];
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
    dirs.forEach(dir => {
      const dirPath = path.join(OUTPUT_DIR, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
    });
    
    // Extract variables
    const variables = extractVariables(parsedCSS);
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'base', '_variables.scss'),
      generateVariablesFile(variables)
    );
    
    // Create common mixins
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'base', '_mixins.scss'),
      generateMixinsFile()
    );
    
    // Create main SCSS file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'main.scss'),
      generateMainFile(dirs)
    );
    
    // Create sample component files
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'components', '_buttons.scss'),
      generateSampleComponentFile('buttons')
    );
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'components', '_sections.scss'),
      generateSampleComponentFile('sections')
    );
    
    console.log(`\nSCSS structure created in ${OUTPUT_DIR}/`);
    console.log('Next steps:');
    console.log('1. Review the extracted variables and mixins');
    console.log('2. Organize your CSS rules into the appropriate folders');
    console.log('3. Use the variables and mixins to replace hardcoded values');
  } catch (error) {
    console.error('Error converting to SCSS:', error);
  }
}

function extractVariables(parsedCSS) {
  const colors = new Set();
  const spacing = new Set();
  const breakpoints = new Set();
  
  // Extract colors and spacing values
  parsedCSS.stylesheet.rules.forEach(rule => {
    if (rule.type === 'rule' && rule.declarations) {
      rule.declarations.forEach(decl => {
        if (decl.type === 'declaration') {
          // Extract colors
          if (
            decl.property && 
            (decl.property.includes('color') || 
             decl.property.includes('background') ||
             decl.property.includes('border'))
          ) {
            const colorMatch = decl.value.match(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/);
            if (colorMatch) {
              colors.add(colorMatch[0]);
            }
          }
          
          // Extract spacing values
          if (
            decl.property && 
            (decl.property.includes('margin') || 
             decl.property.includes('padding'))
          ) {
            const spacingMatch = decl.value.match(/\d+px/);
            if (spacingMatch) {
              spacing.add(spacingMatch[0]);
            }
          }
        }
      });
    }
    
    // Extract media query breakpoints
    if (rule.type === 'media') {
      const breakpointMatch = rule.media.match(/\d+px/);
      if (breakpointMatch) {
        breakpoints.add(breakpointMatch[0]);
      }
    }
  });
  
  return {
    colors: Array.from(colors),
    spacing: Array.from(spacing).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    }),
    breakpoints: Array.from(breakpoints).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    })
  };
}

function generateVariablesFile(variables) {
  let scss = '// Color Variables\n';
  
  // Color variables
  variables.colors.forEach((color, index) => {
    // Try to assign meaningful names based on common colors
    let name = `color-${index + 1}`;
    if (color === '#0d0c0d') name = 'color-dark';
    if (color === '#f0f0f0') name = 'color-light';
    if (color === '#e6ac55') name = 'color-accent';
    if (color === '#FFFFFF' || color === '#ffffff') name = 'color-white';
    
    scss += `$${name}: ${color};\n`;
  });
  
  // Spacing variables
  scss += '\n// Spacing Variables\n';
  variables.spacing.forEach((value, index) => {
    const size = parseInt(value);
    let name = 'spacing-';
    
    if (size === 0) name += 'none';
    else if (size <= 4) name += 'xs';
    else if (size <= 8) name += 'sm';
    else if (size <= 16) name += 'md';
    else if (size <= 24) name += 'lg';
    else if (size <= 32) name += 'xl';
    else name += 'xxl';
    
    // Add a suffix for duplicates
    if (variables.spacing.filter(s => parseInt(s) === size).length > 1) {
      name += `-${index}`;
    }
    
    scss += `$${name}: ${value};\n`;
  });
  
  // Breakpoint variables
  scss += '\n// Breakpoint Variables\n';
  variables.breakpoints.forEach((value) => {
    const size = parseInt(value);
    let name = 'breakpoint-';
    
    if (size <= 480) name += 'mobile';
    else if (size <= 768) name += 'tablet';
    else if (size <= 1024) name += 'desktop';
    else if (size <= 1280) name += 'widescreen';
    else name += 'ultrawide';
    
    scss += `$${name}: ${value};\n`;
  });
  
  return scss;
}

function generateMixinsFile() {
  return `// Responsive Mixins
@mixin respond-to($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: $breakpoint-mobile) { @content; }
  }
  @else if $breakpoint == tablet {
    @media (min-width: $breakpoint-mobile + 1) and (max-width: $breakpoint-tablet) { @content; }
  }
  @else if $breakpoint == desktop {
    @media (min-width: $breakpoint-tablet + 1) { @content; }
  }
}

// Common Block Styling
@mixin block-styling($margin-top: 0, $margin-bottom: 0) {
  margin-top: $margin-top;
  margin-right: 0;
  margin-bottom: $margin-bottom;
  margin-left: 0;
  
  .block {
    border: 4px none black;
    border-radius: 4px;
    padding: $spacing-md;
    
    @include respond-to(desktop) {
      padding: $spacing-lg;
    }
  }
}

// Button Styles
@mixin button($bg-color: $color-accent, $text-color: $color-dark) {
  display: inline-block;
  padding: $spacing-sm $spacing-md;
  background-color: $bg-color;
  color: $text-color;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
  
  &:hover {
    opacity: 0.9;
  }
}
`;
}

function generateMainFile(dirs) {
  let imports = '// Main SCSS File\n\n';
  
  // Import base files first
  imports += '// Base styles\n';
  imports += '@import "base/variables";\n';
  imports += '@import "base/mixins";\n';
  imports += '@import "base/reset";\n';
  imports += '@import "base/typography";\n\n';
  
  // Import other directories
  dirs.filter(dir => dir !== 'base').forEach(dir => {
    imports += `// ${dir.charAt(0).toUpperCase() + dir.slice(1)}\n`;
    imports += `@import "${dir}/**/*";\n\n`;
  });
  
  return imports;
}

function generateSampleComponentFile(type) {
  if (type === 'buttons') {
    return `// Button Component Styles
.btn {
  @include button;
  
  &--primary {
    @include button($color-accent, $color-dark);
  }
  
  &--secondary {
    @include button($color-dark, $color-light);
  }
  
  &--small {
    padding: $spacing-xs $spacing-sm;
    font-size: 0.875rem;
  }
  
  &--large {
    padding: $spacing-md $spacing-lg;
    font-size: 1.125rem;
  }
}
`;
  }
  
  if (type === 'sections') {
    return `// Section Component Styles
.section {
  padding: $spacing-lg 0;
  
  &--dark {
    background-color: $color-dark;
    color: $color-light;
  }
  
  &--light {
    background-color: $color-light;
    color: $color-dark;
  }
  
  &--accent {
    background-color: $color-accent;
    color: $color-dark;
  }
  
  // Common section spacing
  @include respond-to(mobile) {
    padding: $spacing-md 0;
  }
}

// Block component within sections
.block {
  @include block-styling;
}
`;
  }
  
  return '// Sample component file';
}

convertToSCSS();