import { IFeature } from './interfaces/feature-interface';

export const createRequest = (imageUri: string) => ({
  requests: [
    {
      features: [
        {
          type: 'TEXT_DETECTION',
        } as IFeature,
      ],
      image: {
        source: {
          imageUri: imageUri,
        },
      },
      imageContext: {
        languageHints: ['ko'], // 한국어
      },
    },
  ],
});
