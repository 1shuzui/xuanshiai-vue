/**
 * 批量替换 Mock 数据中的图片路径
 * 将本地路径替换为在线占位图
 */

const fs = require('fs');
const path = require('path');

// 要处理的文件
const files = [
  'mock/message.uts',
  'mock/community.uts',
  'mock/matchmaker.uts'
];

// 替换规则
const replacements = [
  // 消息页头像
  [/\/static\/avatars\/user10([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=10$1'],
  [/\/static\/avatars\/me\.jpg/g, 'https://i.pravatar.cc/300?img=99'],
  [/\/static\/avatars\/user20([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=20$1'],

  // 社区页头像和图片
  [/\/static\/avatars\/user30([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=30$1'],
  [/\/static\/dynamics\/photo([0-9])-([0-9])\.jpg/g, 'https://picsum.photos/400/300?random=$1$2'],
  [/\/static\/topics\/topic([0-9])\.jpg/g, 'https://picsum.photos/600/400?random=topic$1'],
  [/\/static\/activities\/activity([0-9])\.jpg/g, 'https://picsum.photos/800/500?random=act$1'],
  [/\/static\/organizers\/org([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=4$1'],

  // 牵线页头像
  [/\/static\/matchmakers\/mm([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=2$1'],
  [/\/static\/users\/user50([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=5$1'],
  [/\/static\/avatars\/user60([0-9])\.jpg/g, 'https://i.pravatar.cc/300?img=6$1']
];

console.log('开始替换图片路径...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changeCount = 0;

  replacements.forEach(([pattern, replacement]) => {
    const matches = content.match(pattern);
    if (matches) {
      changeCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file} - 替换了 ${changeCount} 处图片路径`);
  } else {
    console.log(`⚪ ${file} - 无需替换`);
  }
});

console.log('\n替换完成！');
console.log('\n📝 使用的在线图片服务：');
console.log('   - https://i.pravatar.cc - 头像占位图');
console.log('   - https://picsum.photos - 照片占位图');
console.log('\n💡 提示：这些是临时占位图，生产环境需要替换为真实图片。');
