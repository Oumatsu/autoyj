export type AcademyTranslationFn = (key: string, fallback?: string) => unknown;

function requireTranslation(
  t: AcademyTranslationFn,
  key: string,
): string {
  const translated = t(key);
  if (typeof translated !== "string" || !translated || translated === key) {
    throw new Error(`[Strict i18n Error] Missing required translation key in dictionary: "${key}"`);
  }
  return translated;
}

export function translateAcademyLesson<T extends Record<string, any>>(
  lesson: T,
  t: AcademyTranslationFn,
): T {
  const prefix = `academy.lessons.${String(lesson.slug || "")}`;
  return {
    ...lesson,
    title: requireTranslation(t, `${prefix}.title`),
    tag: requireTranslation(t, `${prefix}.tag`),
    desc: requireTranslation(t, `${prefix}.description`),
    ...(Object.prototype.hasOwnProperty.call(lesson, "date")
      ? { date: requireTranslation(t, `${prefix}.date`) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(lesson, "content")
      ? { content: requireTranslation(t, `${prefix}.content`) }
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
    title: requireTranslation(t, `${prefix}.title`),
    type: requireTranslation(t, `${prefix}.type`),
    desc: requireTranslation(t, `${prefix}.description`),
  };
}
