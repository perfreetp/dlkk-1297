import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString: string, formatStr: string = 'yyyy-MM-dd'): string {
  try {
    return format(parseISO(dateString), formatStr, { locale: zhCN });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`;
    } else {
      return format(date, 'MM-dd', { locale: zhCN });
    }
  } catch {
    return dateString;
  }
}

export function formatPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

export const revenueTypeLabels: Record<string, string> = {
  subscription: '订阅',
  oneTime: '一次性',
  advertising: '广告'
};

export const revenueTypeColors: Record<string, string> = {
  subscription: '#1a365d',
  oneTime: '#ed8936',
  advertising: '#38a169'
};

export const channelLabels: Record<string, string> = {
  appStore: 'App Store',
  googlePlay: 'Google Play',
  website: '官网',
  direct: 'Direct'
};

export const experimentTypeLabels: Record<string, string> = {
  price: '价格实验',
  channel: '渠道实验',
  feature: '功能实验'
};

export const experimentStatusLabels: Record<string, string> = {
  pending: '待开始',
  running: '进行中',
  completed: '已完成'
};

export const reviewTypeLabels: Record<string, string> = {
  note: '经营笔记',
  outline: '复盘提纲',
  practice: '可借鉴做法'
};
