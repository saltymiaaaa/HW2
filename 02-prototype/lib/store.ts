import { seedServices } from "./seed";
import type { Schedule, Service, Snapshot } from "./types";

/**
 * State lives in the server process. That is enough for a prototype and for a
 * single Vercel deployment used by one person, and it keeps the project at one
 * deployable unit with no database to provision.
 *
 * The seam is here on purpose. Swapping this file for a Postgres or KV client
 * is the only change required to make the prototype multi user, because no
 * other file reads state directly.
 */

type Store = {
  services: Service[];
  events: { at: string; text: string }[];
};

declare global {
  // eslint-disable-next-line no-var
  var __exitCheckStore: Store | undefined;
}

function create(): Store {
  const empty = process.env.EXIT_CHECK_EMPTY === "1";
  return {
    services: empty ? [] : seedServices(),
    events: [
      {
        at: new Date().toISOString(),
        text: "Exit Check started. Scheduled runs are handled by /api/cron.",
      },
    ],
  };
}

function store(): Store {
  if (!globalThis.__exitCheckStore) globalThis.__exitCheckStore = create();
  return globalThis.__exitCheckStore;
}

export function listServices(): Service[] {
  return store().services;
}

export function getService(id: string): Service | undefined {
  return store().services.find((s) => s.id === id);
}

export function addService(service: Service): Service {
  store().services.push(service);
  log(`Added ${service.name} to the portfolio.`);
  return service;
}

export function removeService(id: string): boolean {
  const s = store();
  const i = s.services.findIndex((x) => x.id === id);
  if (i < 0) return false;
  const [gone] = s.services.splice(i, 1);
  log(`Removed ${gone.name} from the portfolio.`);
  return true;
}

export function setSchedule(id: string, schedule: Schedule): Service | undefined {
  const service = getService(id);
  if (!service) return undefined;
  service.schedule = schedule;
  log(`${service.name} is now checked ${schedule === "off" ? "never" : schedule}.`);
  return service;
}

export function recordSnapshot(id: string, snapshot: Snapshot): void {
  const service = getService(id);
  if (!service) return;
  service.snapshots.unshift(snapshot);
  service.snapshots = service.snapshots.slice(0, 12);
  log(
    `${service.name} checked. Verdict ${snapshot.verdict}, exit cost ${snapshot.exitCost}.`
  );
}

export function log(text: string): void {
  const s = store();
  s.events.unshift({ at: new Date().toISOString(), text });
  s.events = s.events.slice(0, 60);
}

export function listEvents() {
  return store().events;
}

export function resetStore(): void {
  globalThis.__exitCheckStore = create();
}

/** Services whose schedule says they are due for another run. */
export function dueServices(now = Date.now()): Service[] {
  const interval: Record<Schedule, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    off: Number.POSITIVE_INFINITY,
  };
  return listServices().filter((s) => {
    const days = interval[s.schedule];
    if (!Number.isFinite(days)) return false;
    const last = s.snapshots[0];
    if (!last) return true;
    const age = (now - Date.parse(last.finishedAt)) / (24 * 3600 * 1000);
    return age >= days;
  });
}
