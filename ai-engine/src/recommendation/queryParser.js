// src/recommendation/queryParser.js
// Extracts structured attributes from raw text queries to compile precise Mongo clauses.

function parseNaturalQuery(message) {
  const normalized = message.toLowerCase();
  const mongoFilter = {};
  const extractionMeta = { extractedSize: null };

  // 1. Gender Context
  if (/\b(men|man|boy|gents)\b/i.test(normalized)) mongoFilter.gender = 'men';
  else if (/\b(women|woman|girl|ladies|female)\b/i.test(normalized)) mongoFilter.gender = 'women';

  // 2. Budget Extract (e.g., "under 5000", "under rs 5000")
  const budgetMatch = normalized.match(/under\s?(?:rs\.?\s?)?(\d+)/i);
  if (budgetMatch) {
    mongoFilter.price = { $lte: parseInt(budgetMatch[1], 10) };
  }

  // 3. Category Mapping
  if (/\b(dress|dresses|frock)\b/i.test(normalized)) mongoFilter.category = { $regex: 'dress' };
  else if (/\b(shirt|shirts|polo)\b/i.test(normalized)) mongoFilter.category = { $regex: 'shirt' };
  else if (/\b(kurta|kurtas|kurti)\b/i.test(normalized)) mongoFilter.category = { $regex: 'kurta' };

  // 4. Color Tags
  const colors = ['black', 'red', 'blue', 'white', 'grey', 'green', 'maroon'];
  const foundColors = colors.filter(color => new RegExp(`\\b${color}\\b`, 'i').test(normalized));
  if (foundColors.length > 0) {
    mongoFilter.colors = { $in: foundColors };
  }

  // 5. Explicit Tag Scopes
  const tags = ['summer', 'formal', 'casual', 'trending', 'bestselling'];
  const foundTags = tags.filter(tag => new RegExp(`\\b${tag}\\b`, 'i').test(normalized));
  
  // Implicit mapping logic (e.g. "outfit" implies trending if combined with high search)
  if (/\boutfit(s)?\b/i.test(normalized) && !foundTags.includes('trending')) {
    foundTags.push('trending');
  }
  
  if (foundTags.length > 0) {
    mongoFilter.tags = { $in: foundTags };
  }

  // 6. Size Context Check
  const sizeMatch = normalized.match(/\b(small|medium|large|xl|xxl|s|m|l)\b/i);
  if (sizeMatch) {
    let sizeKey = sizeMatch[1].toUpperCase();
    if (sizeKey === 'SMALL') sizeKey = 'S';
    if (sizeKey === 'MEDIUM') sizeKey = 'M';
    if (sizeKey === 'LARGE') sizeKey = 'L';
    extractionMeta.extractedSize = sizeKey;
  }

  // 7. Discount / Sale Filter
  if (/\b(sale|discount|discounted|off)\b/i.test(normalized)) {
    mongoFilter.$expr = { $lt: ["$price", "$originalPrice"] };
  }

  return { mongoFilter, extractionMeta };
}

module.exports = { parseNaturalQuery };