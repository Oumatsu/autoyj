export type AcademyTranslationFn = (key: string, fallback?: string) => unknown;

function translatedText(
  t: AcademyTranslationFn,
  key: string,
  fallback: unknown,
): string {
  const source = typeof fallback === "string" ? fallback : "";
  const translated = t(key, source);
  return typeof translated === "string" ? translated : source;
}

export function translateAcademyLesson<T extends Record<string, any>>(
  lesson: T,
  t: AcademyTranslationFn,
): T {
  const prefix = `academy.lessons.${String(lesson.slug || "")}`;
  return {
    ...lesson,
    title: translatedText(t, `${prefix}.title`, lesson.title),
    tag: translatedText(t, `${prefix}.tag`, lesson.tag),
    desc: translatedText(t, `${prefix}.description`, lesson.desc),
    ...(Object.prototype.hasOwnProperty.call(lesson, "date")
      ? { date: translatedText(t, `${prefix}.date`, lesson.date) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(lesson, "content")
      ? { content: translatedText(t, `${prefix}.content`, lesson.content) }
      : {}),
  };
}

export function getAcademyLessonDate(slug: unknown): string {
  const normalizedSlug = typeof slug === "string" ? slug : "";
  return normalizedSlug === "ev-range-explained-africa" || normalizedSlug === "ev-test-drive-guide"
    ? "2026-05-17"
    : "2026-05-16";
}

export function translateAcademyVaultItem<T extends Record<string, any>>(
  item: T,
  t: AcademyTranslationFn,
): T {
  const prefix = `academy.vault.${String(item.translationId || "")}`;
  return {
    ...item,
    title: translatedText(t, `${prefix}.title`, item.title),
    type: translatedText(t, `${prefix}.type`, item.type),
    desc: translatedText(t, `${prefix}.description`, item.desc),
  };
}
