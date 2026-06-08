-- seed/execute_seed.sql
-- 执行所有种子数据的主文件
-- 按顺序执行以确保外键约束正确

\echo 'Starting database seed...'

-- 1. 首先执行静态内容（标签、FAQ等）
\echo 'Seeding static content...'
\i mock_static_content.sql

-- 2. 然后执行产品数据
\echo 'Seeding products...'
\i mock_products.sql

-- 3. 最后执行案例研究数据
\echo 'Seeding case studies...'
\i mock_case_studies.sql

\echo 'Database seed completed successfully!'

-- 验证数据
\echo 'Verifying data...'
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Case Studies', COUNT(*) FROM case_studies
UNION ALL
SELECT 'Product Tags', COUNT(*) FROM product_tags
UNION ALL
SELECT 'Solutions', COUNT(*) FROM solutions
UNION ALL
SELECT 'FAQs', COUNT(*) FROM faqs
ORDER BY table_name;
