'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { ExpenseDatabase } from '@/types/database';
import { useState } from 'react';

interface DatabaseSwitcherProps {
  open: boolean;
  databases: ExpenseDatabase[];
  activeDatabaseId: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  onSelect: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
}

export function DatabaseSwitcher({
  open,
  databases,
  activeDatabaseId,
  onClose,
  onCreate,
  onSelect,
  onRename
}: DatabaseSwitcherProps) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] bg-black/35 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="mx-auto mt-16 w-full max-w-[430px] rounded-[30px] bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Expense Databases</h3>
              <button type="button" onClick={onClose} className="rounded-full bg-[#efeff1] p-2">
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              {databases.map((db) => {
                const isEditing = editingId === db.id;
                return (
                  <div key={db.id} className={`rounded-2xl px-4 py-3 ${db.id === activeDatabaseId ? 'bg-black text-white' : 'bg-[#f4f4f6] text-black'}`}>
                    <div className="flex items-center justify-between gap-2">
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full rounded-xl border border-app-border bg-white px-2 py-1 text-sm text-black outline-none"
                        />
                      ) : (
                        <button type="button" onClick={() => onSelect(db.id)} className="text-left font-semibold">
                          {db.name}
                        </button>
                      )}
                      <div className="flex items-center gap-1">
                        {db.id === activeDatabaseId && !isEditing && <span className="text-xs">Active</span>}
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await onRename(db.id, editingName);
                              setEditingId(null);
                              setEditingName('');
                            }}
                            className="rounded-full bg-white/90 p-2 text-black"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(db.id);
                              setEditingName(db.name);
                            }}
                            className={`rounded-full p-2 ${db.id === activeDatabaseId ? 'bg-white/20 text-white' : 'bg-white text-black'}`}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-app-border p-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New database name"
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  await onCreate(name);
                  setName('');
                }}
                className="rounded-full bg-black p-2 text-white"
                aria-label="Create database"
              >
                <Plus size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
