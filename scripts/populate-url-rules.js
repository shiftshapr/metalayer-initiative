const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function populateUrlRules() {
  try {
    console.log('🚀 Populating URL normalization rules...');

    // YouTube rules
    const youtubeRules = [
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'youtube.com',
        pattern: '^https?://(www\\.)?youtube\\.com/watch\\?v=',
        queryKeys: ['v'],
        hashPreserve: false,
        priority: 100,
        isActive: true
      },
      {
        type: 'ALTERNATE_URL_PATTERN',
        domain: 'youtu.be',
        pattern: '^https?://youtu\\.be/',
        alternateTo: 'youtube.com',
        hashPreserve: false,
        priority: 90,
        isActive: true
      }
    ];

    // Google rules
    const googleRules = [
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'google.com',
        pattern: '^https?://(www\\.)?google\\.com/search\\?',
        queryKeys: ['q'],
        hashPreserve: false,
        priority: 80,
        isActive: true
      }
    ];

    // GitHub rules
    const githubRules = [
      {
        type: 'HASH_PRESERVE',
        domain: 'github.com',
        pattern: '^https?://(www\\.)?github\\.com/',
        hashPreserve: true,
        priority: 70,
        isActive: true
      }
    ];

    // Chrome extension rules
    const chromeRules = [
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'chrome-extension',
        pattern: '^chrome://extensions/',
        queryKeys: ['errors'],
        hashPreserve: false,
        priority: 60,
        isActive: true
      }
    ];

    const allRules = [...youtubeRules, ...googleRules, ...githubRules, ...chromeRules];

    for (const rule of allRules) {
      try {
        await prisma.urlNormalizationRule.create({
          data: rule
        });
        console.log(`✅ Created rule for ${rule.domain}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Rule for ${rule.domain} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating rule for ${rule.domain}:`, error.message);
        }
      }
    }

    console.log('🎉 URL normalization rules populated successfully!');
    
    // Show summary
    const ruleCount = await prisma.urlNormalizationRule.count();
    console.log(`📊 Total rules in database: ${ruleCount}`);

  } catch (error) {
    console.error('❌ Error populating URL rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateUrlRules();

