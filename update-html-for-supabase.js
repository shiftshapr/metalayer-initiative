#!/usr/bin/env node

const fs = require('fs');

console.log('🌐 UPDATING HTML FOR SUPABASE INTEGRATION');
console.log('==========================================');

async function updateHTMLForSupabase() {
  try {
    console.log('📋 Step 1: Reading current HTML...');
    
    const htmlPath = 'presence/sidepanel.html';
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ sidepanel.html not found');
      return false;
    }
    
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    console.log('✅ HTML file read successfully');
    
    console.log('📋 Step 2: Adding Supabase CDN scripts...');
    
    // Check if Supabase scripts are already added
    if (htmlContent.includes('supabase')) {
      console.log('⚠️ Supabase scripts already present in HTML');
      return true;
    }
    
    // Find the head section and add Supabase scripts
    const headEndPattern = /<\/head>/;
    if (!headEndPattern.test(htmlContent)) {
      console.error('❌ Could not find </head> tag in HTML');
      return false;
    }
    
    const supabaseScripts = `
    <!-- Supabase Real-time Integration -->
    <script src="https://cdn.skypack.dev/@supabase/supabase-js"></script>
    <script src="supabase-client.js"></script>
`;
    
    htmlContent = htmlContent.replace(headEndPattern, supabaseScripts + '\n  </head>');
    
    console.log('📋 Step 3: Writing updated HTML...');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('✅ HTML updated successfully');
    
    console.log('\n🎉 HTML UPDATE COMPLETE!');
    console.log('========================');
    console.log('Added Supabase CDN scripts to sidepanel.html');
    console.log('\nNext steps:');
    console.log('1. Set up your Supabase project at supabase.com');
    console.log('2. Replace YOUR_SUPABASE_URL_HERE and YOUR_SUPABASE_ANON_KEY_HERE in sidepanel.js');
    console.log('3. Test the real-time features!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error updating HTML:', error);
    return false;
  }
}

// Run the update
updateHTMLForSupabase().then(success => {
  if (success) {
    console.log('\n✅ HTML update completed successfully!');
  } else {
    console.log('\n❌ HTML update failed!');
  }
});
