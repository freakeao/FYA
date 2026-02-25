/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));
    const rules = new Set();
    data.forEach(file => file.messages.forEach(msg => rules.add(msg.ruleId)));
    console.log(Array.from(rules));
} catch (e) {
    console.error(e.message);
}
