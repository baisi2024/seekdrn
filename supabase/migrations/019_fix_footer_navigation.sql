-- 019_fix_footer_navigation.sql
-- 修复页脚导航中的404链接

-- 删除不存在的解决方案链接
DELETE FROM navigation
WHERE position = 'footer'
AND url IN ('/solutions/border-security', '/solutions/infrastructure-inspection');

-- 添加实际存在的解决方案链接
-- 获取 solutions 列的 ID
DO $$
DECLARE
  solutions_col_id UUID;
BEGIN
  SELECT id INTO solutions_col_id
  FROM navigation
  WHERE position = 'footer'
  AND url = '#'
  AND order_index = 2
  LIMIT 1;

  IF solutions_col_id IS NOT NULL THEN
    -- 添加 energy 解决方案
    INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
    VALUES (
      'footer',
      solutions_col_id,
      1,
      'internal',
      '/solutions/energy',
      '{
        "en": "Energy",
        "zh": "能源"
      }'::jsonb,
      true
    )
    ON CONFLICT DO NOTHING;

    -- 添加 surveying 解决方案
    INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
    VALUES (
      'footer',
      solutions_col_id,
      2,
      'internal',
      '/solutions/surveying',
      '{
        "en": "Surveying",
        "zh": "测绘"
      }'::jsonb,
      true
    )
    ON CONFLICT DO NOTHING;

    -- 更新 public-safety 的顺序
    UPDATE navigation
    SET order_index = 3
    WHERE position = 'footer'
    AND parent_id = solutions_col_id
    AND url = '/solutions/public-safety';

    -- 添加 counter-uas 解决方案
    INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
    VALUES (
      'footer',
      solutions_col_id,
      4,
      'internal',
      '/solutions/counter-uas',
      '{
        "en": "Counter-UAS",
        "zh": "反无人机"
      }'::jsonb,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
