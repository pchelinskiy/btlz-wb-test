import env from "#config/env/env.js";

export const pinoConfig = {
    formatters: {
        level: (label: string) => {
            return {
                level: label,
            };
        },
    },

    level: env.LOG_LEVEL,

    transport:
        env.NODE_ENV !== "production"
            ? {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                  },
              }
            : undefined,
};
