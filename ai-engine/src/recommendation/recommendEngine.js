// src/recommendation/recommendEngine.js
// Orchestrates parsing, db tracking, Upselling evaluation, and LangChain semantic compilation.

const { parseNaturalQuery } = require('./queryParser');
const { queryProducts } = require('../config/mongoMock');
const { chatModel } = require('../config/openai');
const { wrapAsUntrustedData } = require('../security/promptInjectionGuard');

// Premium auto-upsell threshold logic (Phase 2 Ready Structure)
function evaluateUpsell(matches, originalBudget) {
  if (!originalBudget || matches.length === 0) return null;
  
  // Find a product that is slightly above budget (max 30% higher) but has premium features/tags
  // Or if no items matched the strict budget, find the closest premium options.
  const margin = originalBudget * 1.3;
  
  // In a real DB, this would be an independent dynamic query if matches length is low
  return null; // Initialized hook for MVP structure flow
}

async function formatWithLangChain(customerMessage, products, sizeAlert) {
  const productString = products.map(p => 
    `- ${p.name}: Price Rs. ${p.price}${p.originalPrice > p.price ? ` (Was Rs. ${p.originalPrice})` : ''} | Sizes: ${p.sizes.join(', ')} | Tags: ${p.tags.join(', ')}`
  ).join('\n');

  const systemInstruction = `You are a savvy fashion assistant for FashionFlow. 
Your job is to write a highly compelling, elegant response to the customer based ONLY on the catalog matches provided.

Rules:
1. List the matched items naturally in plain text (No markdown, no bullet points using asterisks, use normal spacing or clean dashes).
2. Highlight any active discounts/sales explicitly if present.
3. ${sizeAlert ? `The customer asked for size ${sizeAlert}. Explicitly confirm if their size is available in the matching items.` : 'Mention size choices briefly.'}
4. Keep the text between 3-5 sentences. Warm, conversion-focused, optimized for instant reading on WhatsApp.`;

  const inputPayload = `Customer Context: "${wrapAsUntrustedData(customerMessage)}"\n\nMatching Products:\n${productString || 'No direct matches found in database.'}`;

  const response = await chatModel.invoke([
    { role: 'system', content: systemInstruction },
    { role: 'user', content: inputPayload }
  ]);

  return typeof response.content === 'string' ? response.content.trim() : JSON.stringify(response.content);
}

async function processRecommendation(message) {
  // 1. Break down customer text into Mongo queries
  const { mongoFilter, extractionMeta } = parseNaturalQuery(message);
  
  // 2. Fetch data from DB
  let matchedProducts = await queryProducts(mongoFilter);

  // 3. Post-fetch business logic: Size filtering confirmation
  if (extractionMeta.extractedSize) {
    // If explicit size requested, prioritize or label items matching that matrix array
    matchedProducts = matchedProducts.filter(p => p.sizes.includes(extractionMeta.extractedSize));
  }

  // 4. Auto-Upselling Logic (Phase 2 Hook)
  // If strict budget yields fewer choices, run premium upsell evaluation
  let upsellItem = null;
  if (mongoFilter.price && mongoFilter.price.$lte) {
    const budget = mongoFilter.price.$lte;
    // MVP Hook: If results under budget are limited, check for premium alternative
    if (matchedProducts.length <= 1) {
      // Look for premium tag variants matching category regardless of strict budget cap
      const upsellFilter = { ...mongoFilter };
      delete upsellFilter.price;
      upsellFilter.tags = { $in: ['trending', 'formal'] };
      
      const premiumOptions = await queryProducts(upsellFilter);
      upsellItem = premiumOptions.find(p => p.price > budget && p.price <= budget * 2.5);
    }
  }

  // Append upsell item to layout context if matching criteria are met
  const productsForAI = [...matchedProducts];
  if (upsellItem) {
    // Label it internally so LLM recognizes the premium choice item
    productsForAI.push({ ...upsellItem, name: `${upsellItem.name} [Premium Trending Choice]` });
  }

  // 5. Send to LangChain for natural language construction
  const naturalLanguageResponse = await formatWithLangChain(
    message, 
    productsForAI, 
    extractionMeta.extractedSize
  );

  return {
    raw_query: message,
    mongo_filter_generated: mongoFilter,
    results_count: matchedProducts.length,
    upsell_applied: !!upsellItem,
    ai_response: naturalLanguageResponse
  };
}

module.exports = { processRecommendation };