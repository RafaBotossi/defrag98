interface ModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ): void | Promise<void>;
}
export function registerSimulationTools(read: () => object, pause: () => void) {
  const context = (document as Document & { modelContext?: ModelContext })
    .modelContext;
  if (!context?.registerTool) return () => {};
  const lifecycle = new AbortController();
  const register = (
    name: string,
    description: string,
    action: () => object,
    readOnlyHint: boolean,
  ) => {
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name,
            description,
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint, untrustedContentHint: false },
            execute(input) {
              if (
                !input ||
                typeof input !== "object" ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error("Expected an empty object");
              return action();
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional capability; visible controls remain available. */
    }
  };
  register(
    "read_defrag_status",
    "Read virtual disk progress and activity.",
    read,
    true,
  );
  register(
    "pause_defrag",
    "Pause the virtual disk simulation.",
    () => {
      pause();
      return read();
    },
    false,
  );
  return () => lifecycle.abort();
}
