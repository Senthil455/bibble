"use client";

import { MapPreview } from "@/components/map/map-preview";
import { getMapById, getMapProgress } from "@/data/sample-maps";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { LearningMap } from "@/types/map";
import { ArrowUpRight, Pencil, Sparkles, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import styles from "./saved-maps.module.css";

const storageKey = "bibble-maps";

export function SavedMaps() {
  const [maps, setMaps, hydrated] = useLocalStorage<LearningMap[]>(storageKey, []);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // The list lives in the browser, so it is rendered after hydration. Nothing
  // is shown during server rendering, which keeps the markup deterministic.
  if (!hydrated) return null;

  const savedMaps = (Array.isArray(maps) ? maps : []).filter(
    (map) => map && typeof map.id === "string" && Array.isArray(map.bibbles),
  );

  const removeMap = (id: string) => {
    setMaps((currentMaps) =>
      (Array.isArray(currentMaps) ? currentMaps : []).filter((map) => map.id !== id),
    );
    setPendingDeleteId(null);
  };

  return (
    <section className={styles.section} aria-labelledby="saved-maps-title">
      <div className={styles.heading}>
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> Kept in this browser
          </span>
          <h2 id="saved-maps-title">Your saved maps</h2>
          <p className={styles.copy}>
            {savedMaps.length
              ? `${savedMaps.length} ${
                  savedMaps.length === 1 ? "map lives" : "maps live"
                } only in this browser. Open one to keep going, or clear space for a new idea.`
              : "Maps you create are stored on this device. This is where they will wait for you."}
          </p>
        </div>
        <Link href="/create" className="text-link">
          Create a map <ArrowUpRight size={16} />
        </Link>
      </div>

      {savedMaps.length === 0 ? (
        <div className={styles.empty}>
          <Sparkles size={20} />
          <h3>Nothing saved yet</h3>
          <p>Start a map and it will show up here, even after you close the tab.</p>
          <Link href="/create" className="text-link">
            Make your first map <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {savedMaps.map((map) => {
            const progress = getMapProgress(map);
            const editedCopy = Boolean(getMapById(map.id));
            const needsConfirm = pendingDeleteId === map.id;

            return (
              <article className="map-card" key={map.id}>
                <div className="map-card-preview">
                  <MapPreview map={map} compact />
                  <span className="map-card-count">
                    <Star size={13} /> {map.bibbles.length} bibbles
                  </span>
                </div>
                <div className="map-card-body">
                  <div className="map-card-meta">
                    <span>{map.category}</span>
                    <span>{progress}% grown</span>
                  </div>
                  <h2>{map.title}</h2>
                  <p>{map.description}</p>
                  <div className="map-card-footer">
                    <div className="tiny-progress">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <Link
                      href={`/map/${map.id}`}
                      className="round-link"
                      aria-label={`Open ${map.title}`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  <div className={styles.actions}>
                    <Link href={`/map/${map.id}/edit`} className={styles.action}>
                      <Pencil size={14} /> Edit
                    </Link>
                    {needsConfirm ? (
                      <span className={styles.confirm}>
                        Delete this map?
                        <button type="button" className={styles.danger} onClick={() => removeMap(map.id)}>
                          Yes, delete
                        </button>
                        <button type="button" className={styles.action} onClick={() => setPendingDeleteId(null)}>
                          Keep it
                        </button>
                      </span>
                    ) : (
                      <button type="button" className={styles.action} onClick={() => setPendingDeleteId(map.id)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                    {editedCopy && <span className={styles.badge}>edited copy</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
