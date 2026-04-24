/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

-- Seed landing FAQ set and items (only if empty)
INSERT INTO public.faq_sets (slug, title_en, title_uk, title_ja, support_blurb_en, support_blurb_uk, support_blurb_ja, support_link, support_link_text_en, support_link_text_uk, support_link_text_ja)
SELECT
  'landing',
  'Frequently Asked Questions',
  'Часті запитання',
  'よくある質問',
  'Can''t find what you''re looking for? Contact our',
  'Не знайшли потрібне? Зв''яжіться з нашим',
  'お探しの情報が見つかりませんか？',
  '#',
  'customer support team',
  'службу підтримки',
  'カスタマーサポート'
WHERE NOT EXISTS (SELECT 1 FROM public.faq_sets WHERE slug = 'landing');

-- Seed FAQ items from current landing content (en messages)
INSERT INTO public.faq_items (faq_set_id, sort_order, question_en, question_uk, question_ja, answer_en, answer_uk, answer_ja, icon)
SELECT
  fs.id,
  v.ord,
  v.q_en,
  v.q_uk,
  v.q_ja,
  v.a_en,
  v.a_uk,
  v.a_ja,
  v.ico
FROM public.faq_sets fs
CROSS JOIN (VALUES
  (0, 'What are your business hours?', 'Які ваші години роботи?', '営業時間は何時ですか？',
   'Our customer service team is available Monday through Friday from 9:00 AM to 8:00 PM EST, and weekends from 10:00 AM to 6:00 PM EST. During holidays, hours may vary and will be posted on our website.',
   'Наша служба підтримки працює з понеділка по п''ятницю з 9:00 до 20:00 EST, у вихідні з 10:00 до 18:00 EST.',
   'カスタマーサポートは平日9:00〜20:00、週末10:00〜18:00（EST）です。祝日は変動することがあります。',
   'clock'),
  (1, 'How do subscription payments work?', 'Як працюють платежі за підпискою?', 'サブスクリプションの支払いはどのように機能しますか？',
   'Subscription payments are automatically charged to your default payment method on the same day each month or year, depending on your billing cycle. You can update your payment information and view billing history in your account dashboard.',
   'Платежі за підпискою автоматично списуються з вашого платіжного методу щомісяця або щороку. Інформацію можна оновити в особистому кабінеті.',
   'サブスクリプションは、請求サイクルに応じて毎月または毎年、同じ日にデフォルトの支払い方法に自動的に請求されます。アカウントダッシュボードで支払い情報を更新し、請求履歴を確認できます。',
   'credit-card'),
  (2, 'Can I expedite my shipping?', 'Чи можу я прискорити доставку?', '配送を expedite できますか？',
   'Yes, we offer several expedited shipping options at checkout. Next-day and 2-day shipping are available for most U.S. addresses if orders are placed before 2:00 PM EST.',
   'Так, ми пропонуємо кілька варіантів прискореної доставки при оформленні замовлення.',
   'はい、チェックアウト時に複数の迅速配送オプションをご用意しています。',
   'truck'),
  (3, 'Do you offer localized support?', 'Чи пропонуєте ви локалізовану підтримку?', '現地語のサポートはありますか？',
   'We offer multilingual support in English, Spanish, French, German, and Japanese. Our support team can assist customers in these languages via email, chat, and phone during standard business hours for each respective region.',
   'Ми пропонуємо багатомовну підтримку англійською, іспанською, французькою, німецькою та японською.',
   '英語、スペイン語、フランス語、ドイツ語、日本語で多言語サポートを提供しています。',
   'globe'),
  (4, 'How do I track my order?', 'Як відстежити замовлення?', '注文を追跡するには？',
   'Once your order ships, you will receive a confirmation email with a tracking number. You can use this number on our website or the carrier''s website to track your package. You can also view order status and tracking information in your account dashboard under "Order History."',
   'Після відправлення замовлення ви отримаєте email із номером відстеження. Ви можете переглянути статус замовлення в особистому кабінеті.',
   '発送後、追跡番号を含む確認メールが届きます。当社のウェブサイトまたは運送業者のウェブサイトで追跡できます。「注文履歴」で確認することもできます。',
   'package')
) AS v(ord, q_en, q_uk, q_ja, a_en, a_uk, a_ja, ico)
WHERE fs.slug = 'landing'
  AND NOT EXISTS (SELECT 1 FROM public.faq_items WHERE faq_set_id = fs.id LIMIT 1);
