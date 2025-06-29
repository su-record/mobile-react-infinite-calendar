#!/bin/bash

# 패키지 배포 스크립트
echo "🚀 패키지 배포를 시작합니다..."

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 변경사항이 있습니다. 커밋을 진행합니다..."
    git add .
    read -p "커밋 메시지를 입력하세요: " commit_message
    git commit -m "$commit_message"
else
    echo "✅ Git 상태가 깨끗합니다."
fi

# 버전 업그레이드 타입 선택
echo "📦 버전 업그레이드 타입을 선택하세요:"
echo "1) patch (버그 수정)"
echo "2) minor (새 기능 추가)"
echo "3) major (주요 변경사항)"
read -p "선택 (1/2/3): " version_type

case $version_type in
    1)
        npm version patch
        ;;
    2)
        npm version minor
        ;;
    3)
        npm version major
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

# 빌드 실행
echo "🔨 프로젝트를 빌드합니다..."
npm run prebuild


# NPM 배포
echo "📤 NPM에 배포 중..."
npm publish

if [ $? -eq 0 ]; then
    echo "🎉 배포가 성공적으로 완료되었습니다!"
    echo "📊 패키지 정보:"
    npm show su-react-infinite-calendar version
else
    echo "❌ 배포에 실패했습니다."
    echo "💡 24시간 내 재배포 제한이 있을 수 있습니다."
    exit 1
fi