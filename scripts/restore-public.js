const fs = require('fs');
const path = require('path');

const publicFile = path.join(__dirname, '../src/utils/envUtils.ts');
const backupFile = path.join(__dirname, '../src/utils/envUtils.public.backup');

console.log('🔧 RESTORE-PUBLIC DEBUG INFO:');
console.log('Public file path:', publicFile);
console.log('Backup file path:', backupFile);
console.log('Current working directory:', process.cwd());
console.log('🔍 Checking backup file:', backupFile);
console.log('📁 Backup file exists:', fs.existsSync(backupFile));

if (fs.existsSync(backupFile)) {
  console.log('📄 Backup file size:', fs.statSync(backupFile).size, 'bytes');
}

// 백업 파일이 있는지 확인
if (fs.existsSync(backupFile)) {
  console.log('🔄 Restoring public file...');
  
  // 백업에서 공개 파일 복원
  fs.copyFileSync(backupFile, publicFile);
  
  // 백업 파일 삭제
  fs.unlinkSync(backupFile);
  
  console.log('✅ Public file restored');
} else {
  console.log('⚠️  WARNING: No backup found. Public file may still contain private content!');
  console.log('📖 Please check src/utils/envUtils.ts manually.');
}