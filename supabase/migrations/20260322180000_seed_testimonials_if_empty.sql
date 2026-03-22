-- Ensure testimonials are seeded (in case initial seed was skipped)
INSERT INTO public.testimonials (locale, quote, author, role, sort_order)
SELECT * FROM (VALUES
  ('en'::text, 'Do not be afraid of making a mistake. But make sure you don''t make the same mistake twice.', 'Akio Morita', 'Co-founder, Sony', 0),
  ('uk', 'Не бійтеся робити помилки. Але переконайтеся, що ви не робите ту саму помилку двічі.', 'Акіо Моріта', 'Співзасновник, Sony', 0),
  ('ja', '失敗を恐れるな。同じ失敗を二度と繰り返さないようにせよ。', '盛田昭夫', '共同創業者、ソニー', 0)
) AS v(locale, quote, author, role, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);
