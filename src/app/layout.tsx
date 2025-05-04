import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '周末计划申请与审批系统',
  description: '提交和管理周末计划申请',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}