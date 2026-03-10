type EnvTools = {
  int: (key: string, defaultValue: number) => number;
};

export default ({ env }: { env: EnvTools }) => ({
  upload: {
    config: {
      provider: 'local',
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT_MB', 25) * 1024 * 1024,
      mimeTypes: ['image/jpeg', 'image/png'],
      breakpoints: {
        xlarge: 2560,
        large: 1920,
        medium: 1280,
        small: 768,
        xsmall: 480,
      },
    },
  },
});
