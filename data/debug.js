// Debug script to check what's happening with form submission
// Run this: node debug.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Togetai form submission...\n');

// Check 1: File structure
console.log('1. Checking file structure:');
const requiredFiles = ['server.js', 'package.json', 'public/index.html'];
const requiredDirs = ['data', 'public'];

requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ Directory exists: ${dir}`);
    } else {
        console.log(`❌ Directory missing: ${dir}`);
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`   ✓ Created: ${dir}`);
        } catch (err) {
            console.log(`   ❌ Failed to create: ${dir}`, err.message);
        }
    }
});

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ File exists: ${file}`);
    } else {
        console.log(`❌ File missing: ${file}`);
    }
});

// Check 2: Permissions
console.log('\n2. Checking permissions:');
try {
    const testFile = path.join('data', 'test.json');
    fs.writeFileSync(testFile, '{"test": true}');
    fs.unlinkSync(testFile);
    console.log('✅ Write permissions OK for data directory');
} catch (err) {
    console.log('❌ Write permission issue:', err.message);
}

// Check 3: Server.js content
console.log('\n3. Checking server.js:');
if (fs.existsSync('server.js')) {
    const serverContent = fs.readFileSync('server.js', 'utf8');
    
    if (serverContent.includes('/submit-signup')) {
        console.log('✅ Server has /submit-signup endpoint');
    } else {
        console.log('❌ Server missing /submit-signup endpoint');
    }
    
    if (serverContent.includes('cors')) {
        console.log('✅ Server imports cors');
    } else {
        console.log('❌ Server missing cors import');
    }
    
    if (serverContent.includes('body-parser')) {
        console.log('✅ Server imports body-parser');
    } else {
        console.log('❌ Server missing body-parser import');
    }
}

// Check 4: Package.json dependencies
console.log('\n4. Checking dependencies:');
if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'cors', 'body-parser'];
    
    requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            console.log(`✅ Dependency installed: ${dep}`);
        } else {
            console.log(`❌ Dependency missing: ${dep}`);
        }
    });
}

// Check 5: HTML form
console.log('\n5. Checking HTML form:');
const htmlPath = 'public/index.html';
if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    if (htmlContent.includes('id="signupForm"')) {
        console.log('✅ Form has correct ID');
    } else {
        console.log('❌ Form missing ID "signupForm"');
    }
    
    if (htmlContent.includes('/submit-signup')) {
        console.log('✅ Form submits to correct endpoint');
    } else {
        console.log('❌ Form not configured for /submit-signup');
    }
    
    if (htmlContent.includes('fetch(')) {
        console.log('✅ Form uses JavaScript fetch');
    } else {
        console.log('❌ Form missing JavaScript submission handler');
    }
}

// Check 6: Port and process
console.log('\n6. Checking running processes:');
const { execSync } = require('child_process');
try {
    const processes = execSync('ps aux | grep node', { encoding: 'utf8' });
    if (processes.includes('server.js')) {
        console.log('✅ Node server process running');
    } else {
        console.log('❌ No node server.js process found');
    }
} catch (err) {
    console.log('❓ Could not check processes:', err.message);
}

console.log('\n📋 Debug complete! If you see any ❌, those need to be fixed.');
console.log('\n🔧 Next steps:');
console.log('1. Fix any missing files/directories');
console.log('2. Restart your server: pm2 restart all (or kill and restart)');
console.log('3. Test the form on your live site');
console.log('4. Check browser console for JavaScript errors');
console.log('5. Check server logs for any errors');

// Create a test endpoint checker
console.log('\n🧪 Creating test endpoint checker...');
const testScript = `
// Test your form endpoint
// Paste this in your browser console on your live site:

fetch('/submit-signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        role: 'creator',
        name: 'Test User',
        email: 'test@example.com',
        instagram: '@testuser',
        last_campaign: 'Test campaign',
        worst_part: 'Test pain point',
        platform_help: 'yes',
        one_thing: 'Test feature'
    })
}).then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
`;

fs.writeFileSync('test-form.js', testScript);
console.log('✅ Created test-form.js - run this in browser console to test');