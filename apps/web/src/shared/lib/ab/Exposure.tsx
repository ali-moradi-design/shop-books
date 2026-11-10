'use client';

import { useEffect } from 'react';
import { trackExposure } from './actions';
import type { ExperimentKey } from './experiments';

/**
 * Records that the visitor saw an experiment. From the browser, after the page
 * shows, so prefetches and bots that do not run scripts are not counted.
 */
export function Exposure({ experiment }: { experiment: ExperimentKey }) {
  useEffect(() => {
    void trackExposure(experiment);
  }, [experiment]);
  return null;
}
