/**
 * CoreValley Icon — a named wrapper over Phosphor Icons.
 *
 * DOCUMENTED DEVIATION: the design system hand-rolls a 30-glyph Lucide subset
 * (design_system/components/display/Icon.jsx). That set is too small for the
 * portal — it has no glyphs for API keys, invoices, certificates, clusters or
 * charts. Phosphor (MIT, no attribution) covers all of them and ships six
 * weights, which lets active/inactive states differ by stroke weight rather
 * than only by colour. This mirrors the design system's own precedent of
 * documenting Lucide as a substitution for the brandbook's absent icon set.
 *
 * Imports come from `@phosphor-icons/react/dist/ssr` so this stays a server
 * component; the package's default entry uses React context and would force
 * "use client" on every consumer.
 *
 * Every glyph the app may use is registered in ICONS below. Keeping the union
 * closed means a typo is a type error, and swapping icon libraries later is a
 * change to this one file.
 */
import {
  Pulse,
  ArrowRight,
  ArrowSquareOut,
  Bell,
  Books,
  Broadcast,
  Buildings,
  CaretDown,
  CaretRight,
  ChartLine,
  Check,
  CheckCircle,
  CirclesThreePlus,
  Copy,
  CpuIcon,
  CurrencyCircleDollar,
  Database,
  Detective,
  Eye,
  FileText,
  FlaskIcon,
  FolderOpen,
  Gauge,
  GearSix,
  Globe,
  GraduationCap,
  Graph,
  HardDrives,
  Heartbeat,
  Info,
  Key,
  Leaf,
  Lightning,
  List,
  LockKey,
  MagnifyingGlass,
  MapPin,
  Minus,
  Mountains,
  Notebook,
  Package,
  PaperPlaneTilt,
  Pause,
  Play,
  Plus,
  Power,
  Receipt,
  Repeat,
  Rocket,
  ShieldCheck,
  SignOut,
  Sliders,
  Stack,
  Terminal,
  TrendUp,
  User,
  UsersThree,
  Warning,
  X,
} from "@phosphor-icons/react/dist/ssr";

const ICONS = {
  activity: Pulse,
  "arrow-right": ArrowRight,
  audit: Detective,
  bell: Bell,
  billing: Receipt,
  broadcast: Broadcast,
  building: Buildings,
  "caret-down": CaretDown,
  "caret-right": CaretRight,
  certificate: ShieldCheck,
  chart: ChartLine,
  check: Check,
  "check-circle": CheckCircle,
  cluster: CirclesThreePlus,
  compliance: FileText,
  copy: Copy,
  cost: CurrencyCircleDollar,
  cpu: CpuIcon,
  database: Database,
  docs: Books,
  external: ArrowSquareOut,
  eye: Eye,
  folder: FolderOpen,
  gauge: Gauge,
  globe: Globe,
  graph: Graph,
  health: Heartbeat,
  info: Info,
  key: Key,
  lab: FlaskIcon,
  leaf: Leaf,
  location: MapPin,
  lock: LockKey,
  menu: List,
  minus: Minus,
  mountain: Mountains,
  node: HardDrives,
  notebook: Notebook,
  package: Package,
  pause: Pause,
  play: Play,
  plus: Plus,
  power: Power,
  region: Globe,
  rotate: Repeat,
  scale: Sliders,
  search: MagnifyingGlass,
  send: PaperPlaneTilt,
  settings: GearSix,
  "sign-out": SignOut,
  slice: Stack,
  storage: Database,
  team: UsersThree,
  terminal: Terminal,
  trend: TrendUp,
  university: GraduationCap,
  user: User,
  warning: Warning,
  x: X,
  launch: Rocket,
  zap: Lightning,
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Phosphor weights. `regular` is the default chrome; `bold` marks active
 *  states; `duotone` is reserved for glass feature cards. */
export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export interface IconProps {
  name: IconName;
  /** Pixel size. Defaults to 18 to sit beside 13px JetBrains Mono. */
  size?: number;
  weight?: IconWeight;
  className?: string;
  /** Overrides `currentColor`. Prefer a text-* utility on the parent. */
  color?: string;
}

export function Icon({
  name,
  size = 18,
  weight = "regular",
  className,
  color,
}: IconProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      size={size}
      weight={weight}
      color={color}
      className={className}
      aria-hidden="true"
      // Keeps glyphs from being squashed by flex parents, matching the
      // design system Icon's `flex: none`.
      style={{ flex: "none", display: "block" }}
    />
  );
}
