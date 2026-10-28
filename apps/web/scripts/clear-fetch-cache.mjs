// Runs before `next dev`: the dev fetch cache lives on disk and survives restarts, so a
// catalog cached from an earlier (or empty) database would otherwise stay for an hour.
import { rmSync } from 'node:fs';

rmSync('.next/dev/cache/fetch-cache', { recursive: true, force: true });
