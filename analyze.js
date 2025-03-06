/**
 * CSS Analysis Tool
 * ----------------
 * This script analyzes a CSS file and provides statistics and insights
 * to help with refactoring decisions.
 */

const fs = require('fs');
const path = require('path');
const cssStats = require('cssstats');

// Configuration
const CSS_FILE = process.argv[2] || 'css/styles.css';

async function analyzeCSS() {
  try {
    console.log(`Analyzing CSS file: ${CSS_FILE}`);
    
    // Read the CSS file
    const css = fs.readFileSync(CSS_FILE, 'utf8');
    console.log(`File size: ${(css.length / 1024).toFixed(2)} KB`);
    
    // Generate stats
    const stats = cssStats(css);
    
    // Display summary
    console.log('\n=== CSS ANALYSIS SUMMARY ===');
    console.log(`Selectors: ${stats.selectors.total}`);
    console.log(`Declarations: ${stats.declarations.total}`);
    console.log(`Rule sets: ${stats.rules.total}`);
    console.log(`Media Queries: ${stats.mediaQueries.total}`);
    
    // Specificity analysis
    const specificityMax = Math.max(...stats.selectors.specificity.values);
    console.log(`\n=== SPECIFICITY ===`);
    console.log(`Max specificity: ${specificityMax}`);
    console.log(`Avg specificity: ${stats.selectors.specificity.average.toFixed(2)}`);
    
    // Size analysis
    console.log(`\n=== SIZE ANALYSIS ===`);
    console.log(`Size (gzipped estimate): ${(stats.gzipSize / 1024).toFixed(2)} KB`);
    
    // Property usage
    console.log(`\n=== TOP 10 PROPERTIES ===`);
    const propertyCount = {};
    stats.declarations.properties.forEach(prop => {
      propertyCount[prop] = (propertyCount[prop] || 0) + 1;
    });
    
    Object.entries(propertyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([prop, count]) => {
        console.log(`${prop}: ${count} times`);
      });
    
    // ID selector analysis
    const idSelectors = stats.selectors.values.filter(sel => sel.includes('#'));
    console.log(`\n=== ID SELECTORS ===`);
    console.log(`Total ID selectors: ${idSelectors.length}`);
    
    // Find patterns and potential duplicates
    console.log(`\n=== POTENTIAL OPTIMIZATION AREAS ===`);
    findPatterns(css);
    
    console.log('\nAnalysis complete. For detailed refactoring, run the optimization script.');
  } catch (error) {
    console.error('Error analyzing CSS:', error);
  }
}

function findPatterns(css) {
  // Simple pattern detection for margin/padding patterns
  const marginRegex = /margin[:-]\s*([\d]+px)\s*([\d]+px)\s*([\d]+px)\s*([\d]+px)/g;
  const paddingRegex = /padding[:-]\s*([\d]+px)\s*([\d]+px)\s*([\d]+px)\s*([\d]+px)/g;
  
  const marginMatches = {};
  const paddingMatches = {};
  
  let match;
  while ((match = marginRegex.exec(css)) !== null) {
    const value = match[0];
    marginMatches[value] = (marginMatches[value] || 0) + 1;
  }
  
  while ((match = paddingRegex.exec(css)) !== null) {
    const value = match[0];
    paddingMatches[value] = (paddingMatches[value] || 0) + 1;
  }
  
  console.log('Common margin patterns:');
  Object.entries(marginMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count} times`);
    });
  
  console.log('Common padding patterns:');
  Object.entries(paddingMatches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count} times`);
    });
  
  // Check for duplicate media queries
  const mediaQueryRegex = /@media\s*\([^\)]+\)\s*\{[^\}]+\}/g;
  const mediaQueries = {};
  
  while ((match = mediaQueryRegex.exec(css)) !== null) {
    const query = match[0].split('{')[0].trim();
    mediaQueries[query] = (mediaQueries[query] || 0) + 1;
  }
  
  console.log('\nDuplicated media queries:');
  Object.entries(mediaQueries)
    .filter(([_, count]) => count > 2)
    .forEach(([query, count]) => {
      console.log(`  ${query}: ${count} times`);
    });
}

analyzeCSS();