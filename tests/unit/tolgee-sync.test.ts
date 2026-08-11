import { describe, expect, test } from "bun:test";
import {
  compareKeySets,
  flattenToDot,
  parseArgs,
  renderTranslationModule,
  runPull,
  type PullFileSystem,
} from "../../scripts/tolgee/sync";

const exportFixtures = {
  zh: {
    nav: { home: "首页" },
    home: { steps: { "0": { title: "第一步" } }, title: "" },
    greeting: "你好，{name}",
  },
  en: {
    nav: { home: "Home" },
    home: { steps: { "0": { title: "First step" } }, title: "" },
    greeting: "Hello, {name}",
  },
  am: {
    nav: { home: "መነሻ" },
    home: { steps: { "0": { title: "የመጀመሪያ ደረጃ" } }, title: "" },
    greeting: "ሰላም፣ {name}",
  },
} as const;

class MemoryFileSystem implements PullFileSystem {
  readonly files = new Map<string, string>();
  renameCount = 0;
  failRenameAt: number | undefined;

  async writeFile(filePath: string, contents: string): Promise<void> {
    this.files.set(filePath, contents);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    this.renameCount += 1;
    if (this.renameCount === this.failRenameAt) {
      throw new Error(`rename failed for ${oldPath}`);
    }

    const contents = this.files.get(oldPath);
    if (contents === undefined) {
      throw new Error(`missing file ${oldPath}`);
    }
    this.files.delete(oldPath);
    this.files.set(newPath, contents);
  }

  async unlink(filePath: string): Promise<void> {
    if (!this.files.delete(filePath)) {
      const error = new Error(`missing file ${filePath}`) as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    }
  }
}

function createFetchMock(
  bodyByLocale: Record<string, string>,
  requests: URL[] = []
): typeof fetch {
  return async (input, init) => {
    const url = new URL(String(input));
    requests.push(url);
    const locale = url.searchParams.get("languages") || "unknown";
    const apiKey = (init?.headers as Record<string, string> | undefined)?.["X-API-Key"];
    if (apiKey !== "test-key") {
      return new Response("unauthorized", { status: 401 });
    }
    return new Response(bodyByLocale[locale] || "{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

const currentKeys = new Set(["nav.home", "home.steps.0.title", "home.title", "greeting"]);

describe("Tolgee sync helpers", () => {
  test("flattens nested exports using dot notation", () => {
    expect(flattenToDot(exportFixtures.zh)).toEqual({
      "nav.home": "首页",
      "home.steps.0.title": "第一步",
      "home.title": "",
      greeting: "你好，{name}",
    });
  });

  test("renders formatted JSON translation file content", () => {
    expect(renderTranslationModule("zh", exportFixtures.zh)).toBe(
      JSON.stringify(exportFixtures.zh, null, 2) + "\n"
    );
  });

  test("parses pull and key-removal arguments", () => {
    expect(parseArgs(["pull", "--allow-key-removal"])).toEqual({
      action: "pull",
      allowKeyRemoval: true,
      force: false,
    });
    expect(parseArgs(["pull", "--force"])).toEqual({
      action: "pull",
      allowKeyRemoval: false,
      force: true,
    });
    expect(() => parseArgs(["pull", "--unknown"])).toThrow("Unknown Tolgee sync option");
  });

  test("allows explicit empty composition strings", () => {
    const flat = {
      zh: flattenToDot(exportFixtures.zh),
      en: flattenToDot(exportFixtures.en),
      am: flattenToDot(exportFixtures.am),
    };
    expect(() => compareKeySets(flat, currentKeys, false)).not.toThrow();
  });

  test("rejects locale key mismatches", () => {
    const flat = {
      zh: flattenToDot(exportFixtures.zh),
      en: flattenToDot({ nav: { home: "Home" } }),
      am: flattenToDot(exportFixtures.am),
    };
    expect(() => compareKeySets(flat, currentKeys, false)).toThrow(
      "Tolgee locale key mismatch"
    );
  });

  test("rejects removed keys unless explicitly allowed", () => {
    const flat = {
      zh: flattenToDot({ nav: { home: "首页" } }),
      en: flattenToDot({ nav: { home: "Home" } }),
      am: flattenToDot({ nav: { home: "መነሻ" } }),
    };
    expect(() => compareKeySets(flat, currentKeys, false)).toThrow(
      "would remove 3 existing key(s)"
    );
    expect(() => compareKeySets(flat, currentKeys, true)).not.toThrow();
  });
});

describe("Tolgee pull", () => {
  test("exports all locales and atomically replaces the three bundles", async () => {
    const requests: URL[] = [];
    const fileSystem = new MemoryFileSystem();
    const cwd = "/virtual/project";
    const paths = [
      `${cwd}/i18n/translations/zh.json`,
      `${cwd}/i18n/translations/en.json`,
      `${cwd}/i18n/translations/am.json`,
    ];
    paths.forEach((filePath) => fileSystem.files.set(filePath, "old bundle"));

    const result = await runPull({
      apiUrl: "http://localhost:8085",
      apiKey: "test-key",
      projectId: 42,
      cwd,
      currentKeys,
      fetchImpl: createFetchMock(
        Object.fromEntries(
          Object.entries(exportFixtures).map(([locale, value]) => [
            locale,
            JSON.stringify(value),
          ])
        ),
        requests
      ),
      getDirtyFiles: () => [],
      fileSystem,
    });

    expect(result).toEqual({
      changedFiles: [
        "i18n/translations/zh.json",
        "i18n/translations/en.json",
        "i18n/translations/am.json",
      ],
      keyCount: 4,
    });
    expect(requests.map((url) => url.pathname)).toEqual([
      "/v2/projects/42/export",
      "/v2/projects/42/export",
      "/v2/projects/42/export",
    ]);
    expect(requests.map((url) => url.searchParams.get("languages"))).toEqual([
      "zh",
      "en",
      "am",
    ]);
    expect(requests.every((url) => url.searchParams.get("zip") === "false")).toBe(true);
    expect(fileSystem.files.get(paths[0])).toContain('"nav"');
    expect(fileSystem.files.get(paths[1])).toContain('"nav"');
    expect(fileSystem.files.get(paths[2])).toContain('"nav"');
    expect([...fileSystem.files.keys()].filter((filePath) => filePath.includes(".backup-"))).toEqual(
      []
    );
  });

  test("rejects missing credentials before making a request", async () => {
    await expect(
      runPull({
        apiKey: "",
        projectId: 42,
        fetchImpl: createFetchMock({}),
        getDirtyFiles: () => [],
      })
    ).rejects.toThrow("TOLGEE_API_KEY");

    await expect(
      runPull({
        apiKey: "test-key",
        projectId: 0,
        fetchImpl: createFetchMock({}),
        getDirtyFiles: () => [],
      })
    ).rejects.toThrow("TOLGEE_PROJECT_ID");
  });

  test("rejects a dirty translation file before exporting", async () => {
    let requestCount = 0;
    const fetchImpl: typeof fetch = async () => {
      requestCount += 1;
      return new Response("{}");
    };

    await expect(
      runPull({
        apiKey: "test-key",
        projectId: 42,
        fetchImpl,
        getDirtyFiles: () => ["i18n/translations/en.json"],
      })
    ).rejects.toThrow("uncommitted changes");
    expect(requestCount).toBe(0);
  });

  test("leaves original files unchanged when an export fails", async () => {
    const fileSystem = new MemoryFileSystem();
    const cwd = "/virtual/project";
    const paths = [
      `${cwd}/i18n/translations/zh.json`,
      `${cwd}/i18n/translations/en.json`,
      `${cwd}/i18n/translations/am.json`,
    ];
    paths.forEach((filePath, index) => fileSystem.files.set(filePath, `old bundle ${index}`));

    const fetchImpl: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      if (url.searchParams.get("languages") === "en") {
        return new Response("upstream unavailable", { status: 503 });
      }
      return createFetchMock({ zh: JSON.stringify(exportFixtures.zh), am: JSON.stringify(exportFixtures.am) })(
        input,
        init
      );
    };

    await expect(
      runPull({
        apiUrl: "http://localhost:8085",
        apiKey: "test-key",
        projectId: 42,
        cwd,
        currentKeys,
        fetchImpl,
        getDirtyFiles: () => [],
        fileSystem,
      })
    ).rejects.toThrow("en (503)");
    expect(paths.map((filePath) => fileSystem.files.get(filePath))).toEqual([
      "old bundle 0",
      "old bundle 1",
      "old bundle 2",
    ]);
  });

  test("rejects malformed and empty exports before writing", async () => {
    const fileSystem = new MemoryFileSystem();
    const cwd = "/virtual/project";
    const paths = [
      `${cwd}/i18n/translations/zh.json`,
      `${cwd}/i18n/translations/en.json`,
      `${cwd}/i18n/translations/am.json`,
    ];
    paths.forEach((filePath, index) => fileSystem.files.set(filePath, `old bundle ${index}`));

    let responseBody = "not-json";
    const fetchImpl: typeof fetch = async () => new Response(responseBody, { status: 200 });

    await expect(
      runPull({
        apiKey: "test-key",
        projectId: 42,
        cwd,
        currentKeys,
        fetchImpl,
        getDirtyFiles: () => [],
        fileSystem,
      })
    ).rejects.toThrow("not valid JSON");

    responseBody = "{}";
    await expect(
      runPull({
        apiKey: "test-key",
        projectId: 42,
        cwd,
        currentKeys,
        fetchImpl,
        getDirtyFiles: () => [],
        fileSystem,
      })
    ).rejects.toThrow("non-empty JSON object");
    expect(paths.map((filePath) => fileSystem.files.get(filePath))).toEqual([
      "old bundle 0",
      "old bundle 1",
      "old bundle 2",
    ]);
  });

  test("rolls back all bundles when installation fails", async () => {
    const fileSystem = new MemoryFileSystem();
    fileSystem.failRenameAt = 5;
    const cwd = "/virtual/project";
    const paths = [
      `${cwd}/i18n/translations/zh.json`,
      `${cwd}/i18n/translations/en.json`,
      `${cwd}/i18n/translations/am.json`,
    ];
    paths.forEach((filePath, index) => fileSystem.files.set(filePath, `old bundle ${index}`));

    await expect(
      runPull({
        apiUrl: "http://localhost:8085",
        apiKey: "test-key",
        projectId: 42,
        cwd,
        currentKeys,
        fetchImpl: createFetchMock(
          Object.fromEntries(
            Object.entries(exportFixtures).map(([locale, value]) => [
              locale,
              JSON.stringify(value),
            ])
          )
        ),
        getDirtyFiles: () => [],
        fileSystem,
      })
    ).rejects.toThrow("rename failed");
    expect(paths.map((filePath) => fileSystem.files.get(filePath))).toEqual([
      "old bundle 0",
      "old bundle 1",
      "old bundle 2",
    ]);
  });
});
