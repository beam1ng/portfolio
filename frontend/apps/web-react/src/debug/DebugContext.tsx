import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SKILL_NAV_DEFAULTS, type SkillNavParams } from './skillNavParams';

export type DockSide = 'left' | 'right';

interface DebugState {
  skillNav: SkillNavParams;
  setSkillNav: (patch: Partial<SkillNavParams>) => void;
  resetSkillNav: () => void;
  dock: DockSide;
  setDock: (side: DockSide) => void;
  minimized: boolean;
  setMinimized: (value: boolean) => void;
}

interface Persisted {
  skillNav?: Partial<SkillNavParams>;
  dock?: DockSide;
  minimized?: boolean;
}

const STORAGE_KEY = 'portfolio.debug.v1';
const DebugContext = createContext<DebugState | null>(null);

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : {};
  } catch {
    return {};
  }
}

export function DebugProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersisted, []);
  const [skillNav, setSkillNavState] = useState<SkillNavParams>({ ...SKILL_NAV_DEFAULTS, ...initial.skillNav });
  const [dock, setDock] = useState<DockSide>(initial.dock ?? 'right');
  const [minimized, setMinimized] = useState<boolean>(initial.minimized ?? false);

  useEffect(() => {
    const data: Persisted = { skillNav, dock, minimized };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage quota / disabled storage
    }
  }, [skillNav, dock, minimized]);

  const setSkillNav = useCallback(
    (patch: Partial<SkillNavParams>) => setSkillNavState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const resetSkillNav = useCallback(() => setSkillNavState(SKILL_NAV_DEFAULTS), []);

  const value = useMemo<DebugState>(
    () => ({ skillNav, setSkillNav, resetSkillNav, dock, setDock, minimized, setMinimized }),
    [skillNav, setSkillNav, resetSkillNav, dock, minimized],
  );

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebug(): DebugState {
  const ctx = useContext(DebugContext);
  if (!ctx) throw new Error('useDebug must be used within a DebugProvider');
  return ctx;
}

/** Read-only params for consumers (e.g. SkillsPage); defaults when no provider. */
export function useSkillNavParams(): SkillNavParams {
  const ctx = useContext(DebugContext);
  return ctx ? ctx.skillNav : SKILL_NAV_DEFAULTS;
}
