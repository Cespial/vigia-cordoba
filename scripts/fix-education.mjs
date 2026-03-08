import fs from 'fs';
const e = JSON.parse(fs.readFileSync('./src/data/education-institutions.json', 'utf8'));
const byMuni = {};
e.institutions.forEach(inst => {
  const m = inst.municipality;
  if (!byMuni[m]) byMuni[m] = { count: 0, rural: 0, urban: 0, totalStudents: 0 };
  byMuni[m].count++;
  byMuni[m].totalStudents += inst.enrollment || 0;
  if (inst.zone === 'rural') byMuni[m].rural++;
  else byMuni[m].urban++;
});
const result = Object.entries(byMuni).map(([municipality, data]) => ({
  municipality, ...data
})).sort((a, b) => b.count - a.count);
fs.writeFileSync('./src/data/education-institutions.json', JSON.stringify(result));
console.log('Saved', result.length, 'municipalities');
result.slice(0, 5).forEach(r => console.log(' -', r.municipality, ':', r.count, 'institutions'));
