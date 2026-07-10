const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Remove CV from export
c = c.replace("\n      [de ? 'CV'            : 'CV']:              d.cvRef ? 'Yes' : 'No',", "");

// Remove CV column header
c = c.replace("\n                <th className=\"hide-mobile\">CV</th>", "");

// Remove CV column cell
const cvCellStart = c.indexOf("                    <td className=\"hide-mobile\">\n                      {d.cvRef ? (");
const cvCellEnd = c.indexOf("</td>", cvCellStart) + 5;
if (cvCellStart > -1) c = c.slice(0, cvCellStart) + c.slice(cvCellEnd);

// Remove CV from profile modal
c = c.replace("\n                  { label: 'CV', value: profileData.cvRef ? (de ? 'Vorhanden' : 'Available') : (de ? 'Nicht vorhanden' : 'Not available'), icon: <FileCheck2 size={13} /> },", "");

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');
