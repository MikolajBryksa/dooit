-- ============================================
-- DOOIT — METRICS QUERIES
-- ============================================
-- Plik zawiera gotowe zapytania SQL do sprawdzania metryk produktowych.
-- Kopiujesz wybrany blok, wklejasz w Supabase SQL Editor, klikasz Run.
--
-- Semantyka kolumn w public.users (wypełniane przez aplikację):
--   created_at   — instalacja (pierwszy start apki, INSERT przez trackAppOpen)
--   activated_at — koniec onboardingu (set raz przez markActivated)
--   updated_at   — ostatnia aktywność (touchowane raz dziennie przez trackAppOpen)


-- ============================================
-- 0. PODSUMOWANIE — wszystkie najważniejsze liczby w jednym wierszu
-- ============================================
-- Co pokazuje: jednorazowy snapshot wszystkich headline metrics.
-- Najszybszy sposób żeby zobaczyć "gdzie jesteśmy".
SELECT
    COUNT(*) AS total_installs,
    COUNT(activated_at) AS total_activations,
    ROUND(100.0 * COUNT(activated_at) / NULLIF(COUNT(*), 0), 1) AS activation_rate_pct,
    COUNT(*) FILTER (WHERE DATE(updated_at) = CURRENT_DATE) AS dau,
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 6) AS wau,
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 29) AS mau
FROM public.users;


-- ============================================
-- 1. LICZBA INSTALACJI
-- ============================================

-- 1a) Łączna liczba instalacji od początku
-- Wynik: 1 wiersz, np. total_installs = 1247
SELECT COUNT(*) AS total_installs FROM public.users;

-- 1b) Instalacje dziennie (ostatnie 30 dni)
-- Wynik: wiersz na każdy dzień z instalacjami, np.
--   day        | installs
--   2026-05-20 | 12
--   2026-05-19 | 8
SELECT
    DATE(created_at) AS day,
    COUNT(*) AS installs
FROM public.users
WHERE created_at >= CURRENT_DATE - 30
GROUP BY 1
ORDER BY 1 DESC;


-- ============================================
-- 2. ACTIVATION RATE
-- ============================================

-- 2a) Globalny activation rate
-- Wynik: 1 wiersz, np.
--   installs | activations | activation_rate_pct
--   1247     | 892         | 71.5
-- Interpretacja: 71.5% userów którzy zainstalowali, dokończyło onboarding.
SELECT
    COUNT(*) AS installs,
    COUNT(activated_at) AS activations,
    ROUND(100.0 * COUNT(activated_at) / NULLIF(COUNT(*), 0), 1) AS activation_rate_pct
FROM public.users;

-- 2b) Activation rate per dzień instalacji (ostatnie 30 dni)
-- Wynik: dla każdego dnia ile osób się zainstalowało i ile z nich
-- dokończyło onboarding. Pomocne do śledzenia czy nowa wersja apki
-- nie zepsuła onboardingu.
SELECT
    DATE(created_at) AS install_day,
    COUNT(*) AS installs,
    COUNT(activated_at) AS activations,
    ROUND(100.0 * COUNT(activated_at) / NULLIF(COUNT(*), 0), 1) AS activation_rate_pct
FROM public.users
WHERE created_at >= CURRENT_DATE - 30
GROUP BY 1
ORDER BY 1 DESC;


-- ============================================
-- 3. RETENCJA D1 / D7 / D30 — wartości globalne
-- ============================================
-- Co pokazuje: jaki % wszystkich userów (z wystarczająco starych kohort)
-- wrócił do apki po >=1, >=7, >=30 dniach od instalacji.
-- Wynik: 1 wiersz z trzema procentami.
--
-- Uwaga: bierzemy tylko userów dla których minęło wystarczająco dużo czasu
-- żeby retencja była mierzalna (np. D30 liczy tylko userów zainstalowanych
-- >= 30 dni temu — inaczej procent byłby zaniżony).
SELECT
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '1 day'
          AND DATE(updated_at) >= DATE(created_at) + 1
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day'), 0), 1) AS d1_retention_pct,
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '7 days'
          AND DATE(updated_at) >= DATE(created_at) + 7
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '7 days'), 0), 1) AS d7_retention_pct,
    ROUND(100.0 * COUNT(*) FILTER (
        WHERE created_at < NOW() - INTERVAL '30 days'
          AND DATE(updated_at) >= DATE(created_at) + 30
    ) / NULLIF(COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '30 days'), 0), 1) AS d30_retention_pct
FROM public.users;


-- ============================================
-- 4. RETENCJA PER KOHORTA (dzień instalacji)
-- ============================================
-- Co pokazuje: dla każdego dnia instalacji — ile osób było w tej kohorcie
-- i jaki % wrócił po 1/7/30 dniach. Pozwala zobaczyć trendy:
-- czy nowi userzy są coraz bardziej zaangażowani, czy odwrotnie.
--
-- Filtr cohort_size >= 5 odsiewa małe kohorty (procenty z 1-2 userów
-- są niemiarodajne).
SELECT
    DATE(created_at) AS cohort_day,
    COUNT(*) AS cohort_size,
    ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 1)
        / NULLIF(COUNT(*), 0), 1) AS d1_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 7)
        / NULLIF(COUNT(*), 0), 1) AS d7_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE DATE(updated_at) >= DATE(created_at) + 30)
        / NULLIF(COUNT(*), 0), 1) AS d30_pct
FROM public.users
WHERE created_at < NOW() - INTERVAL '1 day'
GROUP BY 1
HAVING COUNT(*) >= 5
ORDER BY 1 DESC;


-- ============================================
-- 5. DAU / WAU / MAU
-- ============================================

-- 5a) Snapshot DAU / WAU / MAU (stan na teraz)
-- Wynik: 1 wiersz, np.
--   dau | wau | mau
--   42  | 180 | 520
-- Interpretacja:
--   DAU = userzy aktywni dziś
--   WAU = userzy aktywni w ostatnich 7 dniach (włącznie z dziś)
--   MAU = userzy aktywni w ostatnich 30 dniach
--   Stickiness = DAU/MAU (np. 42/520 = 8%) — ile % miesięcznych userów
--                wraca codziennie. Powyżej 20% to silnie nawykowa apka.
SELECT
    COUNT(*) FILTER (WHERE DATE(updated_at) = CURRENT_DATE) AS dau,
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 6) AS wau,
    COUNT(*) FILTER (WHERE DATE(updated_at) >= CURRENT_DATE - 29) AS mau
FROM public.users;

-- 5b) DAU dziennie (ostatnie 30 dni) — trend
-- Wynik: dla każdego z ostatnich 30 dni — ile userów było aktywnych tego dnia.
-- Uwaga: pokazuje TYLKO userów których ostatnia aktywność = ten dzień.
-- Czyli jest to "last seen on day X", nie "was active on day X".
-- Dla apki nawykowej gdzie user wchodzi raz dziennie — to dobra aproksymacja.
SELECT
    DATE(updated_at) AS day,
    COUNT(*) AS dau
FROM public.users
WHERE updated_at >= CURRENT_DATE - 30
GROUP BY 1
ORDER BY 1 DESC;
