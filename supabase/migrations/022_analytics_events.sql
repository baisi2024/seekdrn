-- 创建分析事件表
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  page_type VARCHAR(50),
  locale VARCHAR(10),
  metadata JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_locale ON analytics_events(locale);

-- 添加注释
COMMENT ON TABLE analytics_events IS '存储关键业务分析事件';
COMMENT ON COLUMN analytics_events.event_name IS '事件名称';
COMMENT ON COLUMN analytics_events.event_category IS '事件分类: conversion, engagement, navigation';
COMMENT ON COLUMN analytics_events.page_type IS '页面类型: product, solution, case, home';
COMMENT ON COLUMN analytics_events.locale IS '语言版本';
COMMENT ON COLUMN analytics_events.metadata IS '事件参数，灵活存储';
COMMENT ON COLUMN analytics_events.session_id IS '会话ID，用于追踪用户会话';
