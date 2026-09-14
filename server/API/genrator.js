import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash("SangamKendre13", 12);

console.log("HASH:", hash);
const match = await bcrypt.compare(
    'SangamKendre13',
    hash
);

console.log(match);