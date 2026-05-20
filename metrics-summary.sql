-- ============================================
-- DOOIT — TOTAL PRODUCT METRICS SUMMARY
-- ============================================
-- One row showing the overall health of the app.
-- Benchmarks (e.g., _40) based on industry standards for productivity apps.

SELECT
    -- TOTAL VOLUME
    COUNT(*) AS installs,

    -- ACTIVE USERS (Raw counts)
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 29) AS monthly,
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 6) AS weekly,
    COUNT(*) FILTER (WHERE DATE(updated_at) = CURRENT_DATE) AS daily,

    -- STICKINESS (DAU/MAU ratio)
    -- Target: At least 20% of monthly users should use the app daily.
    ROUND(100.0 * 
        COUNT(*) FILTER (WHERE DATE(updated_at) = CURRENT_DATE) / 
        NULLIF(COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 29), 0), 
    1) AS stick_20,

    -- ACTIVATION (Onboarding success)
    -- Target: 70% or more users should complete onboarding.
    ROUND(100.0 * COUNT(activated_at) / NULLIF(COUNT(*), 0), 1) AS act_70,

    -- RETENTION (Long-term engagement)
    -- D1: Target 40%+ (First impression)
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '1 day'
          AND DATE(updated_at) >= DATE(created_at) + 1
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day'), 0), 1) AS d1_40,

    -- D7: Target 20%+ (Weekly habit)
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '7 days'
          AND DATE(updated_at) >= DATE(created_at) + 7
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '7 days'), 0), 1) AS d7_20,

    --  D30: Target 10%+ (Monthly habit/loyalty)
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '30 days'
          AND DATE(updated_at) >= DATE(created_at) + 30
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days'), 0), 1) AS d30_10

FROM public.users;