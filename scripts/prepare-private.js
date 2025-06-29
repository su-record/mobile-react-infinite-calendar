const fs = require('fs');
const path = require('path');

const privateFile = path.join(__dirname, '../src/utils/envUtils.private.ts');
const publicFile = path.join(__dirname, '../src/utils/envUtils.ts');
const backupFile = path.join(__dirname, '../src/utils/envUtils.public.backup');

console.log('🔧 PREPARE-PRIVATE DEBUG INFO:');
console.log('Private file path:', privateFile);
console.log('Public file path:', publicFile);
console.log('Backup file path:', backupFile);
console.log('Current working directory:', process.cwd());

// 프라이빗 파일이 있는지 확인
if (fs.existsSync(privateFile)) {
  console.log('🔒 Private file found. Preparing for build...');
  
  // 현재 공개 파일을 백업
  if (fs.existsSync(publicFile)) {
    fs.copyFileSync(publicFile, backupFile);
    console.log('📋 Public file backed up');
  }
  
  // 프라이빗 파일을 공개 파일 위치로 복사
  fs.copyFileSync(privateFile, publicFile);
  console.log('✅ Private file copied for build');
} else {
  console.log('📖 No private file found. Using public version.');
}