const fs = require('fs');
const path = require('path');

// Read the coverage summary
try {
  const coverageSummaryPath = path.join(__dirname, '../coverage/coverage-summary.json');
  const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
  
  // Extract coverage percentages
  const { total } = coverageSummary;
  
  const lineCoverage = total.lines.pct.toFixed(1);
  const statementCoverage = total.statements.pct.toFixed(1);
  const functionCoverage = total.functions.pct.toFixed(1);
  const branchCoverage = total.branches.pct.toFixed(1);
  
  // Generate badges
  const badges = {
    line: generateBadge('Lines', lineCoverage, getBadgeColor(lineCoverage)),
    statement: generateBadge('Statements', statementCoverage, getBadgeColor(statementCoverage)),
    function: generateBadge('Functions', functionCoverage, getBadgeColor(functionCoverage)),
    branch: generateBadge('Branches', branchCoverage, getBadgeColor(branchCoverage)),
  };
  
  // Write badges to files
  const badgesDir = path.join(__dirname, '../coverage/badges');
  if (!fs.existsSync(badgesDir)) {
    fs.mkdirSync(badgesDir, { recursive: true });
  }
  
  Object.entries(badges).forEach(([type, svg]) => {
    fs.writeFileSync(path.join(badgesDir, `${type}.svg`), svg);
  });
  
  // Update README with coverage badges
  updateReadmeWithCoverageBadges({
    line: lineCoverage,
    statement: statementCoverage,
    function: functionCoverage,
    branch: branchCoverage,
  });
  
  console.log('Coverage badges generated successfully!');
} catch (error) {
  console.error('Error generating coverage badges:', error);
  process.exit(1);
}

/**
 * Generate SVG badge
 * @param {string} label - Badge label
 * @param {string|number} value - Badge value
 * @param {string} color - Badge color
 * @returns {string} - SVG badge
 */
function generateBadge(label, value, color) {
  const labelWidth = label.length * 7 + 10;
  const valueWidth = String(value).length * 7 + 10;
  const totalWidth = labelWidth + valueWidth;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <mask id="a">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </mask>
    <g mask="url(#a)">
      <path fill="#555" d="M0 0h${labelWidth}v20H0z"/>
      <path fill="${color}" d="M${labelWidth} 0h${valueWidth}v20H${labelWidth}z"/>
      <path fill="url(#b)" d="M0 0h${totalWidth}v20H0z"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
      <text x="${labelWidth / 2}" y="14">${label}</text>
      <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}%</text>
      <text x="${labelWidth + valueWidth / 2}" y="14">${value}%</text>
    </g>
  </svg>`;
}

/**
 * Get badge color based on coverage percentage
 * @param {string|number} coverage - Coverage percentage
 * @returns {string} - Badge color
 */
function getBadgeColor(coverage) {
  const value = Number(coverage);
  if (value >= 90) return '#4c1';
  if (value >= 80) return '#97CA00';
  if (value >= 70) return '#DFB317';
  if (value >= 60) return '#FE7D37';
  return '#E05D44';
}

/**
 * Update README with coverage badges
 * @param {Object} coverage - Coverage percentages
 */
function updateReadmeWithCoverageBadges(coverage) {
  const readmePath = path.join(__dirname, '../README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.warn('README.md not found, skipping badge update');
    return;
  }
  
  let readme = fs.readFileSync(readmePath, 'utf8');
  
  // Check if coverage section exists
  const coverageSectionRegex = /## Test Coverage\s+(?:!\[.*?\]\(.*?\)\s*)+/;
  const coverageSection = `## Test Coverage

![Lines](./coverage/badges/line.svg)
![Statements](./coverage/badges/statement.svg)
![Functions](./coverage/badges/function.svg)
![Branches](./coverage/badges/branch.svg)

`;
  
  if (coverageSectionRegex.test(readme)) {
    // Update existing coverage section
    readme = readme.replace(coverageSectionRegex, coverageSection);
  } else {
    // Add coverage section after the first heading
    const firstHeadingRegex = /^# .+$/m;
    if (firstHeadingRegex.test(readme)) {
      readme = readme.replace(firstHeadingRegex, (match) => `${match}\n\n${coverageSection}`);
    } else {
      // If no heading found, add at the beginning
      readme = `${coverageSection}\n${readme}`;
    }
  }
  
  fs.writeFileSync(readmePath, readme);
}
