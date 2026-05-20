-- ============================================
-- DOOIT — DAILY PERFORMANCE DASHBOARD
-- ============================================
-- This query shows daily installs, activation rates, 
-- and how each daily group (cohort) is returning.

WITH cohort_data AS (
    -- Metrics based on the day users JOINED the app
    SELECT
        DATE(created_at) AS day,
        COUNT(*) AS installs,
        COUNT(activated_at) AS activations,
        ROUND(100.0 * COUNT(activated_at) / NULLIF(COUNT(*), 0), 1) AS activation_rate_pct,
        -- Retention for this specific cohort
        ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 1) / NULLIF(COUNT(*), 0), 1) AS d1_retention_pct,
        ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 7) / NULLIF(COUNT(*), 0), 1) AS d7_retention_pct,
        ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 30) / NULLIF(COUNT(*), 0), 1) AS d30_retention_pct
    FROM public.users
    GROUP BY 1
),
active_users_data AS (
    -- Daily Active Users based on last activity date
    SELECT
        DATE(updated_at) AS day,
        COUNT(*) AS dau
    FROM public.users
    GROUP BY 1
)

SELECT
    c.day,
    c.installs,
    c.activations,
    c.activation_rate_pct || '%' AS act_rate,
    COALESCE(a.dau, 0) AS active_users,
    c.d1_retention_pct || '%' AS d1,
    c.d7_retention_pct || '%' AS d7,
    c.d30_retention_pct || '%' AS d30
FROM cohort_data c
LEFT JOIN active_users_data a ON c.day = a.day
WHERE c.day >= CURRENT_DATE - 30
ORDER BY c.day DESC;