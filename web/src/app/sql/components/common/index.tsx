/**
 * SQL模块通用组件库
 */

import React, { ReactNode } from 'react';
import { STYLE_CLASSES } from '../../config/constants';

// ============ 加载组件 ============
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = '加载中...' }) => {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

// ============ 空状态组件 ============
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// ============ 错误组件 ============
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '错误',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{title}</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
        </div>
        {onRetry && (
          <div className="ml-3">
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 徽章组件 ============
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  children, 
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ============ 卡片组件 ============
interface CardProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  actions, 
  className = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      {(title || actions) && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

// ============ 按钮组件 ============
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// ============ 提示组件 ============
interface TooltipProps {
  content: string;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  placement = 'top' 
}) => {
  const [visible, setVisible] = React.useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 ${placementClasses[placement]} pointer-events-none`}>
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ 分隔线 ============
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`border-t border-gray-200 dark:border-gray-700 ${className}`} />;
};

// ============ 连接状态指示器 ============
interface ConnectionStatusIndicatorProps {
  status: 'idle' | 'testing' | 'connected' | 'disconnected';
  message?: string;
}

interface ErrorInfo {
  message: string;
  type: 'auth' | 'network' | 'database' | 'config' | 'unknown';
  hint?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  message,
}) => {
  const statusConfig = {
    idle: {
      color: 'gray',
      text: '未连接',
      className: STYLE_CLASSES.CONNECTION.IDLE,
    },
    testing: {
      color: 'yellow',
      text: '连接中...',
      className: STYLE_CLASSES.CONNECTION.TESTING,
    },
    connected: {
      color: 'green',
      text: '已连接',
      className: STYLE_CLASSES.CONNECTION.CONNECTED,
    },
    disconnected: {
      color: 'red',
      text: '连接失败',
      className: STYLE_CLASSES.CONNECTION.DISCONNECTED,
    },
  };

  const config = statusConfig[status];

  // 解析错误信息
  let errorInfo: ErrorInfo | null = null;
  let displayMessage = message || config.text;

  if (status === 'disconnected' && message) {
    try {
      errorInfo = JSON.parse(message);
      displayMessage = errorInfo.message;
    } catch {
      // 如果不是 JSON 格式，直接使用原始消息
      displayMessage = message;
    }
  }

  // 根据错误类型获取简洁的提示文字和图标
  const getSolutionHint = (errorInfo: ErrorInfo | null): { icon: string; text: string; link?: { href: string; text: string } } | null => {
    if (!errorInfo) return null;

    const hints: Record<string, { icon: string; text: string; link?: { href: string; text: string } }> = {
      auth: {
        icon: '🔑',
        text: '请刷新 AccessKey',
        link: { href: '/profile', text: '前往个人中心' }
      },
      network: {
        icon: '🌐',
        text: '请检查网络连接或稍后重试',
      },
      database: {
        icon: '💾',
        text: '请检查数据库地址、端口、用户名和密码',
      },
      config: {
        icon: '⚙️',
        text: '请检查连接配置参数',
      },
      unknown: {
        icon: '❓',
        text: '请检查连接配置或联系管理员',
      },
    };

    return hints[errorInfo.type] || null;
  };

  const solutionHint = getSolutionHint(errorInfo);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* 状态指示器 */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${config.className}`}>
        <span className={`w-2 h-2 bg-${config.color}-500 rounded-full mr-2`} />
        <span>{displayMessage}</span>
      </div>

      {/* 解决方案提示 - 横排显示 */}
      {solutionHint && (
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="opacity-60">{solutionHint.icon}</span>
          <span className="text-xs">{solutionHint.text}</span>
          {solutionHint.link && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <a
                href={solutionHint.link.href}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2"
              >
                {solutionHint.link.text}
              </a>
            </>
          )}
        </div>
      )}

      {/* 后端提供的额外提示 - 横排显示 */}
      {errorInfo?.hint && (
        <>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <span>ℹ️</span>
            <span>{errorInfo.hint}</span>
          </div>
        </>
      )}
    </div>
  );
};

// ============ 统计卡片组件 ============
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string | ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  className = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        {typeof icon === 'string' ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
    </div>
  );
};
