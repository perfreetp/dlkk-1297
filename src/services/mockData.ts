import { Revenue, Experiment, Review, Group, User } from '../types';

export const mockUser: User = {
  id: 'user-001',
  name: '张小明',
  email: 'xiaoming@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
  groups: ['group-001', 'group-002']
};

export const mockGroups: Group[] = [
  {
    id: 'group-001',
    name: 'SaaS创业者联盟',
    description: '专注SaaS产品运营与变现的独立开发者社区',
    avatar: '🔵',
    members: [
      { id: 'user-001', name: '张小明', email: 'xiaoming@example.com', role: 'admin' },
      { id: 'user-002', name: '李华', email: 'lihua@example.com', role: 'member' },
      { id: 'user-003', name: '王芳', email: 'wangfang@example.com', role: 'member' },
      { id: 'user-004', name: '赵强', email: 'zhaoqiang@example.com', role: 'member' },
      { id: 'user-005', name: '陈静', email: 'chenjing@example.com', role: 'member' }
    ],
    nextReviewDate: '2024-01-15',
    createdBy: 'user-001',
    createdAt: '2023-12-01T00:00:00Z'
  },
  {
    id: 'group-002',
    name: '独立开发者的日常',
    description: '记录独立开发路上的点点滴滴',
    avatar: '🟢',
    members: [
      { id: 'user-001', name: '张小明', email: 'xiaoming@example.com', role: 'admin' },
      { id: 'user-006', name: '刘伟', email: 'liuwei@example.com', role: 'member' },
      { id: 'user-007', name: '周琳', email: 'zhoulin@example.com', role: 'member' }
    ],
    nextReviewDate: '2024-01-20',
    createdBy: 'user-001',
    createdAt: '2023-11-15T00:00:00Z'
  }
];

export const mockExperiments: Experiment[] = [
  {
    id: 'exp-001',
    name: '年订阅价格调整实验',
    description: '测试从¥199提高到¥299对转化率的影响',
    type: 'price',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    targetMetric: '月收入增长率',
    targetValue: 20,
    actualValue: 35,
    hypothesis: '适度提价会提升用户对产品价值的感知',
    conclusion: '提价后转化率下降5%，但客单价提升使总收入增长35%',
    groupId: 'group-001',
    createdBy: 'user-001',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'exp-002',
    name: '小红书渠道测试',
    description: '测试小红书笔记引流效果',
    type: 'channel',
    status: 'running',
    startDate: '2024-01-10',
    targetMetric: '新增用户数',
    targetValue: 50,
    actualValue: 32,
    hypothesis: '小红书高质量内容能带来精准用户',
    groupId: 'group-001',
    createdBy: 'user-002',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'exp-003',
    name: '免费试用功能',
    description: '新增7天免费试用功能',
    type: 'feature',
    status: 'running',
    startDate: '2024-01-08',
    targetMetric: '付费转化率',
    targetValue: 15,
    actualValue: 12,
    hypothesis: '免费试用能降低用户决策门槛',
    groupId: 'group-001',
    createdBy: 'user-001',
    createdAt: '2024-01-08T00:00:00Z'
  },
  {
    id: 'exp-004',
    name: '春节促销活动',
    description: '春节期间限时8折优惠',
    type: 'price',
    status: 'pending',
    startDate: '2024-02-01',
    endDate: '2024-02-10',
    targetMetric: '订单量',
    targetValue: 100,
    hypothesis: '节日促销能显著提升销量',
    groupId: 'group-001',
    createdBy: 'user-003',
    createdAt: '2024-01-12T00:00:00Z'
  },
  {
    id: 'exp-005',
    name: 'B站广告投放',
    description: '在B站科技区投放展示广告',
    type: 'channel',
    status: 'completed',
    startDate: '2023-12-15',
    endDate: '2023-12-31',
    targetMetric: 'CPA',
    targetValue: 15,
    actualValue: 18,
    hypothesis: 'B站技术用户是我们的目标群体',
    conclusion: 'CPA略高于预期，但用户留存率较好',
    groupId: 'group-001',
    createdBy: 'user-001',
    createdAt: '2023-12-15T00:00:00Z'
  }
];

export const mockRevenues: Revenue[] = [
  {
    id: 'rev-001',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-15',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    experimentId: 'exp-001',
    note: '年订阅续费',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'rev-002',
    amount: 199,
    currency: 'CNY',
    date: '2024-01-15',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    experimentId: 'exp-001',
    createdAt: '2024-01-15T09:20:00Z'
  },
  {
    id: 'rev-003',
    amount: 99,
    currency: 'CNY',
    date: '2024-01-14',
    product: '设计素材库',
    productTag: 'design',
    type: 'oneTime',
    channel: 'website',
    createdAt: '2024-01-14T15:40:00Z'
  },
  {
    id: 'rev-004',
    amount: 56,
    currency: 'CNY',
    date: '2024-01-14',
    product: '广告收入',
    productTag: 'ad',
    type: 'advertising',
    channel: 'googlePlay',
    createdAt: '2024-01-14T00:00:00Z'
  },
  {
    id: 'rev-005',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-13',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'direct',
    createdAt: '2024-01-13T11:25:00Z'
  },
  {
    id: 'rev-006',
    amount: 199,
    currency: 'CNY',
    date: '2024-01-12',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    createdAt: '2024-01-12T08:15:00Z'
  },
  {
    id: 'rev-007',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-11',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    experimentId: 'exp-001',
    createdAt: '2024-01-11T14:50:00Z'
  },
  {
    id: 'rev-008',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-10',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'direct',
    createdAt: '2024-01-10T16:30:00Z'
  },
  {
    id: 'rev-009',
    amount: 45,
    currency: 'CNY',
    date: '2024-01-10',
    product: '广告收入',
    productTag: 'ad',
    type: 'advertising',
    channel: 'googlePlay',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: 'rev-010',
    amount: 199,
    currency: 'CNY',
    date: '2024-01-09',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'website',
    createdAt: '2024-01-09T13:20:00Z'
  },
  {
    id: 'rev-011',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-08',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    createdAt: '2024-01-08T10:15:00Z'
  },
  {
    id: 'rev-012',
    amount: 99,
    currency: 'CNY',
    date: '2024-01-08',
    product: '设计素材库',
    productTag: 'design',
    type: 'oneTime',
    channel: 'website',
    createdAt: '2024-01-08T15:45:00Z'
  },
  {
    id: 'rev-013',
    amount: 199,
    currency: 'CNY',
    date: '2024-01-07',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'appStore',
    createdAt: '2024-01-07T09:30:00Z'
  },
  {
    id: 'rev-014',
    amount: 299,
    currency: 'CNY',
    date: '2024-01-06',
    product: 'Pro工具箱',
    productTag: 'tool',
    type: 'subscription',
    channel: 'direct',
    createdAt: '2024-01-06T14:20:00Z'
  },
  {
    id: 'rev-015',
    amount: 58,
    currency: 'CNY',
    date: '2024-01-06',
    product: '广告收入',
    productTag: 'ad',
    type: 'advertising',
    channel: 'googlePlay',
    createdAt: '2024-01-06T00:00:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'review-001',
    title: '2024年1月产品复盘',
    content: '# 复盘总结\n\n## 关键数据\n- 月收入：¥45,280（环比+23.5%）\n- 新增用户：156人\n- 付费率：8.2%\n\n## 实验回顾\n### 年订阅提价实验\n- 目标：收入增长20%\n- 结果：增长35%，超额完成\n- 关键发现：价格敏感用户流失，但高价值用户留存率高\n\n## 下月计划\n1. 测试季订阅选项\n2. 优化新用户引导流程\n3. 拓展小红书渠道',
    type: 'outline',
    tags: ['月度复盘', '数据分析', '策略优化'],
    visibility: 'group',
    groupId: 'group-001',
    authorId: 'user-001',
    authorName: '张小明',
    experimentId: 'exp-001',
    likes: 12,
    views: 45,
    comments: [
      {
        id: 'comment-001',
        authorId: 'user-002',
        authorName: '李华',
        content: '提价策略分析得很透彻！请问如何平衡价格与用户流失的关系？',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ],
    isBookmarked: false,
    isPendingValidation: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'review-002',
    title: '订阅转化提升的10个技巧',
    content: '# 订阅转化提升技巧\n\n作为独立开发者，我总结了以下提升订阅转化率的经验：\n\n## 1. 清晰的定价页面\n用户应该在30秒内理解你的产品价值\n\n## 2. 免费试用\n7天免费试用能显著降低决策门槛\n\n## 3. 社会证明\n展示用户评价和案例研究\n\n## 4. 风险逆转\n提供30天退款保证\n\n## 5. 渐进式付费墙\n先展示价值，再引导付费\n\n## 6. 限时优惠\n创造紧迫感\n\n## 7. 对比表格\n帮助用户做出选择\n\n## 8. 清晰的CTA\n使用行动导向的语言\n\n## 9. 客户支持\n快速响应能提升信任\n\n## 10. 持续价值传递\n定期更新功能，保持用户活跃',
    type: 'practice',
    tags: ['转化优化', '订阅策略', '最佳实践'],
    visibility: 'group',
    groupId: 'group-001',
    authorId: 'user-002',
    authorName: '李华',
    likes: 28,
    views: 89,
    comments: [
      {
        id: 'comment-002',
        authorId: 'user-001',
        authorName: '张小明',
        content: '非常实用的总结！特别是第5条渐进式付费墙，我们也在用',
        createdAt: '2024-01-14T15:30:00Z'
      },
      {
        id: 'comment-003',
        authorId: 'user-003',
        authorName: '王芳',
        content: '能不能详细说说限时优惠的具体操作方式？',
        createdAt: '2024-01-14T16:00:00Z'
      }
    ],
    isBookmarked: true,
    isPendingValidation: false,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'review-003',
    title: '小红书引流心得',
    content: '## 小红书引流经验分享\n\n### 为什么选择小红书\n- 用户群体以一二线城市年轻人为主\n- 内容形式以图文为主，适合工具类产品\n- 算法推荐机制对新创作者友好\n\n### 内容策略\n1. **选题**：围绕工具使用场景，如"提高效率的10个技巧"\n2. **标题**：使用数字和痛点，如"用了这个工具每天多睡1小时"\n3. **配图**：简洁清晰，突出产品界面\n4. **标签**：选择#效率工具 #职场好物 等热门标签\n\n### 数据表现\n- 发布10篇笔记\n- 总曝光：12,000+\n- 新增用户：32人\n- 获客成本：约¥3/人\n\n### 注意事项\n- 不能直接发广告，需要软植入\n- 保持内容质量，避免过度营销\n- 定期分析数据，调整内容方向',
    type: 'note',
    tags: ['渠道运营', '小红书', '引流增长'],
    visibility: 'group',
    groupId: 'group-001',
    authorId: 'user-001',
    authorName: '张小明',
    experimentId: 'exp-002',
    likes: 18,
    views: 67,
    comments: [],
    isBookmarked: true,
    isPendingValidation: false,
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z'
  },
  {
    id: 'review-004',
    title: '测试季订阅定价的可能性',
    content: '## 季订阅定价假设\n\n### 背景\n目前只提供月订阅和年订阅，考虑增加季订阅选项\n\n### 假设\n- 季订阅定价：¥79（相当于月付¥26）\n- 预期：\n  - 为价格敏感用户提供中间选项\n  - 提升整体付费率\n  - 季付用户可能在到期后续订年订阅\n\n### 待验证指标\n- 付费转化率提升5%\n- 季订阅占总订阅比例15%\n- 季订阅用户年订阅转化率20%\n\n### 验证方式\n在1-2月进行A/B测试\n\n### 风险\n- 可能影响年订阅销量\n- 定价需要仔细计算成本',
    type: 'practice',
    tags: ['定价策略', '待验证'],
    visibility: 'group',
    groupId: 'group-001',
    authorId: 'user-001',
    authorName: '张小明',
    likes: 5,
    views: 23,
    comments: [],
    isBookmarked: false,
    isPendingValidation: true,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: 'review-005',
    title: 'B站广告投放复盘',
    content: '# B站广告投放复盘\n\n## 投放概况\n- 时间：2023年12月15日-31日\n- 预算：¥5,000\n- 形式：科技区展示广告\n\n## 数据结果\n- 总曝光：125,000\n- 点击率：2.3%（略低于预期的3%）\n- 点击量：2,875\n- 新增注册：278人\n- CPA：¥18（目标¥15）\n\n## 用户质量分析\n- 7日留存率：45%（高于平均水平38%）\n- 14日付费转化：6.5%（符合预期）\n\n## 结论\n虽然CPA略高于预期，但用户质量较好，长期价值可观。建议继续投放并优化素材。',
    type: 'outline',
    tags: ['广告投放', '渠道复盘', 'B站'],
    visibility: 'group',
    groupId: 'group-001',
    authorId: 'user-001',
    authorName: '张小明',
    experimentId: 'exp-005',
    likes: 15,
    views: 52,
    comments: [
      {
        id: 'comment-004',
        authorId: 'user-004',
        authorName: '赵强',
        content: '用户留存数据很漂亮！请问广告素材是怎么设计的？',
        createdAt: '2024-01-11T09:00:00Z'
      }
    ],
    isBookmarked: false,
    isPendingValidation: false,
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z'
  }
];
