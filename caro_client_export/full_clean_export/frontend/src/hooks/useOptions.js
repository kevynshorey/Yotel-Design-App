import { useState, useCallback, useMemo } from "react";
import generateOption from "../utils/generateOption";
import { validateOptionHardPhase1 } from "../utils/clientHardValidator";
import { scoreOption, getDefaultWeights } from "../utils/scoreOption";

const STORAGE_KEY = "barbados_project_state_v1_frontend";
const SCORING_KEY = "barbados_scoring_presets_v1";
const OWNER_KEY = "barbados_owner_v1";

function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

function loadState() {
  const raw = typeof window !== "undefined" ? window.localStorage?.getItem(STORAGE_KEY) : null;
  if (!raw) return null;
  return safeParse(raw);
}

function saveState(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function loadScoring() {
  const raw = typeof window !== "undefined" ? window.localStorage?.getItem(SCORING_KEY) : null;
  const parsed = raw ? safeParse(raw) : null;
  return parsed && typeof parsed === "object" ? parsed : null;
}

function saveScoring(next) {
  try {
    window.localStorage.setItem(SCORING_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function isOwner() {
  try {
    return window.localStorage.getItem(OWNER_KEY) === "1";
  } catch {
    return false;
  }
}

function normalizeWeights(weights) {
  const keys = Object.keys(getDefaultWeights());
  const sum = keys.reduce((acc, k) => acc + (weights[k] || 0), 0) || 1;
  const out = {};
  keys.forEach(k => { out[k] = (weights[k] || 0) / sum; });
  return out;
}

const BUILTIN_PRESETS = [
  {
    id: "default",
    name: "Balanced (default)",
    locked: true,
    weights: getDefaultWeights(),
  },
  {
    id: "cost-first",
    name: "Cost first",
    locked: true,
    weights: {
      ...getDefaultWeights(),
      cost_per_key: 0.22,
      room_count: 0.16,
      gia_efficiency: 0.12,
      sea_views: 0.10,
      outdoor_amenity: 0.08,
      building_height: 0.08,
      daylight_quality: 0.08,
      form_simplicity: 0.08,
      pad_mix: 0.08,
    },
  },
  {
    id: "views-first",
    name: "Views first",
    locked: true,
    weights: {
      ...getDefaultWeights(),
      sea_views: 0.22,
      room_count: 0.16,
      gia_efficiency: 0.12,
      cost_per_key: 0.10,
      outdoor_amenity: 0.10,
      building_height: 0.08,
      daylight_quality: 0.08,
      form_simplicity: 0.08,
      pad_mix: 0.06,
    },
  },
];

const INITIAL_PRESETS = [
  { form: "C", floorArea: 770, wingWidth: 14, storeys: 6, corridor: "double", ytRooms: 100, padUnits: 30, outdoorPos: "WEST" },
  { form: "U", floorArea: 770, wingWidth: 14, storeys: 6, corridor: "double", ytRooms: 100, padUnits: 30, outdoorPos: "WEST" },
  { form: "L", floorArea: 850, wingWidth: 14, storeys: 7, corridor: "double", ytRooms: 110, padUnits: 30, outdoorPos: "BOTH" },
  { form: "BAR_NS", floorArea: 770, wingWidth: 14, storeys: 6, corridor: "double", ytRooms: 90, padUnits: 30, outdoorPos: "WEST" },
  { form: "BAR", floorArea: 770, wingWidth: 14, storeys: 6, corridor: "double", ytRooms: 100, padUnits: 30, outdoorPos: "WEST" },
  { form: "C", floorArea: 950, wingWidth: 14, storeys: 7, corridor: "double", ytRooms: 120, padUnits: 40, outdoorPos: "BOTH" },
];

export default function useOptions() {
  const persisted = loadState();
  const scoringPersisted = loadScoring();

  const [ownerMode, setOwnerMode] = useState(() => (typeof window !== "undefined" ? isOwner() : false));
  const [customPresets, setCustomPresets] = useState(() => scoringPersisted?.customPresets || []);
  const [activePresetId, setActivePresetId] = useState(() => scoringPersisted?.activePresetId || "default");

  const allPresets = useMemo(() => {
    const merged = [
      ...BUILTIN_PRESETS.map(p => ({ ...p, weights: normalizeWeights(p.weights) })),
      ...(customPresets || []).map(p => ({ ...p, locked: false, weights: normalizeWeights(p.weights || {}) })),
    ];
    return merged;
  }, [customPresets]);

  const activePreset = useMemo(() => {
    return allPresets.find(p => p.id === activePresetId) || allPresets[0];
  }, [allPresets, activePresetId]);

  const activeWeights = activePreset?.weights || normalizeWeights(getDefaultWeights());

  const [options, setOptions] = useState(() =>
    (persisted?.options?.length ? persisted.options : INITIAL_PRESETS.map((p, i) => ({ params: p, meta: { designSet: "A", id: `OPT-A${i + 1}` } })))
      .map((entry, i) => {
        const p = entry.params || entry;
        const meta = entry.meta || { designSet: "A", id: `OPT-A${i + 1}` };
        const o = generateOption(p, meta.id);
        o.designSet = meta.designSet || "A";
        o.hardValidation = validateOptionHardPhase1(o);
        o.score = scoreOption(o, activeWeights);
        o.saved = !!entry.saved;
        o.committed = !!entry.committed;
        o.commitForced = !!entry.commitForced;
        o.committedAt = entry.committedAt || null;
        return o;
      })
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortBy, setSortBy] = useState("score");
  const [committedId, setCommittedId] = useState(persisted?.committedId || null);

  const addOption = useCallback((params, designSet = "A") => {
    setOptions(prev => {
      const id = `OPT-${designSet}${prev.length + 1}`;
      const o = generateOption(params, id);
      o.designSet = designSet;
      o.hardValidation = validateOptionHardPhase1(o);
      o.score = scoreOption(o, activeWeights);
      const next = [...prev, o];
      setSelectedIdx(next.length - 1);
      saveState({
        committedId,
        options: next.map(x => ({
          params: { form: x.form, floorArea: x.fp, wingWidth: x.wingWidth, storeys: x.storeys, corridor: x.corridor, ytRooms: x.ytRooms, padUnits: x.padUnits, outdoorPos: x.outdoorPos },
          meta: { id: x.id, designSet: x.designSet || "A" },
          saved: !!x.saved,
          committed: !!x.committed,
          commitForced: !!x.commitForced,
          committedAt: x.committedAt || null,
        })),
      });
      return next;
    });
  }, [committedId, activeWeights]);

  const saveOptionAnyway = useCallback((idx) => {
    setOptions(prev => {
      const next = prev.map((o, i) => (i === idx ? { ...o, saved: true } : o));
      saveState({
        committedId,
        options: next.map(x => ({
          params: { form: x.form, floorArea: x.fp, wingWidth: x.wingWidth, storeys: x.storeys, corridor: x.corridor, ytRooms: x.ytRooms, padUnits: x.padUnits, outdoorPos: x.outdoorPos },
          meta: { id: x.id, designSet: x.designSet || "A" },
          saved: !!x.saved,
          committed: !!x.committed,
          commitForced: !!x.commitForced,
          committedAt: x.committedAt || null,
        })),
      });
      return next;
    });
  }, [committedId]);

  const commitOption = useCallback((idx, { force = false } = {}) => {
    setOptions(prev => {
      const now = new Date().toISOString();
      const target = prev[idx];
      const hv = target?.hardValidation || {};
      const isValid = hv.isValid !== false && (hv.hardViolations?.length || 0) === 0;
      const forced = force || !isValid;

      const next = prev.map((o, i) => {
        if (i !== idx) return { ...o, committed: false };
        return { ...o, saved: true, committed: true, commitForced: forced, committedAt: now };
      });

      const nextCommittedId = next[idx]?.id || null;
      setCommittedId(nextCommittedId);

      saveState({
        committedId: nextCommittedId,
        options: next.map(x => ({
          params: { form: x.form, floorArea: x.fp, wingWidth: x.wingWidth, storeys: x.storeys, corridor: x.corridor, ytRooms: x.ytRooms, padUnits: x.padUnits, outdoorPos: x.outdoorPos },
          meta: { id: x.id, designSet: x.designSet || "A" },
          saved: !!x.saved,
          committed: !!x.committed,
          commitForced: !!x.commitForced,
          committedAt: x.committedAt || null,
        })),
      });

      return next;
    });
  }, []);

  const sorted = useMemo(() => {
    const s = [...options];
    if (sortBy === "score") s.sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
    else if (sortBy === "keys") s.sort((a, b) => b.totalKeys - a.totalKeys);
    else if (sortBy === "height") s.sort((a, b) => a.ht - b.ht);
    else if (sortBy === "views") s.sort((a, b) => b.wFac - a.wFac);
    else if (sortBy === "cost") s.sort((a, b) => a.cpk - b.cpk);
    return s;
  }, [options, sortBy]);

  const selected = options[selectedIdx] || options[0];

  const setOwnerOverride = useCallback((enabled) => {
    try {
      window.localStorage.setItem(OWNER_KEY, enabled ? "1" : "0");
    } catch {
      // ignore
    }
    setOwnerMode(!!enabled);
  }, []);

  const setActiveScoringPreset = useCallback((presetId) => {
    setActivePresetId(presetId);
    saveScoring({ activePresetId: presetId, customPresets });
    // re-score all options immediately
    const preset = [...BUILTIN_PRESETS, ...(customPresets || [])].find(p => p.id === presetId);
    const weights = normalizeWeights(preset?.weights || getDefaultWeights());
    setOptions(prev => prev.map(o => ({ ...o, score: scoreOption(o, weights) })));
  }, [customPresets]);

  const updateActiveWeights = useCallback((nextWeights, { allowLockedOverride = false } = {}) => {
    const preset = allPresets.find(p => p.id === activePresetId);
    if (!preset) return;
    if (preset.locked && !allowLockedOverride && !ownerMode) return;

    const normalized = normalizeWeights(nextWeights);

    if (preset.locked) {
      // owner editing a built-in preset: we store it as a custom override with same id suffix
      const overrideId = `${preset.id}__override`;
      const nextCustom = (customPresets || []).filter(p => p.id !== overrideId);
      nextCustom.push({ id: overrideId, name: `${preset.name} (override)`, weights: normalized });
      setCustomPresets(nextCustom);
      setActivePresetId(overrideId);
      saveScoring({ activePresetId: overrideId, customPresets: nextCustom });
    } else {
      const nextCustom = (customPresets || []).map(p => (p.id === preset.id ? { ...p, weights: normalized } : p));
      setCustomPresets(nextCustom);
      saveScoring({ activePresetId, customPresets: nextCustom });
    }

    setOptions(prev => prev.map(o => ({ ...o, score: scoreOption(o, normalized) })));
  }, [activePresetId, allPresets, customPresets, ownerMode]);

  const savePreset = useCallback((name, weights) => {
    const id = `custom-${Date.now().toString(36)}`;
    const normalized = normalizeWeights(weights || getDefaultWeights());
    const nextCustom = [...(customPresets || []), { id, name: name || "Custom preset", weights: normalized }];
    setCustomPresets(nextCustom);
    setActivePresetId(id);
    saveScoring({ activePresetId: id, customPresets: nextCustom });
    setOptions(prev => prev.map(o => ({ ...o, score: scoreOption(o, normalized) })));
  }, [customPresets]);

  const deletePreset = useCallback((id) => {
    const nextCustom = (customPresets || []).filter(p => p.id !== id);
    setCustomPresets(nextCustom);
    const nextActive = activePresetId === id ? "default" : activePresetId;
    setActivePresetId(nextActive);
    saveScoring({ activePresetId: nextActive, customPresets: nextCustom });
  }, [customPresets, activePresetId]);

  return {
    options,
    sorted,
    selected,
    selectedIdx,
    setSelectedIdx,
    addOption,
    saveOptionAnyway,
    commitOption,
    committedId,
    scoring: {
      ownerMode,
      setOwnerOverride,
      presets: allPresets,
      activePresetId,
      activePreset,
      activeWeights,
      setActiveScoringPreset,
      updateActiveWeights,
      savePreset,
      deletePreset,
    },
    sortBy,
    setSortBy,
  };
}
