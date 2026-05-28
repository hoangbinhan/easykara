import React from 'react';

interface SyllableEditModalProps {
  editingSyl: { lineIdx: number; sylIdx: number; text: string } | null;
  setEditingSyl: (val: { lineIdx: number; sylIdx: number; text: string } | null) => void;
  handleSaveEdit: () => void;
}

export const SyllableEditModal: React.FC<SyllableEditModalProps> = ({
  editingSyl,
  setEditingSyl,
  handleSaveEdit,
}) => {
  if (!editingSyl) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-blackout/60 backdrop-blur-sm z-[999]"
        onClick={() => setEditingSyl(null)}
      />

      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-graphite-deep border border-graphite-light rounded-[4px] p-6 z-[1000] w-80 flex flex-col gap-3.5 shadow-lg">
        <h4 className="font-sans text-sm font-semibold text-whiteout">Edit Syllable</h4>
        <input
          type="text"
          className="w-full px-3.5 py-2.5 bg-blackout border border-graphite-light rounded-[4px] text-whiteout font-sans text-xs focus:border-neon-glow outline-none transition-colors"
          value={editingSyl.text}
          onChange={(e) => setEditingSyl({ ...editingSyl, text: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditingSyl(null)}
            className="px-4 py-1.5 bg-transparent border border-graphite-light rounded-full text-whiteout font-sans text-xs font-semibold hover:bg-neon-muted/10 hover:border-neon-glow transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-4 py-1.5 bg-whiteout text-graphite-deep font-sans text-xs font-semibold rounded-full hover:bg-cloud active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};
